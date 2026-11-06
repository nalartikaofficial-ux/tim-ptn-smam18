"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Printer,
    ArrowLeft,
    Target,
    CheckCircle2,
    XCircle,
    Award,
    Shield,
    Sparkles
} from "lucide-react";

export default function LaporanResmiMandiriPage() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const raw = localStorage.getItem("m18_mandiri_report_data");
        if (raw) {
            try {
                setData(JSON.parse(raw));
            } catch { }
        }
    }, []);

    if (!data) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-700">
                <div className="bg-white p-6 rounded-2xl border shadow-sm text-center space-y-3">
                    <p className="text-xs font-bold text-slate-600">Memuat berkas lembar rekomendasi...</p>
                    <button
                        onClick={() => router.push("/mandiri")}
                        className="px-4 py-2 bg-[#1e3a8a] text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                        Kembali ke Input Mandiri
                    </button>
                </div>
            </div>
        );
    }

    const {
        activeTab,
        namaSiswa,
        kelasSiswa,
        tanggal,
        modalAkademikPTN,
        targetMandiri1,
        targetMandiri2,
        bobotPrestasi,
        bobotTahfidz,
        bobotPortofolio,
        ptnAnalytics,
        activeInstansi,
        skorTWK,
        skorTIU,
        skorTKP,
        skdAnalytics
    } = data;

    return (
        <div className="min-h-screen bg-slate-100 py-6 px-3 sm:px-6 font-sans text-slate-800">
            <style
                dangerouslySetInnerHTML={{
                    __html: `
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body { background: white !important; padding: 0 !important; margin: 0 !important; }
              .no-print { display: none !important; }
              .print-card { box-shadow: none !important; border: none !important; width: 100% !important; padding: 0 !important; }
              @page { size: A4 portrait; margin: 10mm; }
            }
          `
                }}
            />

            {/* ACTION BAR ATAS */}
            <div className="max-w-4xl mx-auto mb-4 bg-white rounded-2xl border border-slate-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs no-print text-left">
                <button
                    onClick={() => router.push("/mandiri")}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali Edit Nilai</span>
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 rounded-xl bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Dokumen Rekomendasi (PDF)</span>
                    </button>
                </div>
            </div>

            {/* LEMBAR CETAK RESMI A4 */}
            <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6 print-card text-left">
                {/* KOP SURAT FORMAL */}
                <div className="flex items-center gap-4 border-b-2 border-slate-900 pb-4 text-center">
                    <div className="w-20 h-20 shrink-0 flex items-center justify-center p-1">
                        <div className="w-16 h-16 rounded-2xl bg-[#1e3a8a] border-2 border-amber-400 flex items-center justify-center text-amber-400 font-black text-2xl shadow-xs">
                            M18
                        </div>
                    </div>
                    <div className="flex-1 space-y-0.5">
                        <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                            MAJELIS PENDIDIKAN DASAR DAN MENENGAH
                        </div>
                        <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                            PIMPINAN DAERAH MUHAMMADIYAH JAKARTA SELATAN
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                            SMA MUHAMMADIYAH 18 JAKARTA
                        </h1>
                        <div className="text-[10.5px] font-bold font-mono text-indigo-900 uppercase">
                            TERAKREDITASI &quot;A&quot; &bull; SCHOOL OF CHAMPIONS
                        </div>
                        <p className="text-[10px] text-slate-500">
                            Jl. Panjang No. 19 RT.8/RW.9, Kel. Cipulir, Kec. Kebayoran Lama, Kota Jakarta Selatan, DKI Jakarta 12230
                        </p>
                    </div>
                </div>

                {/* IDENTITAS SISWA & STATUS KELAYAKAN */}
                <div
                    className="p-4 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs"
                    style={{ backgroundColor: "#1e3a8a" }}
                >
                    <div className="space-y-0.5">
                        <div className="font-mono text-[10px] text-blue-200 font-bold uppercase">
                            {activeTab === "PTN"
                                ? "LEMBAR PEMETAAN SELEKSI MANDIRI PTN 2026"
                                : "LEMBAR PREDIKSI SPMB SEKOLAH KEDINASAN (BKN)"}
                        </div>
                        <div className="font-black text-base uppercase tracking-wide">{namaSiswa}</div>
                        <div className="text-[11px] text-blue-100 font-mono">
                            KELAS: {kelasSiswa} &bull; ANGKATAN 2026/2027 &bull; SMA MUHAMMADIYAH 18
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-blue-200 font-mono block uppercase">TANGGAL PENILAIAN</span>
                        <span className="font-mono font-bold text-xs">{tanggal}</span>
                    </div>
                </div>

                {/* ========================================= */}
                {/* KONTEN RAPOR MODE A: MANDIRI PTN */}
                {/* ========================================= */}
                {activeTab === "PTN" && (
                    <div className="space-y-5">
                        {/* Banner Skor Akhir */}
                        <div
                            className="p-5 rounded-2xl text-white text-center space-y-1 shadow-xs"
                            style={{ backgroundColor: "#312e81" }}
                        >
                            <div className="text-[11px] font-mono font-bold text-indigo-200 uppercase tracking-wider">
                                TOTAL NILAI MODAL SELEKSI MANDIRI (TERMASUK PRESTASI &amp; TAHFIDZ)
                            </div>
                            <div className="text-5xl font-black tracking-tight text-white my-1">{ptnAnalytics.finalScore} Poin</div>
                            <div className="text-[10.5px] text-indigo-200 font-mono">
                                Modal Akademik: {modalAkademikPTN} (70%) &bull; Bonus Prestasi &amp; Afirmasi: +{ptnAnalytics.totalBonus} Poin
                            </div>
                        </div>

                        {/* Target Pilihan Mandiri */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                                    PILIHAN 1 MANDIRI PTN:
                                </span>
                                <div className="text-sm font-black text-slate-900">{targetMandiri1}</div>
                                <div className="pt-2 flex items-baseline justify-between border-t border-slate-200">
                                    <span className="text-xs font-bold text-slate-600">Estimasi Peluang:</span>
                                    <span className="text-xl font-black text-emerald-700 font-mono">
                                        {ptnAnalytics.peluangKelulusan}%
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                                    PILIHAN 2 (ALTERNATIF):
                                </span>
                                <div className="text-sm font-black text-slate-900">{targetMandiri2}</div>
                                <div className="pt-2 flex items-baseline justify-between border-t border-slate-200">
                                    <span className="text-xs font-bold text-slate-600">Status Cadangan:</span>
                                    <span className="text-xs font-bold text-blue-900 font-mono">Mitigasi Siap</span>
                                </div>
                            </div>
                        </div>

                        {/* Rincian Bobot Portofolio */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                            <span className="font-bold uppercase font-mono text-slate-800 block">
                                Rincian Portofolio &amp; Afirmasi Keagamaan Siswa:
                            </span>
                            <div className="grid grid-cols-3 gap-2 font-mono text-slate-600">
                                <div>
                                    <span className="text-slate-400 block text-[9.5px]">Sertifikat Juara:</span>
                                    <strong>+{bobotPrestasi} Poin</strong>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[9.5px]">Tahfidz Qur'an (&ge; 3 Juz):</span>
                                    <strong className="text-emerald-700">+{bobotTahfidz} Poin</strong>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[9.5px]">Portofolio Seni/Fisik:</span>
                                    <strong>+{bobotPortofolio} Poin</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================= */}
                {/* KONTEN RAPOR MODE B: SEKOLAH KEDINASAN    */}
                {/* ========================================= */}
                {activeTab === "KEDINASAN" && (
                    <div className="space-y-5">
                        {/* Banner SKD Total */}
                        <div
                            className={`p-5 rounded-2xl text-white text-center space-y-1 shadow-xs ${skdAnalytics.isLulusPassingGrade ? "bg-emerald-800" : "bg-rose-900"
                                }`}
                        >
                            <div className="text-[11px] font-mono font-bold text-white/80 uppercase tracking-wider">
                                AKUMULASI SKOR SKD CAT BKN (110 SOAL)
                            </div>
                            <div className="text-5xl font-black tracking-tight text-white my-1">
                                {skdAnalytics.totalSKD} / 550
                            </div>
                            <div className="text-[10.5px] text-white/90 font-mono">
                                Status: {skdAnalytics.isLulusPassingGrade ? "MEMENUHI AMBANG BATAS RESMI (P/L)" : "TIDAK MEMENUHI PASSING GRADE (GUGUR)"}
                            </div>
                        </div>

                        {/* Target Instansi */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">INSTANSI TARGET</span>
                                <span className="text-sm font-black text-slate-900">{activeInstansi.nama}</span>
                                <span className="text-xs text-slate-500 block">{activeInstansi.jurusan}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">PELUANG TAHAP 1</span>
                                <span className="text-xl font-black font-mono text-blue-900">{skdAnalytics.peluangLolosTahap1}%</span>
                            </div>
                        </div>

                        {/* Tabel Subtes SKD CAT BKN */}
                        <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                            <table className="w-full text-left">
                                <thead className="bg-slate-100 font-mono text-[10px] text-slate-600 border-b">
                                    <tr>
                                        <th className="p-3">KOMPONEN TES SKD CAT</th>
                                        <th className="p-3 text-center">PASSING GRADE</th>
                                        <th className="p-3 text-center">NILAI SISWA</th>
                                        <th className="p-3 text-center">STATUS KELULUSAN</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    <tr>
                                        <td className="p-3 font-bold text-slate-800">Tes Wawasan Kebangsaan (TWK)</td>
                                        <td className="p-3 text-center font-mono">65</td>
                                        <td className="p-3 text-center font-mono font-bold">{skorTWK}</td>
                                        <td className="p-3 text-center font-mono text-[11px]">
                                            {skdAnalytics.passTWK ? (
                                                <span className="text-emerald-700 font-bold">Lolos (&ge; 65)</span>
                                            ) : (
                                                <span className="text-rose-600 font-bold">Gugur (&lt; 65)</span>
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold text-slate-800">Tes Inteligensia Umum (TIU)</td>
                                        <td className="p-3 text-center font-mono">80</td>
                                        <td className="p-3 text-center font-mono font-bold">{skorTIU}</td>
                                        <td className="p-3 text-center font-mono text-[11px]">
                                            {skdAnalytics.passTIU ? (
                                                <span className="text-emerald-700 font-bold">Lolos (&ge; 80)</span>
                                            ) : (
                                                <span className="text-rose-600 font-bold">Gugur (&lt; 80)</span>
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold text-slate-800">Tes Karakteristik Pribadi (TKP)</td>
                                        <td className="p-3 text-center font-mono">166</td>
                                        <td className="p-3 text-center font-mono font-bold">{skorTKP}</td>
                                        <td className="p-3 text-center font-mono text-[11px]">
                                            {skdAnalytics.passTKP ? (
                                                <span className="text-emerald-700 font-bold">Lolos (&ge; 166)</span>
                                            ) : (
                                                <span className="text-rose-600 font-bold">Gugur (&lt; 166)</span>
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* CATATAN RESMI */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-800">
                    <div className="font-bold uppercase font-mono text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-700" />
                        <span>KLAUSUL AKADEMIK TIM PTN &amp; KONSELING KEDINASAN M18</span>
                    </div>
                    <p className="leading-relaxed italic">
                        &quot;Hasil evaluasi ini merupakan instrumen pengambilan keputusan rasionalisasi jalur mandiri dan SPMB BKN. Persiapkan kesiapan fisik, tes kesehatan, dan kelengkapan portofolio asli sebelum pembukaan pendaftaran resmi.&quot;
                    </p>
                </div>

                {/* TANDA TANGAN FORMAL */}
                <div className="pt-8 pb-4 grid grid-cols-2 gap-8 text-center text-xs font-serif text-slate-800">
                    <div className="space-y-16">
                        <div>
                            <p className="text-[11px]">Mengetahui,</p>
                            <p className="font-bold text-[11.5px]">Koordinator TIM PTN &amp; Kedinasan</p>
                        </div>
                        <div>
                            <p className="font-bold underline text-[12px]">Fadhillah Umar, S.Pd.</p>
                            <p className="text-[10px] font-mono text-slate-500">NIP: 121 2026 001</p>
                        </div>
                    </div>

                    <div className="space-y-16">
                        <div>
                            <p className="text-[11px]">Jakarta, {tanggal}</p>
                            <p className="font-bold text-[11.5px]">Orang Tua / Wali Siswa</p>
                        </div>
                        <div>
                            <p className="font-bold text-[12px]">( .................................................... )</p>
                            <p className="text-[10px] font-mono text-slate-500">Nama Siswa: {namaSiswa}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}