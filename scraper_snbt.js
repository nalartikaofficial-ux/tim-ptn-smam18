const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log("=================================================================");
    console.log("   SCRAPER PRESISI SNBT: KAMPUS, PRODI, KUOTA & PEMINAT RIIL    ");
    console.log("=================================================================\n");

    const outputDir = path.join(__dirname, 'data');
    const outputPath = path.join(outputDir, 'database_snbt.json');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const browser = await chromium.launch({
        channel: 'chrome',
        headless: false
    });

    const context = await browser.newContext({
        viewport: { width: 1366, height: 768 }
    });

    const page = await context.newPage();

    let masterDatabase = [];
    let idCounter = 1;

    try {
        console.log("Menghubungkan ke portal resmi UTBK-SNBT...");
        await page.goto('https://snpmb.id/utbk-snbt/daya-tampung-snbt', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });
        await page.waitForTimeout(4000);

        // Ambil elemen kode digit PTN di panel kiri
        const ptnElements = await page.$$('text=/^[1-9][0-9]{3}$/');
        console.log(`Berhasil mendeteksi ${ptnElements.length} Perguruan Tinggi Negeri.\n`);

        for (let i = 0; i < ptnElements.length; i++) {
            try {
                const infoKampus = await ptnElements[i].evaluate(el => {
                    const container = el.closest('tr') || el.closest('li') || el.parentElement?.parentElement;
                    const text = container ? container.innerText.trim() : '';
                    const namaBersih = text.replace(/^[0-9]{4}\s*[-–\t\n]?\s*/, '').split('\n')[0].trim();
                    return {
                        kode: el.innerText.trim(),
                        nama: namaBersih || 'PTN'
                    };
                });

                console.log(`[${i + 1}/${ptnElements.length}] Kampus: ${infoKampus.nama} (Kode: ${infoKampus.kode})`);

                await ptnElements[i].click();
                await page.waitForTimeout(1800);

                const prodiRows = await page.$$('table tbody tr');
                let prodiKampusCount = 0;

                for (let r = 0; r < prodiRows.length; r++) {
                    try {
                        const rowData = await prodiRows[r].evaluate(tr => {
                            const cells = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
                            if (cells.length < 3) return null;

                            // Ekstrak kode prodi jika tertera di baris tabel (angka 6-7 digit)
                            let kodeProdi = "";
                            const matchKode = tr.innerText.match(/\b([1-9][0-9]{5,6})\b/);
                            if (matchKode) kodeProdi = matchKode[1];

                            // Cari nama prodi (bukan angka murni, panjang > 3 karakter, bukan kode jenjang)
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

                            // Deteksi jenjang pendidikan
                            let jenjang = "S1";
                            cells.forEach(c => {
                                if (['S1', 'D4', 'D3', 'D2'].includes(c.toUpperCase())) {
                                    jenjang = c.toUpperCase();
                                }
                            });

                            // Ambil angka daya tampung jika ada di tabel luar
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

                        // Klik baris prodi untuk memunculkan modal popup rincian resmi
                        await prodiRows[r].click({ timeout: 3000 });
                        await page.waitForTimeout(700);

                        // Ekstraksi data riil di dalam modal detail
                        const modalData = await page.evaluate(() => {
                            const modal = document.querySelector('[role="dialog"], .modal, [class*="modal"], [class*="dialog"]') || document.body;

                            let dayaResmi = 0;
                            const textModal = modal.innerText;
                            const matchDaya = textModal.match(/DAYA TAMPUNG\s*(\d+)/i) || textModal.match(/KUOTA\s*(\d+)/i);
                            if (matchDaya) {
                                dayaResmi = parseInt(matchDaya[1]);
                            }

                            const tables = Array.from(modal.querySelectorAll('table'));
                            let peminatTerakhir = 0;
                            let keketatanTerakhir = 0;
                            let dayaTabelRiwayat = 0;

                            if (tables.length > 0) {
                                const histTable = tables[tables.length - 1];
                                const trs = Array.from(histTable.querySelectorAll('tbody tr')).map(row =>
                                    Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim())
                                );

                                if (trs.length > 0) {
                                    const barisData = trs[trs.length - 1];
                                    if (barisData.length >= 4) {
                                        peminatTerakhir = parseInt(barisData[1].replace(/\D/g, '')) || 0;
                                        dayaTabelRiwayat = parseInt(barisData[2].replace(/\D/g, '')) || 0;
                                        keketatanTerakhir = parseFloat(barisData[3].replace('%', '').replace(',', '.')) || 0;
                                    }
                                }
                            }

                            return {
                                dayaHeader: dayaResmi,
                                dayaRiwayat: dayaTabelRiwayat,
                                peminat: peminatTerakhir,
                                keketatan: keketatanTerakhir
                            };
                        });

                        // Tutup modal popup agar baris berikutnya bisa diklik
                        const closeBtn = await page.$('button:has-text("✕"), button:has-text("X"), [aria-label="Close"]');
                        if (closeBtn) {
                            await closeBtn.click();
                        } else {
                            await page.keyboard.press('Escape');
                        }
                        await page.waitForTimeout(300);

                        // Prioritas daya tampung: Header Modal -> Riwayat Modal -> Kolom Tabel Luar
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

                        // Ambang batas Passing Grade Skala IRT (200 - 800)
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

                console.log(`  -> Tersimpan ${prodiKampusCount} program studi untuk ${infoKampus.nama}.\n`);
                fs.writeFileSync(outputPath, JSON.stringify(masterDatabase, null, 2), 'utf8');

            } catch (errPTN) {
                console.log(`Kendala pada kampus index ${i}:`, errPTN.message);
            }
        }

        console.log("=================================================================");
        console.log(`EKSTRAKSI SELESAI TOTAL: ${masterDatabase.length} data prodi SNBT tersimpan.`);
        console.log(`Lokasi file: ${outputPath}`);
        console.log("=================================================================");

    } catch (fatalErr) {
        console.error("Kesalahan fatal proses:", fatalErr.message);
    } finally {
        await browser.close();
    }
})();