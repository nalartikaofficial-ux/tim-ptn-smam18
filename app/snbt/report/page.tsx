"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Printer,
    ArrowLeft,
    Target,
    AlertTriangle
} from "lucide-react";

export default function LaporanResmiMultiTOPage() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);

    // State yang bisa diedit langsung sebelum dicetak ke PDF
    const [namaSiswaEdit, setNamaSiswaEdit] = useState("");
    const [kelasSiswaEdit, setKelasSiswaEdit] = useState("");
    const [namaKepsekEdit, setNamaKepsekEdit] = useState("Achmad Saifudin, S.Pd.");
    const [namaKonselorEdit, setNamaKonselorEdit] = useState("Fadhillah Umar, S.Pd.");

    useEffect(() => {
        if (typeof window === "undefined") return;
        const raw = localStorage.getItem("m18_snbt_report_data");
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                setData(parsed);
                setNamaSiswaEdit((parsed.namaSiswa || "").toUpperCase());
                setKelasSiswaEdit((parsed.kelasSiswa || "").toUpperCase());
            } catch { }
        }
    }, []);

    if (!data) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-700">
                <div className="bg-white p-6 rounded-2xl border shadow-sm text-center space-y-3">
                    <p className="text-xs font-bold text-slate-600">Memuat berkas rapor evaluasi...</p>
                    <button
                        onClick={() => router.push("/snbt")}
                        className="px-4 py-2 bg-[#1e3a8a] text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                        Kembali ke Input SNBT
                    </button>
                </div>
            </div>
        );
    }

    const { tanggal, target1, target2, subtesScores, analytics } = data;

    const subtesLabels: Record<string, string> = {
        pu: "Penalaran Umum (PU)",
        pk: "Pengetahuan Kuantitatif (PK)",
        pm: "Penalaran Matematika (PM)",
        pbm: "Pemahaman Bacaan & Menulis (PBM)",
        ppu: "Pengetahuan & Pemahaman Umum (PPU)",
        indo: "Literasi Bahasa Indonesia",
        ing: "Literasi Bahasa Inggris"
    };

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
              @page { size: A4 portrait; margin: 8mm; }
              input { border: none !important; background: transparent !important; }
            }
          `
                }}
            />

            {/* ACTION BAR ATAS */}
            <div className="max-w-4xl mx-auto mb-4 bg-white rounded-2xl border border-slate-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs no-print text-left">
                <button
                    onClick={() => router.push("/snbt")}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali Edit Nilai</span>
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                        💡 Nama &amp; Tanda Tangan dapat diedit langsung sebelum cetak
                    </span>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 rounded-xl bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Dokumen Rapor (PDF)</span>
                    </button>
                </div>
            </div>

            {/* LEMBAR RAPOR RESMI A4 */}
            <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6 print-card text-left">
                {/* KOP SURAT FORMAL RESMI DENGAN LOGO SMAM 18 */}
                <div className="flex items-center gap-5 border-b-2 border-slate-900 pb-4 text-center">
                    <img
                        src="/logo.png"
                        alt="Logo SMA Muhammadiyah 18 Jakarta"
                        className="w-20 h-20 object-contain shrink-0"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />
                    <div className="flex-1 space-y-0.5">
                        <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                            MAJELIS PENDIDIKAN DASAR DAN MENENGAH DAN PENDIDIKAN NONFORMAL
                        </div>
                        <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                            PIMPINAN CABANG MUHAMMADIYAH KEBAYORAN LAMA
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                            SMA MUHAMMADIYAH 18 JAKARTA
                        </h1>
                        <div className="text-[10.5px] font-bold font-mono text-blue-900 uppercase">
                            TERAKREDITASI &quot;A&quot; &bull; SCHOOL OF CHAMPIONS
                        </div>
                        <p className="text-[10px] text-slate-500">
                            Jl. Panjang No. 19 RT.8/RW.9, Kel. Cipulir, Kec. Kebayoran Lama, Kota Jakarta Selatan, DKI Jakarta 12230
                        </p>
                    </div>
                </div>

                {/* IDENTITAS SISWA (EDITABLE & FULL KAPITAL) */}
                <div
                    className="p-4 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs"
                    style={{ backgroundColor: "#1e3a8a" }}
                >
                    <div className="space-y-1 w-full sm:w-auto">
                        <div className="font-mono text-[10px] text-blue-200 font-bold uppercase">
                            LEMBAR EVALUASI &amp; PROYEKSI MULTI-TRY OUT SNBT
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-[11px] text-blue-200 uppercase">NAMA:</span>
                            <input
                                type="text"
                                value={namaSiswaEdit}
                                onChange={(e) => setNamaSiswaEdit(e.target.value.toUpperCase())}
                                placeholder="NAMA SISWA LENGKAP"
                                className="font-black text-base uppercase tracking-wide bg-transparent text-white border-b border-blue-400 focus:outline-none focus:border-amber-400 w-full sm:w-80"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-blue-100 font-mono">
                            <span className="text-blue-200">KELAS:</span>
                            <input
                                type="text"
                                value={kelasSiswaEdit}
                                onChange={(e) => setKelasSiswaEdit(e.target.value.toUpperCase())}
                                placeholder="XII - 1"
                                className="font-bold uppercase tracking-wide bg-transparent text-blue-100 border-b border-blue-400 focus:outline-none w-28"
                            />
                            <span>&bull; ANGKATAN 2026/2027 &bull; TIM PTN SMAM 18</span>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <span className="text-[10px] text-blue-200 font-mono block uppercase">TANGGAL KONSULTASI</span>
                        <span className="font-mono font-bold text-xs">{tanggal}</span>
                    </div>
                </div>

                {/* PROYEKSI NILAI IRT */}
                <div
                    className="p-5 rounded-2xl text-white text-center space-y-1 shadow-xs"
                    style={{ backgroundColor: "#1c4cb7" }}
                >
                    <div className="text-[11px] font-mono font-bold text-blue-100 uppercase tracking-wider">
                        SKOR PROYEKSI UTBK HARI-H (WEIGHTED MOVING AVERAGE)
                    </div>
                    <div className="text-5xl font-black tracking-tight text-white my-1">{analytics.weightedScore}</div>
                    <div className="text-[10.5px] text-blue-100 font-mono">
                        Kombinasi Bobot: 50% TO 3 (Terakhir) + 30% TO 2 (Mid) + 20% TO 1 (Awal) &bull; Skala Baku IRT
                    </div>
                </div>

                {/* TARGET KAMPUS & PELUANG */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 font-mono uppercase">
                        <Target className="w-4 h-4 text-blue-700" />
                        <span>PILIHAN PROGRAM STUDI &amp; STATUS KELULUSAN TARGET</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">PILIHAN 1 (UTAMA):</div>
                            <div className="text-sm font-black text-slate-900 leading-tight">
                                [{target1.jenjang || "S1"}] {target1.prodi}
                            </div>
                            <div className="text-xs font-semibold text-slate-600">{target1.kampus}</div>
                            <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-mono font-bold border-t border-slate-200">
                                <div>
                                    <span className="text-slate-400 block text-[9px]">Daya Tampung:</span>
                                    <span className="text-slate-800">{target1.dayaTampung}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[9px]">Keketatan:</span>
                                    <span className="text-rose-600">{target1.keketatan}%</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[9px]">Passing Grade:</span>
                                    <span className="text-emerald-700">&ge; {target1.passingGrade}</span>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700">Peluang Kelulusan:</span>
                                <span
                                    className={`text-lg font-black font-mono ${analytics.peluang1 >= 65 ? "text-emerald-700" : analytics.peluang1 >= 50 ? "text-amber-700" : "text-rose-600"
                                        }`}
                                >
                                    {analytics.peluang1}%
                                </span>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">PILIHAN 2 (CADANGAN):</div>
                            <div className="text-sm font-black text-slate-900 leading-tight">
                                [{target2.jenjang || "S1"}] {target2.prodi}
                            </div>
                            <div className="text-xs font-semibold text-slate-600">{target2.kampus}</div>
                            <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-mono font-bold border-t border-slate-200">
                                <div>
                                    <span className="text-slate-400 block text-[9px]">Daya Tampung:</span>
                                    <span className="text-slate-800">{target2.dayaTampung}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[9px]">Keketatan:</span>
                                    <span className="text-rose-600">{target2.keketatan}%</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[9px]">Passing Grade:</span>
                                    <span className="text-emerald-700">&ge; {target2.passingGrade}</span>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700">Peluang Kelulusan:</span>
                                <span
                                    className={`text-lg font-black font-mono ${analytics.peluang2 >= 65 ? "text-emerald-700" : analytics.peluang2 >= 50 ? "text-amber-700" : "text-rose-600"
                                        }`}
                                >
                                    {analytics.peluang2}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABEL PROGRES 7 SUBTES */}
                <div className="space-y-1">
                    <div
                        className="p-2.5 rounded-t-xl text-white flex items-center justify-between text-xs font-bold font-mono"
                        style={{ backgroundColor: "#1e3a8a" }}
                    >
                        <span>REKAPITULASI CAPAIAN 7 SUBTES (SKOR 200 - 1000)</span>
                        <span>Delta: {analytics.deltaTotal >= 0 ? `+${analytics.deltaTotal}` : analytics.deltaTotal} Poin</span>
                    </div>
                    <div className="border border-slate-200 rounded-b-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-[10px] font-mono font-bold text-slate-500 border-b">
                                <tr>
                                    <th className="p-2.5">SUBTES UTBK</th>
                                    <th className="p-2.5 text-center">TO 1 (AWAL)</th>
                                    <th className="p-2.5 text-center">TO 2 (MID)</th>
                                    <th className="p-2.5 text-center bg-blue-50 text-blue-900 font-black">TO 3 (AKHIR)</th>
                                    <th className="p-2.5 text-center">DELTA &amp; TREN</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {Object.entries(subtesScores).map(([k, vals]: any) => {
                                    const d = (vals[2] || 0) - (vals[0] || 0);
                                    const isUp = d >= 0;

                                    return (
                                        <tr key={k} className="hover:bg-slate-50/50">
                                            <td className="p-2.5 font-bold text-slate-900">{subtesLabels[k]}</td>
                                            <td className="p-2.5 text-center font-mono">{vals[0]}</td>
                                            <td className="p-2.5 text-center font-mono">{vals[1]}</td>
                                            <td className="p-2.5 text-center font-mono font-bold text-blue-950 bg-blue-50/30">
                                                {vals[2]}
                                            </td>
                                            <td className="p-2.5 text-center font-mono text-[10.5px]">
                                                <span
                                                    className={`px-2 py-0.5 rounded font-bold ${isUp ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
                                                        }`}
                                                >
                                                    {isUp ? `+${d}` : d}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CATATAN DIAGNOSTIK & REKOMENDASI */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-1.5 text-slate-800">
                    <div className="font-bold uppercase font-mono text-amber-950 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-700" />
                        <span>DIAGNOSTIK AKADEMIK &amp; REKOMENDASI BELAJAR (TIM PTN SMAM 18)</span>
                    </div>
                    <p className="leading-relaxed">
                        Siswa memiliki modal unggul pada subtes <b>{analytics.strongest.label}</b> (Skor: {analytics.strongest.score}). Namun, faktor penahan (*bottleneck*) berada pada subtes <b>{analytics.bottleneck.label}</b> (Skor: {analytics.bottleneck.score}).
                    </p>
                </div>

                {/* TANDA TANGAN FORMAL 3 KOLOM RESMI (LANGSUNG BISA DIEDIT) */}
                <div className="pt-6 pb-2 grid grid-cols-3 gap-4 text-center text-xs font-serif text-slate-800 border-t border-slate-200">
                    {/* Kolom 1: Siswa */}
                    <div className="flex flex-col justify-between h-44">
                        <div>
                            <p className="text-[11px]">Jakarta, {tanggal}</p>
                            <p className="font-bold text-[11.5px]">Siswa Peserta Asesmen</p>
                        </div>
                        <div>
                            <input
                                type="text"
                                value={namaSiswaEdit}
                                onChange={(e) => setNamaSiswaEdit(e.target.value.toUpperCase())}
                                className="font-bold underline text-center w-full uppercase bg-transparent border-b border-dashed border-slate-300 focus:outline-none"
                            />
                            <p className="text-[10px] font-mono text-slate-500">Kelas: {kelasSiswaEdit}</p>
                        </div>
                    </div>

                    {/* Kolom 2: TIM PTN */}
                    <div className="flex flex-col justify-between h-44">
                        <div>
                            <p className="text-[11px]">Konselor Pendamping,</p>
                            <p className="font-bold text-[11.5px] uppercase">TIM PTN SMAM 18 JAKARTA</p>
                        </div>
                        <div>
                            <input
                                type="text"
                                value={namaKonselorEdit}
                                onChange={(e) => setNamaKonselorEdit(e.target.value)}
                                className="font-bold underline text-center w-full bg-transparent border-b border-dashed border-slate-300 focus:outline-none"
                            />
                            <p className="text-[10px] font-mono text-slate-500">Koordinator Bimbingan PTN</p>
                        </div>
                    </div>

                    {/* Kolom 3: Kepala Sekolah */}
                    <div className="flex flex-col justify-between h-44">
                        <div>
                            <p className="text-[11px]">Mengetahui,</p>
                            <p className="font-bold text-[11.5px] uppercase">Kepala SMA Muhammadiyah 18</p>
                        </div>
                        <div>
                            <input
                                type="text"
                                value={namaKepsekEdit}
                                onChange={(e) => setNamaKepsekEdit(e.target.value)}
                                className="font-bold underline text-center w-full bg-transparent border-b border-dashed border-slate-300 focus:outline-none"
                            />
                            <p className="text-[10px] font-mono text-slate-500">NBM: 108 5345</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}