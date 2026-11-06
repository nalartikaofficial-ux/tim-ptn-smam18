"use client";

import databaseSnbtLokal from "@/data/database_snbt.json";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Target,
    Search,
    BookOpen,
    X,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Zap,
    BarChart3,
    ArrowLeft,
    ChevronRight,
    Sparkles
} from "lucide-react";

interface ProdiItem {
    id: string;
    kodeKampus?: string;
    kampus: string;
    kodeProdi?: string | null;
    prodi: string;
    jenjang: string;
    dayaTampung: number;
    peminat: number;
    keketatan: number;
    passingGrade: number;
}

export default function ModulSNBTPage() {
    const router = useRouter();

    // 1. DATA DATABASE RESMI (145 PTN)
    const rawDatabase: ProdiItem[] = useMemo(() => {
        return Array.isArray(databaseSnbtLokal) ? (databaseSnbtLokal as ProdiItem[]) : [];
    }, []);

    // 2. STATE IDENTITAS & TARGET (BERSIH DARI DATA DUMMY AWAL)
    const [namaSiswa, setNamaSiswa] = useState("");
    const [kelasSiswa, setKelasSiswa] = useState("");

    const [target1, setTarget1] = useState<ProdiItem>({
        id: "default-1",
        kampus: "UNIVERSITAS SEBELAS MARET",
        prodi: "KEDOKTERAN",
        jenjang: "S1",
        dayaTampung: 73,
        peminat: 3450,
        keketatan: 2.12,
        passingGrade: 740
    });

    const [target2, setTarget2] = useState<ProdiItem>({
        id: "default-2",
        kampus: "INSTITUT TEKNOLOGI BANDUNG",
        prodi: "TEKNIK INFORMATIKA",
        jenjang: "S1",
        dayaTampung: 80,
        peminat: 3890,
        keketatan: 2.05,
        passingGrade: 745
    });

    // 3. MODAL SELECTOR STATE
    const [showModal, setShowModal] = useState(false);
    const [activeSlot, setActiveSlot] = useState<1 | 2>(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [jenjangFilter, setJenjangFilter] = useState<"ALL" | "S1" | "D4" | "D3">("ALL");

    const filteredProdi = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return rawDatabase.filter((item) => {
            const matchSearch =
                !q ||
                (item.prodi || "").toLowerCase().includes(q) ||
                (item.kampus || "").toLowerCase().includes(q);
            const matchJenjang = jenjangFilter === "ALL" || (item.jenjang || "S1") === jenjangFilter;
            return matchSearch && matchJenjang;
        });
    }, [rawDatabase, searchQuery, jenjangFilter]);

    const handleSelectProdi = (item: ProdiItem) => {
        if (activeSlot === 1) {
            setTarget1(item);
        } else {
            setTarget2(item);
        }
        setShowModal(false);
        setSearchQuery("");
    };

    // 4. SKOR 7 SUBTES (MULTI-TO) - BERSIH SECARA DEFAULT
    const [subtesScores, setSubtesScores] = useState<{ [key: string]: number[] }>({
        pu: [0, 0, 0],
        pk: [0, 0, 0],
        pm: [0, 0, 0],
        pbm: [0, 0, 0],
        ppu: [0, 0, 0],
        indo: [0, 0, 0],
        ing: [0, 0, 0]
    });

    const subtesLabels: { [key: string]: string } = {
        pu: "Penalaran Umum (PU)",
        pk: "Pengetahuan Kuantitatif (PK)",
        pm: "Penalaran Matematika (PM)",
        pbm: "Pemahaman Bacaan & Menulis (PBM)",
        ppu: "Pengetahuan & Pemahaman Umum (PPU)",
        indo: "Literasi Bahasa Indonesia",
        ing: "Literasi Bahasa Inggris"
    };

    // Fitur muat data contoh untuk simulasi/presentasi
    const handleLoadContohData = () => {
        setNamaSiswa("FADHILLAH UMAR");
        setKelasSiswa("XII - 1");
        setSubtesScores({
            pu: [640, 675, 720],
            pk: [650, 685, 735],
            pm: [630, 675, 720],
            pbm: [620, 660, 690],
            ppu: [610, 645, 680],
            indo: [650, 685, 720],
            ing: [640, 670, 700]
        });
    };

    // 5. ENGINE ANALISIS MULTI-TO
    const analytics = useMemo(() => {
        const keys = Object.keys(subtesScores);
        const count = keys.length || 7;

        const avgTO1 = Math.round(keys.reduce((acc, k) => acc + (subtesScores[k][0] || 0), 0) / count);
        const avgTO2 = Math.round(keys.reduce((acc, k) => acc + (subtesScores[k][1] || 0), 0) / count);
        const avgTO3 = Math.round(keys.reduce((acc, k) => acc + (subtesScores[k][2] || 0), 0) / count);

        // Weighted Score: Bobot 20% TO 1, 30% TO 2, 50% TO 3
        const weightedScore = Math.round(avgTO1 * 0.2 + avgTO2 * 0.3 + avgTO3 * 0.5);
        const deltaTotal = avgTO3 - avgTO1;
        const velocity = Math.round(deltaTotal / 2);

        // Identifikasi Subtes Terlemah & Terkuat
        let bottleneckKey = keys[0];
        let minScore = 9999;
        let strongestKey = keys[0];
        let maxScore = -1;

        keys.forEach((k) => {
            const val = subtesScores[k][2] || 0;
            if (val < minScore) {
                minScore = val;
                bottleneckKey = k;
            }
            if (val > maxScore) {
                maxScore = val;
                strongestKey = k;
            }
        });

        const calcPeluang = (prodi: ProdiItem) => {
            if (weightedScore === 0) return 0;
            const diff = weightedScore - (prodi.passingGrade || 650);
            let p = Math.round(55 + diff * 0.85);
            if (prodi.keketatan < 2.5) p -= 5;
            return Math.max(10, Math.min(96, p));
        };

        return {
            avgTO1,
            avgTO2,
            avgTO3,
            weightedScore,
            deltaTotal,
            velocity,
            bottleneck: { label: subtesLabels[bottleneckKey], score: minScore === 9999 ? 0 : minScore },
            strongest: { label: subtesLabels[strongestKey], score: maxScore === -1 ? 0 : maxScore },
            peluang1: calcPeluang(target1),
            peluang2: calcPeluang(target2)
        };
    }, [subtesScores, target1, target2]);

    // 6. GENERATE & LANJUT KE RAPOR
    const handleProceedToReport = () => {
        const reportData = {
            namaSiswa: (namaSiswa || "SISWA PESERTA ASESMEN").toUpperCase(),
            kelasSiswa: (kelasSiswa || "XII").toUpperCase(),
            tanggal: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
            target1,
            target2,
            subtesScores,
            analytics
        };
        localStorage.setItem("m18_snbt_report_data", JSON.stringify(reportData));
        router.push("/snbt/report");
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-16">
            {/* MODAL SEARCH SELEKTOR PRODI RESMI */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in max-h-[85vh] flex flex-col text-left">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-slate-900">
                                        Database SNBT &bull; Pilih Target {activeSlot === 1 ? "Pilihan 1" : "Pilihan 2"}
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Menampilkan prodi terdaftar resmi SNPMB ({filteredProdi.length} program studi)
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg border hover:bg-slate-50 text-slate-500 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Cari kampus (UNS, UI, ITB, UGM) atau program studi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-blue-700"
                                />
                            </div>

                            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
                                {(["ALL", "S1", "D4", "D3"] as const).map((j) => (
                                    <button
                                        key={j}
                                        onClick={() => setJenjangFilter(j)}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${jenjangFilter === j ? "bg-[#1e3a8a] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                                            }`}
                                    >
                                        {j === "ALL" ? "Semua Jenjang" : j}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[300px]">
                            {filteredProdi.slice(0, 50).map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleSelectProdi(item)}
                                    className="p-3 rounded-2xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 cursor-pointer transition-all space-y-1 text-left group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="px-1.5 py-0.2 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[9px] font-bold">
                                                {item.jenjang || "S1"}
                                            </span>
                                            <span className="text-xs font-black text-slate-900 group-hover:text-blue-900">{item.prodi}</span>
                                        </div>
                                        <span className="font-mono text-[10px] text-blue-700 font-bold">PG: &ge; {item.passingGrade}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                                        <span>{item.kampus}</span>
                                        <span>Daya: {item.dayaTampung} | Keketatan: {item.keketatan}%</span>
                                    </div>
                                </div>
                            ))}

                            {filteredProdi.length === 0 && (
                                <div className="text-center py-12 text-slate-400 text-xs font-medium">
                                    Program studi tidak ditemukan. Periksa kembali kata kunci pencarian Anda.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
                            <span className="text-[10px] text-blue-800 font-mono font-bold block">
                                MODUL ANALISIS &amp; DIAGNOSTIK SNBT 2026
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono text-xs font-bold text-slate-700 hidden sm:inline">
                            Database SNBT Terhubung
                        </span>
                    </div>
                </div>
            </header>

            {/* KONTEN UTAMA MODUL SNBT */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
                {/* BANNER MODUL */}
                <div className="bg-gradient-to-r from-slate-900 via-[#1e3a8a] to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                    <div className="space-y-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-blue-950 text-[10px] font-black uppercase tracking-wider">
                            Diagnostik Terstandarisasi
                        </span>
                        <h1 className="text-xl sm:text-2xl font-black">Modul Analisis Multi-Try Out SNBT</h1>
                        <p className="text-xs text-blue-200">
                            Evaluasi kurva kenaikan skor 7 subtes berkala terhadap passing grade resmi 145 PTN nasional.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleLoadContohData}
                        className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 rounded-xl text-xs font-black transition shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                        <Zap className="w-4 h-4" />
                        <span>Muat Data Contoh</span>
                    </button>
                </div>

                {/* FORM CONTAINER */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8 text-left">
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
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-700 outline-none uppercase"
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
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-700 outline-none uppercase font-mono"
                            />
                        </div>
                    </div>

                    {/* Target Pilihan 1 & 2 */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-700" />
                            <span>Target Program Studi &amp; Perguruan Tinggi Negeri</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Card Pilihan 1 */}
                            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-blue-950 uppercase">PILIHAN 1 (UTAMA)</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveSlot(1);
                                            setShowModal(true);
                                        }}
                                        className="text-[10.5px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                                    >
                                        <Search className="w-3 h-3" />
                                        <span>Ubah dari Database</span>
                                    </button>
                                </div>

                                <div className="bg-white p-3.5 rounded-xl border border-blue-200 space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-mono text-[9px] font-bold">
                                            {target1.jenjang || "S1"}
                                        </span>
                                        <span className="text-xs font-black text-slate-900">{target1.prodi}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 font-medium">{target1.kampus}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-600">
                                    <div>
                                        <span className="text-slate-400 block text-[9px]">Daya Tampung:</span>
                                        <strong className="text-slate-900">{target1.dayaTampung} Kursi</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[9px]">Keketatan:</span>
                                        <strong className="text-rose-600">{target1.keketatan}%</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[9px]">Min Passing Grade:</span>
                                        <strong className="text-emerald-700">&ge; {target1.passingGrade}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Card Pilihan 2 */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-700 uppercase">PILIHAN 2 (CADANGAN)</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveSlot(2);
                                            setShowModal(true);
                                        }}
                                        className="text-[10.5px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                                    >
                                        <Search className="w-3 h-3" />
                                        <span>Ubah dari Database</span>
                                    </button>
                                </div>

                                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono text-[9px] font-bold">
                                            {target2.jenjang || "S1"}
                                        </span>
                                        <span className="text-xs font-black text-slate-900">{target2.prodi}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 font-medium">{target2.kampus}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-600">
                                    <div>
                                        <span className="text-slate-400 block text-[9px]">Daya Tampung:</span>
                                        <strong className="text-slate-900">{target2.dayaTampung} Kursi</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[9px]">Keketatan:</span>
                                        <strong className="text-rose-600">{target2.keketatan}%</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[9px]">Min Passing Grade:</span>
                                        <strong className="text-emerald-700">&ge; {target2.passingGrade}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid Input 7 Subtes Multi-TO */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                                    Matriks Nilai 7 Subtes UTBK (Skala 200–1000)
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Lacak perkembangan skor dari Try Out 1 sampai Try Out 3.
                                </p>
                            </div>
                            <span className="text-[10.5px] font-mono font-bold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
                                Laju Belajar: {analytics.velocity >= 0 ? `+${analytics.velocity}` : analytics.velocity} Poin/TO
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
                                <thead className="bg-slate-100 text-slate-700 font-mono text-[11px]">
                                    <tr>
                                        <th className="p-3">SUBTES UTBK</th>
                                        <th className="p-3 text-center">TO 1 (AWAL)</th>
                                        <th className="p-3 text-center">TO 2 (MID)</th>
                                        <th className="p-3 text-center bg-blue-50 text-blue-950 font-black">TO 3 (AKHIR)</th>
                                        <th className="p-3 text-center">DELTA &amp; TREN</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {Object.entries(subtesScores).map(([k, vals]) => {
                                        const deltaSub = (vals[2] || 0) - (vals[0] || 0);
                                        const isUp = deltaSub >= 0;

                                        return (
                                            <tr key={k} className="hover:bg-slate-50/70">
                                                <td className="p-3 font-bold text-slate-800">{subtesLabels[k]}</td>
                                                {[0, 1, 2].map((idx) => (
                                                    <td key={idx} className={`p-2.5 text-center ${idx === 2 ? "bg-blue-50/40" : ""}`}>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={1000}
                                                            placeholder="0"
                                                            value={vals[idx] !== 0 ? vals[idx] : ""}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value) || 0;
                                                                const copy = [...vals];
                                                                copy[idx] = val;
                                                                setSubtesScores({ ...subtesScores, [k]: copy });
                                                            }}
                                                            className={`w-20 text-center border rounded-lg py-1.5 px-1 text-xs font-mono font-bold ${idx === 2
                                                                    ? "bg-white border-blue-400 text-blue-950 shadow-2xs"
                                                                    : "bg-slate-50 border-slate-200"
                                                                }`}
                                                        />
                                                    </td>
                                                ))}
                                                <td className="p-2.5 text-center font-mono font-bold text-xs">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] ${isUp
                                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                : "bg-rose-50 text-rose-700 border border-rose-200"
                                                            }`}
                                                    >
                                                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                        <span>{isUp ? `+${deltaSub}` : deltaSub}</span>
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Dashboard Diagnostik */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                            <span className="text-[10px] font-mono font-bold text-blue-800 uppercase block">
                                SKOR PROYEKSI HARI-H (WEIGHTED)
                            </span>
                            <p className="text-3xl font-black text-blue-950">{analytics.weightedScore}</p>
                            <p className="text-[10.5px] text-blue-700">Formula Bobot: 50% TO 3 + 30% TO 2 + 20% TO 1</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                            <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">
                                SUBTES TERTINGGI (ASET UTAMA)
                            </span>
                            <p className="text-sm font-black text-emerald-950">{analytics.strongest.label}</p>
                            <p className="text-xs font-mono font-bold text-emerald-700">Skor: {analytics.strongest.score} Poin</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                            <span className="text-[10px] font-mono font-bold text-amber-900 uppercase block flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                <span>BOTTLENECK (PRIORITAS EVALUASI)</span>
                            </span>
                            <p className="text-sm font-black text-amber-950">{analytics.bottleneck.label}</p>
                            <p className="text-xs font-mono font-bold text-amber-800">
                                Skor: {analytics.bottleneck.score} Poin &bull; Perlu latihan intensif
                            </p>
                        </div>
                    </div>

                    {/* Tombol Lanjut ke Rapor */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={handleProceedToReport}
                            className="w-full py-4 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold rounded-2xl transition text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span>Buka Dokumen Rapor Diagnostik Multi-TO &amp; Rekomendasi Resmi</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}