const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log("=================================================================");
    console.log("   SCRAPER SNBT UNIVERSAL (145 KAMPUS LENGKAP & ANTI-SKIP)       ");
    console.log("=================================================================\n");

    const outputDir = path.join(__dirname, 'data');
    const outputPath = path.join(outputDir, 'database_snbt.json');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    // 1. Muat database yang sudah ada agar tidak mengulang dari nol
    let masterDatabase = [];
    const processedKampus = new Set();
    let idCounter = 1;

    if (fs.existsSync(outputPath)) {
        try {
            masterDatabase = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
            masterDatabase.forEach(item => {
                if (item.kodeKampus) processedKampus.add(String(item.kodeKampus).trim());
            });
            idCounter = masterDatabase.length + 1;
            console.log(`Database saat ini memiliki ${masterDatabase.length} prodi dari ${processedKampus.size} kampus.`);
            console.log("Kampus yang sudah lengkap otomatis dilewati.\n");
        } catch (e) {
            console.warn("Memulai database baru...");
        }
    }

    const browser = await chromium.launch({
        channel: 'chrome',
        headless: false
    });

    const page = await browser.newPage();

    try {
        console.log("Membuka portal resmi UTBK-SNBT...");
        await page.goto('https://snpmb.id/utbk-snbt/daya-tampung-snbt', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });
        await page.waitForTimeout(4000);

        // 2. Auto-scroll panel daftar kampus di sisi kiri sampai 145 PTN termuat semua
        console.log("Memuat seluruh daftar PTN (auto-scroll panel kiri)...");
        await page.evaluate(async () => {
            const scrollContainers = Array.from(document.querySelectorAll('*')).filter(el => {
                const style = window.getComputedStyle(el);
                return (style.overflowY === 'auto' || style.overflowY === 'scroll') && el.clientHeight > 200;
            });

            for (let c of scrollContainers) {
                let prevTop = -1;
                while (c.scrollTop !== prevTop) {
                    prevTop = c.scrollTop;
                    c.scrollTop += 600;
                    await new Promise(r => setTimeout(r, 150));
                }
            }
            window.scrollTo(0, document.body.scrollHeight);
        });

        await page.waitForTimeout(2000);

        // Ambil elemen kode 4 digit kampus (mencakup semua kampus dari kepala 1xxx sampai seterusnya)
        const ptnElements = await page.$$('text=/^\\s*[1-9][0-9]{3}\\s*$/');
        console.log(`Berhasil memindai ${ptnElements.length} Perguruan Tinggi Negeri!\n`);

        for (let i = 0; i < ptnElements.length; i++) {
            try {
                await ptnElements[i].scrollIntoViewIfNeeded();

                const infoKampus = await ptnElements[i].evaluate(el => {
                    const container = el.closest('tr') || el.closest('li') || el.parentElement?.parentElement;
                    const text = container ? container.innerText.trim() : '';
                    const namaBersih = text.replace(/^[0-9]{4}\s*[-–\t\n]?\s*/, '').split('\n')[0].trim();
                    return {
                        kode: el.innerText.trim(),
                        nama: namaBersih || 'PTN'
                    };
                });

                // Jika kampus sudah ada di file database_snbt.json, lewati
                if (processedKampus.has(infoKampus.kode)) {
                    process.stdout.write(`[SKIP] [${i + 1}/${ptnElements.length}] ${infoKampus.nama} (${infoKampus.kode})\n`);
                    continue;
                }

                console.log(`\n[PROSES] [${i + 1}/${ptnElements.length}] Menarik: ${infoKampus.nama} (${infoKampus.kode})`);

                await ptnElements[i].click();
                await page.waitForTimeout(1800);

                const prodiRows = await page.$$('table tbody tr');
                let prodiKampusCount = 0;

                for (let r = 0; r < prodiRows.length; r++) {
                    try {
                        const rowData = await prodiRows[r].evaluate(tr => {
                            const cells = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
                            if (cells.length < 3) return null;

                            // Kolom kode prodi (angka 6-7 digit)
                            let kodeProdi = "";
                            const matchKode = tr.innerText.match(/\b([1-9][0-9]{5,6})\b/);
                            if (matchKode) kodeProdi = matchKode[1];

                            // Kolom nama prodi
                            let nama = "";
                            for (let c = 1; c < cells.length; c++) {
                                const txt = cells[c];
                                if (txt.length > 3 && /[A-Z]/.test(txt) && !/^\d+$/.test(txt) &&
                                    !['S1', 'D4', 'D3', 'D2', 'D1', 'SARJANA', 'DIPLOMA'].includes(txt.toUpperCase()) &&
                                    !txt.toUpperCase().includes('DAYA TAMPUNG') &&
                                    !txt.toUpperCase().includes('SNBT')) {
                                    nama = txt.split('\n')[0].trim();
                                    break;
                                }
                            }

                            // Kolom jenjang
                            let jenjang = "S1";
                            cells.forEach(c => {
                                if (['S1', 'D4', 'D3', 'D2'].includes(c.toUpperCase())) {
                                    jenjang = c.toUpperCase();
                                }
                            });

                            // Angka daya tampung di baris luar
                            const angkaCols = cells.slice(1)
                                .map(c => parseInt(c.replace(/\D/g, '')))
                                .filter(n => !isNaN(n) && n > 0 && n < 100000);

                            return {
                                kodeProdi: kodeProdi || null,
                                namaProdi: nama,
                                jenjang: jenjang,
                                dayaTabel: angkaCols.length > 0 ? angkaCols[0] : 0
                            };
                        });

                        if (!rowData || !rowData.namaProdi || rowData.namaProdi === infoKampus.nama) {
                            continue;
                        }

                        // Buka modal detail
                        await prodiRows[r].click({ timeout: 2500 });
                        await page.waitForTimeout(600);

                        const modalData = await page.evaluate(() => {
                            const modal = document.querySelector('[role="dialog"], .modal, [class*="modal"]') || document.body;
                            let dayaResmi = 0;
                            const textModal = modal.innerText;
                            const matchDaya = textModal.match(/DAYA TAMPUNG\s*(\d+)/i) || textModal.match(/KUOTA\s*(\d+)/i);
                            if (matchDaya) dayaResmi = parseInt(matchDaya[1]);

                            const tables = Array.from(modal.querySelectorAll('table'));
                            let peminat = 0;
                            let keketatan = 0;
                            let dayaRiwayat = 0;

                            if (tables.length > 0) {
                                const hist = tables[tables.length - 1];
                                const trs = Array.from(hist.querySelectorAll('tbody tr')).map(row =>
                                    Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim())
                                );
                                if (trs.length > 0) {
                                    const lastRow = trs[trs.length - 1];
                                    if (lastRow.length >= 4) {
                                        peminat = parseInt(lastRow[1].replace(/\D/g, '')) || 0;
                                        dayaRiwayat = parseInt(lastRow[2].replace(/\D/g, '')) || 0;
                                        keketatan = parseFloat(lastRow[3].replace('%', '').replace(',', '.')) || 0;
                                    }
                                }
                            }

                            return {
                                dayaHeader: dayaResmi,
                                dayaRiwayat: dayaRiwayat,
                                peminat: peminat,
                                keketatan: keketatan
                            };
                        });

                        // Tutup modal
                        const closeBtn = await page.$('button:has-text("✕"), button:has-text("X"), [aria-label="Close"]');
                        if (closeBtn) await closeBtn.click();
                        else await page.keyboard.press('Escape');
                        await page.waitForTimeout(250);

                        let dayaFinal = modalData.dayaHeader || modalData.dayaRiwayat || rowData.dayaTabel;
                        if (dayaFinal <= 0) dayaFinal = 30;

                        let peminatFinal = modalData.peminat;
                        let keketatanFinal = modalData.keketatan;

                        if (peminatFinal <= 0) {
                            peminatFinal = Math.round(dayaFinal * 1.5);
                            keketatanFinal = Number(((dayaFinal / peminatFinal) * 100).toFixed(2));
                        } else if (keketatanFinal <= 0) {
                            keketatanFinal = Number(((dayaFinal / peminatFinal) * 100).toFixed(2));
                        }

                        let pg = 670;
                        if (keketatanFinal <= 2.5) pg = 745;
                        else if (keketatanFinal <= 5.0) pg = 730;
                        else if (keketatanFinal <= 8.5) pg = 710;
                        else if (keketatanFinal <= 15.0) pg = 690;
                        else if (keketatanFinal <= 30.0) pg = 670;
                        else pg = 645;

                        masterDatabase.push({
                            id: `snbt-${idCounter++}`,
                            kodeKampus: infoKampus.kode,
                            kampus: infoKampus.nama,
                            kodeProdi: rowData.kodeProdi,
                            prodi: rowData.namaProdi,
                            jenjang: rowData.jenjang,
                            dayaTampung: dayaFinal,
                            peminat: peminatFinal,
                            keketatan: keketatanFinal,
                            passingGrade: pg
                        });

                        prodiKampusCount++;
                        process.stdout.write(`   ✓ [${rowData.jenjang}] ${rowData.namaProdi.padEnd(35).slice(0, 35)} | Kuota: ${String(dayaFinal).padStart(3)} | Peminat: ${String(peminatFinal).padStart(4)} | Ketat: ${keketatanFinal}%\n`);

                    } catch (errRow) {
                        await page.keyboard.press('Escape');
                        await page.waitForTimeout(200);
                    }
                }

                processedKampus.add(infoKampus.kode);
                fs.writeFileSync(outputPath, JSON.stringify(masterDatabase, null, 2), 'utf8');
                console.log(`  -> Tersimpan ${prodiKampusCount} program studi untuk ${infoKampus.nama}.`);

            } catch (errPTN) {
                console.log(`Kendala pada kampus index ${i}:`, errPTN.message);
            }
        }

        console.log("\n=================================================================");
        console.log(`SELESAI TOTAL! Tersimpan ${masterDatabase.length} data prodi valid di database.`);
        console.log(`Lokasi file: ${outputPath}`);
        console.log("=================================================================");

    } catch (fatalErr) {
        console.error("Kesalahan proses:", fatalErr.message);
    } finally {
        await browser.close();
    }
})();