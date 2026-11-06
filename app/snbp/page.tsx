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
    BarChart3,
    ArrowLeft,
    ChevronRight,
    Zap,
    CheckCircle2,
    GraduationCap,
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

export default function ModulSNBPPage() {
    const router = useRouter();

    // 1. DATA DATABASE RESMI (145 PTN LENGKAP)
    const rawDatabase: ProdiItem[] = useMemo(() => {
        return Array.isArray(databaseSnbtLokal) ? (databaseSnbtLokal as ProdiItem[]) : [];
    }, []);

    // 2. STATE IDENTITAS SISWA & KELAS
    const [namaSiswa, setNamaSiswa] = useState("Fadhillah Umar");
    const [kelasSiswa, setKelasSiswa] = useState("XII - 1");
    const [rankingParalel, setRankingParalel] = useState(1);
    const [rumpun, setRumpun] = useState<"SAINTEK" | "SOSHUM">("SAINTEK");
    const [skorTKA, setSkorTKA] = useState(740);
    const [catatanKonseling, setCatatanKonseling] = useState(
        "Profil akademik linear dan sangat konsisten. Pertahankan kestabilan nilai semester 5 untuk memaksimalkan peluang SNBP."
    );

    // 3. TARGET PRODI PILIHAN 1 & 2
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
        kampus: "UNIVERSITAS INDONESIA",
        prodi: "FARMASI",
        jenjang: "S1",
        dayaTampung: 45,
        peminat: 1600,
        keketatan: 2.81,
        passingGrade: 710
    });

    // 4. MODAL SEARCH SELEKTOR PRODI
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

    // 5. MATA PELAJARAN MULTIRUMPUN
    const mapelSaintek = [
        { id: "mtk_umum", name: "Matematika Umum" },
        { id: "mtk_lanjut", name: "Matematika Tingkat Lanjut" },
        { id: "fisika", name: "Fisika" },
        { id: "kimia", name: "Kimia" },
        { id: "biologi", name: "Biologi" },
        { id: "bindo", name: "Bahasa Indonesia" },
        { id: "bing", name: "Bahasa Inggris" }
    ];

    const mapelSoshum = [
        { id: "mtk_umum", name: "Matematika Umum" },
        { id: "ekonomi", name: "Ekonomi" },
        { id: "sosiologi", name: "Sosiologi" },
        { id: "geografi", name: "Geografi" },
        { id: "sejarah", name: "Sejarah" },
        { id: "sejarah_lanjut", name: "Sejarah Tingkat Lanjut" },
        { id: "ppkn", name: "Pendidikan Pancasila / PKn" },
        { id: "bindo", name: "Bahasa Indonesia" },
        { id: "bing", name: "Bahasa Inggris" }
    ];

    const activeMapelList = rumpun === "SAINTEK" ? mapelSaintek : mapelSoshum;
    const [raporData, setRaporData] = useState<Record<string, number[]>>({});

    const handleIsiContohRapor = () => {
        const dummy: Record<string, number[]> = {};
        activeMapelList.forEach((m) => {
            dummy[m.id] = [90, 92, 93, 94, 96];
        });
        setRaporData(dummy);
        setSkorTKA(740);
    };

    const handleResetRapor = () => {
        setRaporData({});
        setSkorTKA(500);
    };

    const hitungRataRow = (mId: string) => {
        const vals = raporData[mId] || [];
        if (vals.length === 0) return 0;
        return vals.reduce((a, b) => a + b, 0) / vals.length || 0;
    };

    // 6. ENGINE KALKULASI 50:50 SNBP
    const hitungGrandTotal = () => {
        let sum = 0;
        let count = 0;
        activeMapelList.forEach((m) => {
            const avg = hitungRataRow(m.id);
            if (avg > 0) {
                sum += avg;
                count++;
            }
        });
        return count > 0 ? sum / count : 0;
    };

    const grandAvgRapor = hitungGrandTotal();
    // Konversi Rapor skala 0-100 ke skala baku IRT 200-800
    const raporIRT = grandAvgRapor > 0 ? Math.round(200 + (grandAvgRapor / 100) * 600) : 0;
    // Modal 50% TKA + 50% Rapor
    const modalAkademikSNBP = Math.round(skorTKA * 0.5 + raporIRT * 0.5);

    const calcPeluangSNBP = (target: ProdiItem, isPilihan2 = false) => {
        const rasio = target.peminat > 0 ? target.dayaTampung / target.peminat : 0.05;
        let baseBenchmark = target.passingGrade || 680;

        if (rasio < 0.03) baseBenchmark += 15;
        else if (rasio > 0.15) baseBenchmark -= 15;

        const delta = modalAkademikSNBP - baseBenchmark;
        let prob = isPilihan2 ? Math.round(48 + delta * 0.6) : Math.round(62 + delta * 0.75);
        return Math.max(10, Math.min(96, prob));
    };

    const peluangP1 = calcPeluangSNBP(target1, false);
    const peluangP2 = calcPeluangSNBP(target2, true);

    // 7. TERUSKAN KE LEMBAR RAPOR RESMI SNBP
    const handleProceedToReport = () => {
        const payload = {
            namaSiswa,
            kelasSiswa,
            rankingParalel,
            rumpun,
            tanggal: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
            target1,
            target2,
            grandAvgRapor: Number(grandAvgRapor.toFixed(1)),
            raporIRT,
            skorTKA,
            modalAkademikSNBP,
            peluangP1,
            peluangP2,
            catatanKonseling,
            raporData,
            activeMapelList
        };
        localStorage.setItem("m18_snbp_report_data", JSON.stringify(payload));
        router.push("/snbp/report");
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-16">
            {/* MODAL SEARCH DATABASE PRODI */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in max-h-[85vh] flex flex-col text-left">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-slate-900">
                                        Database SNBP &bull; Pilih Target {activeSlot === 1 ? "Pilihan 1" : "Pilihan 2"}
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Menampilkan data daya tampung &amp; keketatan resmi ({filteredProdi.length} prodi)
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
                                    placeholder="Cari kampus (UNS, UI, UGM) atau program studi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-700"
                                />
                            </div>

                            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
                                {(["ALL", "S1", "D4", "D3"] as const).map((j) => (
                                    <button
                                        key={j}
                                        onClick={() => setJenjangFilter(j)}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${jenjangFilter === j ? "bg-emerald-800 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
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
                                    className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 cursor-pointer transition-all space-y-1 text-left group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold">
                                                {item.jenjang || "S1"}
                                            </span>
                                            <span className="text-xs font-black text-slate-900 group-hover:text-emerald-900">{item.prodi}</span>
                                        </div>
                                        <span className="font-mono text-[10px] text-emerald-700 font-bold">PG: &ge; {item.passingGrade}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                                        <span>{item.kampus}</span>
                                        <span>Daya: {item.dayaTampung} | Keketatan: {item.keketatan}%</span>
                                    </div>
                                </div>
                            ))}

                            {filteredProdi.length === 0 && (
                                <div className="text-center py-12 text-slate-400 text-xs font-medium">
                                    Program studi tidak ditemukan. Periksa kata kunci pencarian Anda.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER NAVIGASI */}
            <header className="border-b bg-white sticky top-0 z-30 shadow-2xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-900 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Portal Hub</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="font-mono text-xs font-bold text-slate-700">Database SNBP Terverifikasi</span>
                    </div>
                </div>
            </header>

            {/* KONTEN UTAMA MODUL SNBP */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
                {/* BANNER MODUL */}
                <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                    <div className="space-y-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 text-[10px] font-black uppercase tracking-wider">
                            Jalur Prestasi Nasional
                        </span>
                        <h1 className="text-xl sm:text-2xl font-black">Modul Analisis Linearitas &amp; Rasionalisasi SNBP</h1>
                        <p className="text-xs text-emerald-200">
                            Perhitungan seimbang 50% Nilai Rapor Semester 1–5 + 50% Skor TKA Skala Murni IRT (200–800).
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleIsiContohRapor}
                        className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 rounded-xl text-xs font-black transition shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                        <Zap className="w-4 h-4" />
                        <span>Simulasi Nilai Rapor</span>
                    </button>
                </div>

                {/* FORM GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                    {/* Kolom Kiri: Identitas & Pilihan Prodi */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Card Identitas */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-700 text-white text-[10px]">
                                    1
                                </span>
                                Identitas Siswa &amp; Kelompok Belajar
                            </h3>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Siswa</label>
                                <input
                                    type="text"
                                    value={namaSiswa}
                                    onChange={(e) => setNamaSiswa(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-700 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Kelas</label>
                                    <input
                                        type="text"
                                        value={kelasSiswa}
                                        onChange={(e) => setKelasSiswa(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:bg-white focus:border-emerald-700 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Ranking Paralel</label>
                                    <input
                                        type="number"
                                        value={rankingParalel}
                                        onChange={(e) => setRankingParalel(Number(e.target.value))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-emerald-900 focus:bg-white focus:border-emerald-700 outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Kelompok Rumpun Jurusan</label>
                                <select
                                    value={rumpun}
                                    onChange={(e) => setRumpun(e.target.value as any)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                                >
                                    <option value="SAINTEK">SAINTEK (Matematika &amp; Ilmu Alam)</option>
                                    <option value="SOSHUM">SOSHUM (Ilmu Sosial &amp; Humaniora)</option>
                                </select>
                            </div>
                        </div>

                        {/* Card Target Prodi */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-700 text-white text-[10px]">
                                    2
                                </span>
                                Target Program Studi &amp; PTN Impian
                            </h3>

                            {/* Target 1 */}
                            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-emerald-950 uppercase">PILIHAN 1 (PRIORITAS)</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveSlot(1);
                                            setShowModal(true);
                                        }}
                                        className="text-[10.5px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                                    >
                                        <Search className="w-3 h-3" />
                                        <span>Ubah dari Database</span>
                                    </button>
                                </div>

                                <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold">
                                            {target1.jenjang || "S1"}
                                        </span>
                                        <span className="text-xs font-black text-slate-900">{target1.prodi}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 font-medium">{target1.kampus}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-600">
                                    <div>
                                        <span className="text-slate-400 block text-[9px]">Daya Tampung:</span>
                                        <strong className="text-slate-900">{target1.dayaTampung}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[9px]">Keketatan:</span>
                                        <strong className="text-rose-600">{target1.keketatan}%</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[9px]">Passing Grade:</span>
                                        <strong className="text-emerald-700">&ge; {target1.passingGrade}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Target 2 */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-700 uppercase">PILIHAN 2 (CADANGAN)</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveSlot(2);
                                            setShowModal(true);
                                        }}
                                        className="text-[10.5px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                                    >
                                        <Search className="w-3 h-3" />
                                        <span>Ubah dari Database</span>
                                    </button>
                                </div>

                                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-0.5">
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
                                        <strong className="text-slate-900">{target2.dayaTampung}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[9px]">Keketatan:</span>
                                        <strong className="text-rose-600">{target2.keketatan}%</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[9px]">Passing Grade:</span>
                                        <strong className="text-emerald-700">&ge; {target2.passingGrade}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kolom Kanan: Rapor 5 Smt & Skor TKA */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-700 text-white text-[10px]">
                                        3
                                    </span>
                                    Nilai Rapor Semester 1 s/d 5 (Kurikulum Merdeka)
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleResetRapor}
                                        className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>

                            {/* Tabel Nilai Rapor */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-slate-500 font-mono text-[10px]">
                                            <th className="py-2.5 font-bold uppercase w-44">Mata Pelajaran</th>
                                            <th className="py-2.5 text-center font-bold">Smt 1</th>
                                            <th className="py-2.5 text-center font-bold">Smt 2</th>
                                            <th className="py-2.5 text-center font-bold">Smt 3</th>
                                            <th className="py-2.5 text-center font-bold">Smt 4</th>
                                            <th className="py-2.5 text-center font-bold text-amber-800 bg-amber-50 rounded">Smt 5</th>
                                            <th className="py-2.5 text-center font-bold text-emerald-950 bg-emerald-50 rounded">Rata-rata</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {activeMapelList.map((m) => {
                                            const avg = hitungRataRow(m.id);
                                            return (
                                                <tr key={m.id} className="hover:bg-slate-50/70">
                                                    <td className="py-2 font-semibold text-slate-800 text-xs">{m.name}</td>
                                                    {[0, 1, 2, 3, 4].map((idx) => (
                                                        <td key={idx} className={`py-1.5 px-1 text-center ${idx === 4 ? "bg-amber-50/40" : ""}`}>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={100}
                                                                className={`w-11 text-center rounded-lg py-1 text-xs font-mono font-bold border ${idx === 4
                                                                        ? "bg-white border-amber-300 text-amber-900 shadow-2xs"
                                                                        : "bg-slate-50 border-slate-200"
                                                                    }`}
                                                                value={raporData[m.id]?.[idx] || ""}
                                                                onChange={(e) => {
                                                                    const val = parseFloat(e.target.value) || 0;
                                                                    const updated = [...(raporData[m.id] || [0, 0, 0, 0, 0])];
                                                                    updated[idx] = val;
                                                                    setRaporData({ ...raporData, [m.id]: updated });
                                                                }}
                                                            />
                                                        </td>
                                                    ))}
                                                    <td className="py-1.5 px-2 text-center font-bold text-emerald-950 bg-emerald-50/60 rounded text-xs font-mono">
                                                        {avg.toFixed(1)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Input Skor TKA IRT */}
                            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-indigo-950 uppercase tracking-wide">
                                        Skor TKA Terstandarisasi Siswa (Skala IRT 200–800)
                                    </span>
                                    <span className="px-2 py-0.5 bg-amber-400 text-amber-950 text-[10px] font-black rounded font-mono">
                                        Bobot 50%
                                    </span>
                                </div>
                                <p className="text-[11px] text-indigo-800 leading-relaxed">
                                    Modal Akademik dihitung seimbang: <b>50% Skor TKA IRT + 50% Rata-rata Rapor (dikonversi ke skala 200–800)</b> secara linear.
                                </p>
                                <div className="flex items-center gap-3 pt-1">
                                    <input
                                        type="number"
                                        min={200}
                                        max={800}
                                        value={skorTKA}
                                        onChange={(e) => setSkorTKA(Number(e.target.value))}
                                        className="w-32 text-center bg-white border-2 border-indigo-300 rounded-xl py-2 text-sm font-black text-indigo-950 focus:border-emerald-700 outline-none shadow-xs font-mono"
                                    />
                                    <span className="text-xs text-indigo-900 font-bold">Skor Baku IRT Asesmen Terstandarisasi</span>
                                </div>
                            </div>

                            {/* Catatan Konseling */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-800 uppercase">Catatan Pembimbing / Konselor BK:</label>
                                <textarea
                                    rows={2}
                                    value={catatanKonseling}
                                    onChange={(e) => setCatatanKonseling(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-emerald-700 outline-none text-slate-800"
                                />
                            </div>

                            {/* Ringkasan & Tombol Lanjut ke Rapor */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-slate-700">
                                        Rata-Rata Rapor: <span className="text-slate-900 font-black">{grandAvgRapor.toFixed(1)}</span> (~{raporIRT} IRT)
                                    </p>
                                    <p className="text-xs font-bold text-slate-700">
                                        Modal Akademik 50:50: <span className="text-emerald-700 text-sm font-black">{modalAkademikSNBP} Poin IRT</span>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleProceedToReport}
                                    className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-2xl transition shadow cursor-pointer flex items-center gap-2"
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    <span>Buka Lembar Keputusan Rapor SNBP</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}