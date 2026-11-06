"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Printer,
    ArrowLeft,
    Target,
    CheckCircle2,
    BookOpen,
    Award,
    Sparkles
} from "lucide-react";

export default function LaporanResmiSNBPPage() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);

    // State yang bisa diedit langsung sebelum dicetak ke PDF
    const [namaSiswaEdit, setNamaSiswaEdit] = useState("");
    const [kelasSiswaEdit, setKelasSiswaEdit] = useState("");
    const [namaKepsekEdit, setNamaKepsekEdit] = useState("Achmad Saifudin, S.Pd.");
    const [namaKonselorEdit, setNamaKonselorEdit] = useState("Fadhillah Umar, S.Pd.");

    useEffect(() => {
        if (typeof window === "undefined") return;
        const raw = localStorage.getItem("m18_snbp_report_data");
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
                    <p className="text-xs font-bold text-slate-600">Memuat berkas lembar keputusan SNBP...</p>
                    <button
                        onClick={() => router.push("/snbp")}
                        className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                        Kembali ke Input SNBP
                    </button>
                </div>
            </div>
        );
    }

    const {
        rankingParalel,
        rumpun,
        tanggal,
        target1,
        target2,
        grandAvgRapor,
        raporIRT,
        skorTKA,
        modalAkademikSNBP,
        peluangP1,
        peluangP2,
        catatanKonseling,
        raporData,
        activeMapelList
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
              @page { size: A4 portrait; margin: 8mm; }
              input { border: none !important; background: transparent !important; }
            }
          `
                }}
            />

            {/* ACTION BAR ATAS */}
            <div className="max-w-4xl mx-auto mb-4 bg-white rounded-2xl border border-slate-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs no-print text-left">
                <button
                    onClick={() => router.push("/snbp")}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali Edit Rapor</span>
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                        💡 Nama &amp; Tanda Tangan dapat diedit langsung sebelum cetak
                    </span>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Dokumen Keputusan (PDF)</span>
                    </button>
                </div>
            </div>

            {/* LEMBAR DOKUMEN CETAK A4 */}
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
                        <div className="text-[10.5px] font-bold font-mono text-emerald-900 uppercase">
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
                    style={{ backgroundColor: "#065f46" }}
                >
                    <div className="space-y-1 w-full sm:w-auto">
                        <div className="font-mono text-[10px] text-emerald-200 font-bold uppercase">
                            LEMBAR KEPUTUSAN PEMETAAN SNBP 2026
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-[11px] text-emerald-200 uppercase">NAMA:</span>
                            <input
                                type="text"
                                value={namaSiswaEdit}
                                onChange={(e) => setNamaSiswaEdit(e.target.value.toUpperCase())}
                                placeholder="NAMA LENGKAP SISWA"
                                className="font-black text-base uppercase tracking-wide bg-transparent text-white border-b border-emerald-400 focus:outline-none focus:border-amber-400 w-full sm:w-80"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-emerald-100 font-mono">
                            <span className="text-emerald-200">KELAS:</span>
                            <input
                                type="text"
                                value={kelasSiswaEdit}
                                onChange={(e) => setKelasSiswaEdit(e.target.value.toUpperCase())}
                                placeholder="XII - 1"
                                className="font-bold uppercase tracking-wide bg-transparent text-emerald-100 border-b border-emerald-400 focus:outline-none w-28"
                            />
                            <span>&bull; RUMPUN: {rumpun} &bull; PERINGKAT ELIGIBLE: #{rankingParalel}</span>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <span className="text-[10px] text-emerald-200 font-mono block uppercase">TANGGAL KONSULTASI</span>
                        <span className="font-mono font-bold text-xs">{tanggal}</span>
                    </div>
                </div>

                {/* MODAL AKADEMIK BANNER 50:50 */}
                <div
                    className="p-5 rounded-2xl text-white text-center space-y-1 shadow-xs"
                    style={{ backgroundColor: "#047857" }}
                >
                    <div className="text-[11px] font-mono font-bold text-emerald-100 uppercase tracking-wider">
                        MODAL AKADEMIK GABUNGAN SNBP (50% RAPOR + 50% TKA IRT)
                    </div>
                    <div className="text-5xl font-black tracking-tight text-white my-1">{modalAkademikSNBP} Poin</div>
                    <div className="text-[10.5px] text-emerald-100 font-mono">
                        Rerata Rapor: {grandAvgRapor} (~{raporIRT} IRT) &bull; Skor Baku TKA: {skorTKA} IRT &bull; Standar Skala 200–800
                    </div>
                </div>

                {/* EVALUASI PILIHAN KAMPUS SNBP */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 font-mono uppercase">
                        <Target className="w-4 h-4 text-emerald-700" />
                        <span>PILIHAN PROGRAM STUDI &amp; RASIONALISASI KELULUSAN</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Pilihan 1 */}
                        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">PILIHAN 1 (PRIORITAS UTAMA):</div>
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
                                <span className="text-xs font-bold text-slate-700">Estimasi Peluang:</span>
                                <span
                                    className={`text-lg font-black font-mono ${peluangP1 >= 65 ? "text-emerald-700" : peluangP1 >= 50 ? "text-amber-700" : "text-rose-600"
                                        }`}
                                >
                                    {peluangP1}%
                                </span>
                            </div>
                        </div>

                        {/* Pilihan 2 */}
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
                                <span className="text-xs font-bold text-slate-700">Estimasi Peluang:</span>
                                <span
                                    className={`text-lg font-black font-mono ${peluangP2 >= 65 ? "text-emerald-700" : peluangP2 >= 50 ? "text-amber-700" : "text-rose-600"
                                        }`}
                                >
                                    {peluangP2}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABEL NILAI RAPOR 5 SEMESTER */}
                <div className="space-y-1">
                    <div
                        className="p-2.5 rounded-t-xl text-white flex items-center justify-between text-xs font-bold font-mono"
                        style={{ backgroundColor: "#065f46" }}
                    >
                        <span>REKAPITULASI NILAI RAPOR SEMESTER 1 S/D 5</span>
                        <span>Rerata Keseluruhan: {grandAvgRapor}</span>
                    </div>

                    <div className="border border-slate-200 rounded-b-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-[10px] font-mono font-bold text-slate-500 border-b">
                                <tr>
                                    <th className="p-2.5">MATA PELAJARAN</th>
                                    <th className="p-2.5 text-center">SMT 1</th>
                                    <th className="p-2.5 text-center">SMT 2</th>
                                    <th className="p-2.5 text-center">SMT 3</th>
                                    <th className="p-2.5 text-center">SMT 4</th>
                                    <th className="p-2.5 text-center bg-amber-50 text-amber-900 font-bold">SMT 5</th>
                                    <th className="p-2.5 text-center bg-emerald-50 text-emerald-950 font-bold">RERATA</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {activeMapelList?.map((m: any) => {
                                    const vals = raporData?.[m.id] || [];
                                    const avg = vals.length > 0 ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : 0;

                                    return (
                                        <tr key={m.id} className="hover:bg-slate-50/50">
                                            <td className="p-2.5 font-bold text-slate-900">{m.name}</td>
                                            <td className="p-2.5 text-center font-mono">{vals[0] || "-"}</td>
                                            <td className="p-2.5 text-center font-mono">{vals[1] || "-"}</td>
                                            <td className="p-2.5 text-center font-mono">{vals[2] || "-"}</td>
                                            <td className="p-2.5 text-center font-mono">{vals[3] || "-"}</td>
                                            <td className="p-2.5 text-center font-mono font-bold text-amber-900 bg-amber-50/40">
                                                {vals[4] || "-"}
                                            </td>
                                            <td className="p-2.5 text-center font-mono font-bold text-emerald-950 bg-emerald-50/40">
                                                {avg.toFixed(1)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CATATAN KONSELING & LINEARITAS */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1.5 text-slate-800">
                    <div className="font-bold uppercase font-mono text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>VERIFIKASI LINEARITAS &amp; CATATAN PEMBIMBING BK (TIM PTN SMAM 18)</span>
                    </div>
                    <p className="leading-relaxed italic">
                        &quot;{catatanKonseling}&quot;
                    </p>
                    <p className="text-[11px] text-slate-600">
                        Klausul: Penetapan final pendaftaran akun SNBP wajib mengacu pada regulasi kuota sekolah dan portofolio resmi SNPMB 2026.
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