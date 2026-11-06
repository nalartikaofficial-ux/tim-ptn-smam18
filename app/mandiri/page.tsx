"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Shield,
    Building2,
    Award,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ArrowLeft,
    ChevronRight,
    BarChart3,
    BookOpen,
    Sparkles,
    Zap,
    Target
} from "lucide-react";

export default function ModulMandiriPage() {
    const router = useRouter();

    // 1. STATE MODE JALUR (MANDIRI PTN vs KEDINASAN BKN)
    const [activeTab, setActiveTab] = useState<"PTN" | "KEDINASAN">("PTN");

    // 2. STATE IDENTITAS SISWA (BERSIH DARI DUMMY DEFAULT)
    const [namaSiswa, setNamaSiswa] = useState("");
    const [kelasSiswa, setKelasSiswa] = useState("");

    // ==========================================
    // PARAMETER MODE A: SELEKSI MANDIRI PTN
    // ==========================================
    const [modalAkademikPTN, setModalAkademikPTN] = useState<number | "">(""); // Skala 0-100 (dari Rapor / UTBK)
    const [targetMandiri1, setTargetMandiri1] = useState("SIMAK UI - S1 Ilmu Komputer");
    const [targetMandiri2, setTargetMandiri2] = useState("UTUL / CBT UGM - S1 Statistika");
    const [bobotPrestasi, setBobotPrestasi] = useState(0); // Sertifikat Kejuaraan
    const [bobotTahfidz, setBobotTahfidz] = useState(0); // Jalur Prestasi Keagamaan
    const [bobotPortofolio, setBobotPortofolio] = useState(0); // Seni / Olahraga

    // Engine Formula Mandiri PTN
    const ptnAnalytics = useMemo(() => {
        const numericAkademik = typeof modalAkademikPTN === "number" ? modalAkademikPTN : 0;
        // 70% Modal Akademik + Bonus Prestasi + Afirmasi Tahfidz + Portofolio Seni
        const baseScore = numericAkademik * 0.7;
        const totalBonus = bobotPrestasi + bobotTahfidz + bobotPortofolio;
        const finalScore = Number((baseScore + totalBonus).toFixed(1));
        const peluangKelulusan = numericAkademik > 0 ? Math.min(95, Math.max(15, Math.round(finalScore * 0.95))) : 0;

        return {
            baseScore: Number(baseScore.toFixed(1)),
            totalBonus,
            finalScore,
            peluangKelulusan
        };
    }, [modalAkademikPTN, bobotPrestasi, bobotTahfidz, bobotPortofolio]);

    // ==========================================
    // PARAMETER MODE B: SEKOLAH KEDINASAN (BKN)
    // ==========================================
    const [targetInstansi, setTargetInstansi] = useState("PKN_STAN");
    const [skorTWK, setSkorTWK] = useState<number | "">(""); // Ambang batas: 65 (Maks: 150)
    const [skorTIU, setSkorTIU] = useState<number | "">(""); // Ambang batas: 80 (Maks: 175)
    const [skorTKP, setSkorTKP] = useState<number | "">(""); // Ambang batas: 166 (Maks: 225)
    const [nilaiRaporKedinasan, setNilaiRaporKedinasan] = useState<number | "">("");

    const instansiList = [
        {
            id: "PKN_STAN",
            nama: "PKN STAN (Kemenkeu)",
            jurusan: "D4 Akuntansi Sektor Publik",
            syaratTambahan: "Wajib Nilai UTBK TPS & Bahasa Inggris + Tes Kesehatan"
        },
        {
            id: "STIS",
            nama: "Politeknik Statistika STIS (BPS)",
            jurusan: "D4 Statistika Terapan",
            syaratTambahan: "Ujian Matematika Lanjutan Tahap 2 + Psikotes"
        },
        {
            id: "IPDN",
            nama: "IPDN (Kemendagri)",
            jurusan: "D4 Manajemen Keamanan & Keselamatan Publik",
            syaratTambahan: "Uji Kesamaptaan Jasmani & Pemeriksaan Kesehatan Bebas Tato/Tindik"
        },
        {
            id: "POLTEK_SSN",
            nama: "Poltek SSN (BSSN)",
            jurusan: "D4 Rekayasa Kriptografi",
            syaratTambahan: "Uji Potensi Akademik Matematika & Wawancara Khusus"
        },
        {
            id: "STIN",
            nama: "STIN (Badan Intelijen Negara)",
            jurusan: "S1 Intelijen Medik / Siber",
            syaratTambahan: "Tes Mental Ideologi, Psikologi Lanjutan & Kesamaptaan Ketat"
        }
    ];

    const activeInstansi = instansiList.find((i) => i.id === targetInstansi) || instansiList[0];

    // Engine Aturan Gugur Mutlak SKD BKN (KemenPAN-RB Resmi)
    const skdAnalytics = useMemo(() => {
        const numTWK = typeof skorTWK === "number" ? skorTWK : 0;
        const numTIU = typeof skorTIU === "number" ? skorTIU : 0;
        const numTKP = typeof skorTKP === "number" ? skorTKP : 0;

        const passTWK = numTWK >= 65;
        const passTIU = numTIU >= 80;
        const passTKP = numTKP >= 166;
        const totalSKD = numTWK + numTIU + numTKP;
        const passTotal = totalSKD >= 311;

        // Status: Lulus hanya jika SELURUH subtes memenuhi ambang batas
        const isLulusPassingGrade = totalSKD > 0 && passTWK && passTIU && passTKP && passTotal;

        let predikatKompetisi = "Tidak Memenuhi Ambang Batas (Gugur)";
        let peluangLolosTahap1 = 0;

        if (totalSKD === 0) {
            predikatKompetisi = "Belum Melakukan Simulasi SKD";
            peluangLolosTahap1 = 0;
        } else if (isLulusPassingGrade) {
            if (totalSKD >= 410) {
                predikatKompetisi = "Peringkat Puncak Aman (Sangat Kompetitif)";
                peluangLolosTahap1 = 88;
            } else if (totalSKD >= 370) {
                predikatKompetisi = "Zona Bersaing Kuat (Perlu Latihan Tambahan)";
                peluangLolosTahap1 = 70;
            } else {
                predikatKompetisi = "Lulus Ambang Batas (Rentan Tergeser Kuota 3x Formasi)";
                peluangLolosTahap1 = 45;
            }
        }

        return {
            totalSKD,
            passTWK,
            passTIU,
            passTKP,
            passTotal,
            isLulusPassingGrade,
            predikatKompetisi,
            peluangLolosTahap1
        };
    }, [skorTWK, skorTIU, skorTKP]);

    // Tombol muat contoh data
    const handleLoadContohData = () => {
        setNamaSiswa("FADHILLAH UMAR");
        setKelasSiswa("XII - 1");
        if (activeTab === "PTN") {
            setModalAkademikPTN(88.5);
            setBobotPrestasi(10);
            setBobotTahfidz(10);
            setBobotPortofolio(0);
        } else {
            setSkorTWK(85);
            setSkorTIU(110);
            setSkorTKP(175);
            setNilaiRaporKedinasan(89.0);
        }
    };

    // 3. GENERATE RAPOR DOKUMEN CETAK
    const handleProceedToReport = () => {
        const payload = {
            activeTab,
            namaSiswa: (namaSiswa || "SISWA PESERTA ASESMEN").toUpperCase(),
            kelasSiswa: (kelasSiswa || "XII").toUpperCase(),
            tanggal: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
            // Data PTN
            modalAkademikPTN: typeof modalAkademikPTN === "number" ? modalAkademikPTN : 0,
            targetMandiri1,
            targetMandiri2,
            bobotPrestasi,
            bobotTahfidz,
            bobotPortofolio,
            ptnAnalytics,
            // Data Kedinasan
            activeInstansi,
            skorTWK: typeof skorTWK === "number" ? skorTWK : 0,
            skorTIU: typeof skorTIU === "number" ? skorTIU : 0,
            skorTKP: typeof skorTKP === "number" ? skorTKP : 0,
            nilaiRaporKedinasan: typeof nilaiRaporKedinasan === "number" ? nilaiRaporKedinasan : 0,
            skdAnalytics
        };
        localStorage.setItem("m18_mandiri_report_data", JSON.stringify(payload));
        router.push("/mandiri/report");
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-16">
            {/* HEADER NAVIGASI DENGAN LOGO RESMI */}
            <header className="border-b bg-white sticky top-0 z-30 shadow-2xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition flex items-center justify-center mr-1"
                            title="Kembali ke Portal Hub"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div className="w-10 h-10 p-1 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
                            <img
                                src="/logo.png"
                                alt="Logo SMA Muhammadiyah 18 Jakarta"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="text-left">
                            <span className="text-xs sm:text-sm font-black tracking-tight text-[#1e3a8a] uppercase block">
                                SMA MUHAMMADIYAH 18 JAKARTA
                            </span>
                            <span className="text-[10px] text-indigo-900 font-mono font-bold block">
                                MODUL MANDIRI PTN &amp; SPMB BKN 2026
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                        <span className="font-mono text-xs font-bold text-slate-700 hidden sm:inline">
                            Regulasi Mandiri &amp; SPMB BKN
                        </span>
                    </div>
                </div>
            </header>

            {/* MAIN CONTAINER */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
                {/* BANNER UTAMA */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                    <div className="space-y-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-400 text-indigo-950 text-[10px] font-black uppercase tracking-wider">
                            Dual-Mode Evaluation
                        </span>
                        <h1 className="text-xl sm:text-2xl font-black">Modul Mandiri PTN &amp; Sekolah Kedinasan (BKN)</h1>
                        <p className="text-xs text-indigo-200">
                            Evaluasi modal akademik, portofolio prestasi, sertifikat tahfidz, dan simulasi passing grade SKD CAT resmi.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        {/* TAB MODE SWITCHER */}
                        <div className="flex items-center bg-white/10 p-1.5 rounded-2xl border border-white/20 shrink-0">
                            <button
                                onClick={() => setActiveTab("PTN")}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === "PTN" ? "bg-white text-indigo-950 shadow-sm" : "text-white/80 hover:text-white"
                                    }`}
                            >
                                Seleksi Mandiri PTN
                            </button>
                            <button
                                onClick={() => setActiveTab("KEDINASAN")}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === "KEDINASAN" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-white/80 hover:text-white"
                                    }`}
                            >
                                Sekolah Kedinasan (BKN)
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleLoadContohData}
                            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Contoh Data</span>
                        </button>
                    </div>
                </div>

                {/* CONTAINER FORM */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-7 text-left">
                    {/* Identitas Siswa */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-100">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Nama Lengkap Siswa (Otomatis Kapital):
                            </label>
                            <input
                                type="text"
                                placeholder="MASUKKAN NAMA SISWA..."
                                value={namaSiswa}
                                onChange={(e) => setNamaSiswa(e.target.value.toUpperCase())}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-700 outline-none uppercase"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Kelas / Rombel:
                            </label>
                            <input
                                type="text"
                                placeholder="XII - 1"
                                value={kelasSiswa}
                                onChange={(e) => setKelasSiswa(e.target.value.toUpperCase())}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-700 outline-none uppercase font-mono"
                            />
                        </div>
                    </div>

                    {/* ========================================= */}
                    {/* TAMPILAN 1: MODE SELEKSI MANDIRI PTN */}
                    {/* ========================================= */}
                    {activeTab === "PTN" && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Target Pilihan Mandiri */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                        <Target className="w-4 h-4 text-indigo-700" />
                                        <span>Target Kampus Mandiri</span>
                                    </h3>

                                    <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-indigo-950 uppercase mb-1">
                                                Pilihan 1 (Prioritas Mandiri PTN):
                                            </label>
                                            <input
                                                type="text"
                                                value={targetMandiri1}
                                                onChange={(e) => setTargetMandiri1(e.target.value)}
                                                placeholder="Contoh: SIMAK UI - S1 Ilmu Komputer"
                                                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-indigo-700 outline-none shadow-2xs"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                Pilihan 2 (Alternatif Cadangan):
                                            </label>
                                            <input
                                                type="text"
                                                value={targetMandiri2}
                                                onChange={(e) => setTargetMandiri2(e.target.value)}
                                                placeholder="Contoh: UTUL UGM - S1 Statistika"
                                                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-indigo-700 outline-none shadow-2xs"
                                            />
                                        </div>
                                    </div>

                                    {/* Modal Akademik Base */}
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-800 uppercase">Modal Nilai Akademik (0–100)</span>
                                            <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                                                Bobot 70%
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500">
                                            Rata-rata rapor semester 1–5 atau konversi persentase skor try out UTBK.
                                        </p>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min={0}
                                            max={100}
                                            placeholder="0.0"
                                            value={modalAkademikPTN}
                                            onChange={(e) => setModalAkademikPTN(e.target.value === "" ? "" : Number(e.target.value))}
                                            className="w-32 text-center bg-white border-2 border-indigo-300 rounded-xl py-2 text-sm font-black text-indigo-950 font-mono outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Portofolio & Jalur Afirmasi Khusus */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                        <Award className="w-4 h-4 text-amber-600" />
                                        <span>Portofolio &amp; Afirmasi Prestasi</span>
                                    </h3>

                                    <div className="space-y-3">
                                        {/* Kejuaraan */}
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Sertifikat Juara Lomba (OSN / FLS2N / O2SN / Riset):
                                            </label>
                                            <select
                                                value={bobotPrestasi}
                                                onChange={(e) => setBobotPrestasi(Number(e.target.value))}
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                                            >
                                                <option value={0}>Tidak Ada Sertifikat Juara (0 Poin)</option>
                                                <option value={5}>Juara 1–3 Tingkat Kota / Kabupaten (+5 Poin)</option>
                                                <option value={10}>Juara 1–3 Tingkat Provinsi (+10 Poin)</option>
                                                <option value={15}>Juara 1–3 Tingkat Nasional / Internasional (+15 Poin)</option>
                                            </select>
                                        </div>

                                        {/* Tahfidz Qur'an */}
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Sertifikat Tahfidz Al-Qur'an (Afirmasi Khusus PTN):
                                            </label>
                                            <select
                                                value={bobotTahfidz}
                                                onChange={(e) => setBobotTahfidz(Number(e.target.value))}
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                                            >
                                                <option value={0}>Belum Ada Sertifikat Tahfidz (0 Poin)</option>
                                                <option value={5}>Hafalan 1 s.d. 2 Juz Terverifikasi (+5 Poin)</option>
                                                <option value={10}>Hafalan 3 s.d. 5 Juz Terverifikasi (+10 Poin - Syarat Min. PTN)</option>
                                                <option value={15}>Hafalan &ge; 10 Juz s.d. 30 Juz (+15 Poin - Kuota Khusus Bebas Tes)</option>
                                            </select>
                                        </div>

                                        {/* Portofolio Seni / Olahraga */}
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Portofolio Keterampilan Seni / Olahraga (Khusus FSRD/Penjas):
                                            </label>
                                            <select
                                                value={bobotPortofolio}
                                                onChange={(e) => setBobotPortofolio(Number(e.target.value))}
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                                            >
                                                <option value={0}>Bukan Jurusan Seni / Olahraga (0 Poin)</option>
                                                <option value={10}>Portofolio Karya Desain / Seni Rupa Standar (+10 Poin)</option>
                                                <option value={15}>Portofolio Karya Seni / Musik / Kebugaran Unggul (+15 Poin)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dashboard Hasil Mandiri PTN */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                                        MODAL AKADEMIK (70%)
                                    </span>
                                    <p className="text-2xl font-black text-slate-900">{ptnAnalytics.baseScore} Poin</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1">
                                    <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase block">
                                        TOTAL BONUS PRESTASI &amp; TAHFIDZ
                                    </span>
                                    <p className="text-2xl font-black text-indigo-900">+{ptnAnalytics.totalBonus} Poin</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                                    <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">
                                        ESTIMASI PELUANG KELULUSAN
                                    </span>
                                    <p className="text-2xl font-black text-emerald-700 font-mono">
                                        {ptnAnalytics.peluangKelulusan}% {ptnAnalytics.peluangKelulusan > 0 ? "(Kompetitif)" : ""}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========================================= */}
                    {/* TAMPILAN 2: MODE SEKOLAH KEDINASAN (BKN)  */}
                    {/* ========================================= */}
                    {activeTab === "KEDINASAN" && (
                        <div className="space-y-6 animate-in fade-in">
                            {/* Pilihan Instansi */}
                            <div>
                                <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5">
                                    Pilih Instansi Kedinasan Ikatan Dinas (SPMB DIKDIN BKN):
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {instansiList.map((inst) => (
                                        <div
                                            key={inst.id}
                                            onClick={() => setTargetInstansi(inst.id)}
                                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${targetInstansi === inst.id
                                                    ? "bg-amber-50 border-amber-500 text-amber-950 font-bold ring-2 ring-amber-400/20"
                                                    : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                                                }`}
                                        >
                                            <div className="text-xs font-black">{inst.nama}</div>
                                            <div className="text-[11px] text-slate-500 mt-0.5">{inst.jurusan}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Notifikasi Syarat Tambahan Instansi */}
                                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                                    <span>
                                        <b>Ketentuan Teknis {activeInstansi.nama}:</b> {activeInstansi.syaratTambahan}.
                                    </span>
                                </div>
                            </div>

                            {/* Simulator Skor SKD CAT BKN */}
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                                <div className="flex items-center justify-between border-b pb-3">
                                    <div>
                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                                            Simulasi Nilai Try Out SKD CAT BKN (110 Butir Soal)
                                        </h3>
                                        <p className="text-[11px] text-slate-500">
                                            Standar resmi Keputusan MenPAN-RB: Berlaku sistem gugur mutlak per subtes.
                                        </p>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 font-mono text-[10.5px] font-bold">
                                        Total Soal: 110 Butir
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* TWK */}
                                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-slate-800">TWK (30 Soal)</span>
                                            <span className="font-mono text-[10px] text-slate-400">Min: 65</span>
                                        </div>
                                        <input
                                            type="number"
                                            min={0}
                                            max={150}
                                            placeholder="0"
                                            value={skorTWK}
                                            onChange={(e) => setSkorTWK(e.target.value === "" ? "" : Number(e.target.value))}
                                            className="w-full text-center border rounded-lg py-1.5 font-mono font-bold text-sm"
                                        />
                                        <div className="flex items-center justify-center gap-1 text-[11px]">
                                            {skdAnalytics.passTWK && typeof skorTWK === "number" ? (
                                                <span className="text-emerald-700 font-bold flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Lolos Passing
                                                </span>
                                            ) : (
                                                <span className="text-rose-600 font-bold flex items-center gap-1">
                                                    <XCircle className="w-3.5 h-3.5" /> Gugur Mutlak (&lt; 65)
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* TIU */}
                                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-slate-800">TIU (35 Soal)</span>
                                            <span className="font-mono text-[10px] text-slate-400">Min: 80</span>
                                        </div>
                                        <input
                                            type="number"
                                            min={0}
                                            max={175}
                                            placeholder="0"
                                            value={skorTIU}
                                            onChange={(e) => setSkorTIU(e.target.value === "" ? "" : Number(e.target.value))}
                                            className="w-full text-center border rounded-lg py-1.5 font-mono font-bold text-sm"
                                        />
                                        <div className="flex items-center justify-center gap-1 text-[11px]">
                                            {skdAnalytics.passTIU && typeof skorTIU === "number" ? (
                                                <span className="text-emerald-700 font-bold flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Lolos Passing
                                                </span>
                                            ) : (
                                                <span className="text-rose-600 font-bold flex items-center gap-1">
                                                    <XCircle className="w-3.5 h-3.5" /> Gugur Mutlak (&lt; 80)
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* TKP */}
                                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-slate-800">TKP (45 Soal)</span>
                                            <span className="font-mono text-[10px] text-slate-400">Min: 166</span>
                                        </div>
                                        <input
                                            type="number"
                                            min={0}
                                            max={225}
                                            placeholder="0"
                                            value={skorTKP}
                                            onChange={(e) => setSkorTKP(e.target.value === "" ? "" : Number(e.target.value))}
                                            className="w-full text-center border rounded-lg py-1.5 font-mono font-bold text-sm"
                                        />
                                        <div className="flex items-center justify-center gap-1 text-[11px]">
                                            {skdAnalytics.passTKP && typeof skorTKP === "number" ? (
                                                <span className="text-emerald-700 font-bold flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Lolos Passing
                                                </span>
                                            ) : (
                                                <span className="text-rose-600 font-bold flex items-center gap-1">
                                                    <XCircle className="w-3.5 h-3.5" /> Gugur Mutlak (&lt; 166)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Evaluasi SKD Kedinasan */}
                            <div
                                className={`p-4 rounded-2xl border text-xs space-y-1 ${skdAnalytics.isLulusPassingGrade
                                        ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                                        : "bg-rose-50 border-rose-300 text-rose-950"
                                    }`}
                            >
                                <div className="flex items-center justify-between font-mono font-bold">
                                    <span className="flex items-center gap-1.5">
                                        {skdAnalytics.isLulusPassingGrade ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                        ) : (
                                            <AlertTriangle className="w-4 h-4 text-rose-700" />
                                        )}
                                        <span>STATUS EVALUASI SKD BKN: {skdAnalytics.predikatKompetisi}</span>
                                    </span>
                                    <span className="text-base font-black">Total: {skdAnalytics.totalSKD} / 550</span>
                                </div>
                                <p className="text-[11px] leading-relaxed">
                                    {skdAnalytics.isLulusPassingGrade
                                        ? "Seluruh subtes memenuhi ambang batas passing grade MenPAN-RB. Lanjutkan ke pematangan tes fisik dan psikotes!"
                                        : "Terdapat subtes yang tidak mencapai passing grade minimum. Berdasarkan regulasi BKN, berkas otomatis diskualifikasi."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Tombol Lanjut ke Lembar Cetak Rapor */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={handleProceedToReport}
                            className="w-full py-4 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold rounded-2xl transition text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span>Buka Dokumen Rekomendasi Mandiri &amp; Ikatan Dinas Resmi</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}