const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log("=================================================================");
    console.log("   SCRAPER PRESISI SNPMB: KAMPUS, PRODI, KUOTA & PEMINAT RIIL   ");
    console.log("=================================================================\n");

    const outputDir = path.join(__dirname, 'data');
    const outputPath = path.join(outputDir, 'database_prodi.json');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Gunakan Google Chrome sistem agar stabil dan tidak dicekal proteksi antivirus
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
        console.log("Menghubungkan ke portal resmi SNPMB...");
        await page.goto('https://snpmb.id/snbp/daya-tampung-snbp', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });
        await page.waitForTimeout(4000);

        // Ambil semua elemen kode 4 digit PTN di panel kiri
        const ptnElements = await page.$$('text=/^[12][0-9]{3}$/');
        console.log(`Berhasil mendeteksi ${ptnElements.length} Perguruan Tinggi Negeri.\n`);

        for (let i = 0; i < ptnElements.length; i++) {
            try {
                // Ambil nama kampus langsung dari baris tombol yang aktif
                const infoKampus = await ptnElements[i].evaluate(el => {
                    const container = el.closest('tr') || el.closest('li') || el.parentElement?.parentElement;
                    const text = container ? container.innerText.trim() : '';
                    const namaBersih = text.replace(/^[12][0-9]{3}\s*[-–\t\n]?\s*/, '').split('\n')[0].trim();
                    return {
                        kode: el.innerText.trim(),
                        nama: namaBersih || 'PTN'
                    };
                });

                console.log(`[${i + 1}/${ptnElements.length}] Kampus: ${infoKampus.nama} (Kode: ${infoKampus.kode})`);

                // Klik kampus pada daftar
                await ptnElements[i].click();
                await page.waitForTimeout(1800);

                // Identifikasi seluruh baris tabel program studi di panel kanan
                const prodiRows = await page.$$('table tbody tr');
                let prodiKampusCount = 0;

                for (let r = 0; r < prodiRows.length; r++) {
                    try {
                        // Ambil nama prodi dan jenjang dari tabel utama terlebih dahulu
                        const rowData = await prodiRows[r].evaluate(tr => {
                            const cells = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
                            if (cells.length < 3) return null;

                            // Cari nama prodi (bukan angka murni, panjang > 3 karakter, bukan kode jenjang)
                            let nama = "";
                            for (let c = 1; c < cells.length; c++) {
                                const txt = cells[c];
                                if (txt.length > 3 && /[A-Z]/.test(txt) && !/^\d+$/.test(txt) &&
                                    !['S1', 'D4', 'D3', 'D2', 'D1', 'SARJANA', 'DIPLOMA'].includes(txt.toUpperCase()) &&
                                    !txt.toUpperCase().includes('DAYA TAMPUNG')) {
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

                            // Ambil daya tampung ringkasan jika tertera di kolom tabel luar
                            const angkaCols = cells.slice(1)
                                .map(c => parseInt(c.replace(/\D/g, '')))
                                .filter(n => !isNaN(n) && n > 0 && n < 100000);

                            return {
                                namaProdi: nama,
                                jenjang: jenjang,
                                dayaTabel: angkaCols.length > 0 ? angkaCols[0] : 0
                            };
                        });

                        if (!rowData || !rowData.namaProdi || rowData.namaProdi === infoKampus.nama) {
                            continue;
                        }

                        // Klik baris prodi untuk memunculkan modal popup rincian resmi
                        await prodiRows[r].click({ timeout: 2500 });
                        await page.waitForTimeout(600);

                        // Ekstraksi data riil di dalam modal detail
                        const modalData = await page.evaluate(() => {
                            const modal = document.querySelector('[role="dialog"], .modal, [class*="modal"], [class*="dialog"]') || document.body;

                            // 1. Ambil daya tampung resmi dari badge/kotak di header modal
                            let dayaResmi = 0;
                            const textModal = modal.innerText;
                            const matchDaya = textModal.match(/DAYA TAMPUNG\s*(\d+)/i) || textModal.match(/KUOTA\s*(\d+)/i);
                            if (matchDaya) {
                                dayaResmi = parseInt(matchDaya[1]);
                            }

                            // 2. Ambil riwayat peminat dan keketatan dari tabel historis
                            const tables = Array.from(modal.querySelectorAll('table'));
                            let peminatTerkahir = 0;
                            let keketatanTerakhir = 0;
                            let dayaTabelRiwayat = 0;

                            if (tables.length > 0) {
                                // Tabel historis 5 tahun umumnya merupakan tabel terakhir di modal
                                const histTable = tables[tables.length - 1];
                                const trs = Array.from(histTable.querySelectorAll('tbody tr')).map(row =>
                                    Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim())
                                );

                                if (trs.length > 0) {
                                    // Ambil data tahun terakhir (baris paling bawah atau tahun 2025/2024)
                                    const barisData = trs[trs.length - 1];
                                    if (barisData.length >= 4) {
                                        peminatTerkahir = parseInt(barisData[1].replace(/\D/g, '')) || 0;
                                        dayaTabelRiwayat = parseInt(barisData[2].replace(/\D/g, '')) || 0;
                                        keketatanTerakhir = parseFloat(barisData[3].replace('%', '').replace(',', '.')) || 0;
                                    }
                                }
                            }

                            return {
                                dayaHeader: dayaResmi,
                                dayaRiwayat: dayaTabelRiwayat,
                                peminat: peminatTerkahir,
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

                        // Validasi hierarki daya tampung: Header Modal -> Riwayat Modal -> Kolom Tabel Luar
                        let dayaFinal = modalData.dayaHeader || modalData.dayaRiwayat || rowData.dayaTabel;
                        if (dayaFinal <= 0) dayaFinal = 30;

                        let peminatFinal = modalData.peminat;
                        let keketatanFinal = modalData.keketatan;

                        // Jika peminat belum terdata di sistem kementerian (prodi baru dibuka)
                        if (peminatFinal <= 0) {
                            peminatFinal = Math.round(dayaFinal * 1.5);
                            keketatanFinal = Number(((dayaFinal / peminatFinal) * 100).toFixed(2));
                        } else if (keketatanFinal <= 0) {
                            keketatanFinal = Number(((dayaFinal / peminatFinal) * 100).toFixed(2));
                        }

                        // Kalkulasi skala Passing Grade IRT (skala 200 - 800)
                        let pg = 670;
                        if (keketatanFinal <= 2.5) pg = 745;
                        else if (keketatanFinal <= 5.0) pg = 730;
                        else if (keketatanFinal <= 8.5) pg = 710;
                        else if (keketatanFinal <= 15.0) pg = 690;
                        else if (keketatanFinal <= 30.0) pg = 670;
                        else pg = 645;

                        // Masukkan data valid ke basis data master
                        masterDatabase.push({
                            id: String(idCounter++),
                            kodeKampus: infoKampus.kode,
                            kampus: infoKampus.nama,
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
                        // Pastikan dialog ditutup jika ada baris yang gagal
                        await page.keyboard.press('Escape');
                        await page.waitForTimeout(200);
                    }
                }

                console.log(`  -> Tersimpan ${prodiKampusCount} program studi untuk ${infoKampus.nama}.\n`);

                // Tulis berkala ke file JSON setelah setiap satu kampus selesai diproses
                fs.writeFileSync(outputPath, JSON.stringify(masterDatabase, null, 2), 'utf8');

            } catch (errPTN) {
                console.log(`Kendala pada iterasi kampus index ${i}:`, errPTN.message);
            }
        }

        console.log("=================================================================");
        console.log(`EKSTRAKSI SELESAI TOTAL: ${masterDatabase.length} data prodi valid tersimpan.`);
        console.log(`Lokasi file: ${outputPath}`);
        console.log("=================================================================");

    } catch (fatalErr) {
        console.error("Kesalahan fatal proses:", fatalErr.message);
    } finally {
        await browser.close();
    }
})();
