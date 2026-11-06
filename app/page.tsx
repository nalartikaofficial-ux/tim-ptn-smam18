"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Shield,
  ArrowRight,
  Sparkles,
  School,
  GraduationCap,
  Layers,
  CheckCircle2
} from "lucide-react";

export default function HubPortalLandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    const totalDuration = 700;
    const interval = 20;
    const steps = totalDuration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setLoadProgress(Math.min(100, Math.round((currentStep / steps) * 100)));
      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => setIsLoading(false), 100);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-700 selection:text-white">
      {/* BOOTLOADER SPLASH SCREEN */}
      <div
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-all duration-500 ease-in-out ${isLoading ? "opacity-100 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
      >
        <div className="flex flex-col items-center space-y-4 px-4 text-center">
          {/* Logo Sekolah di Splash Screen */}
          <div className="w-20 h-20 p-2 rounded-2xl bg-white border border-slate-200 shadow-xl flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Logo SMA Muhammadiyah 18 Jakarta"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-1">
            <span className="font-mono text-[10px] font-bold text-blue-700 uppercase tracking-widest block">
              TIM PTN &bull; DECISION SUPPORT SYSTEM
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              SMA MUHAMMADIYAH 18 JAKARTA
            </h2>
            <p className="text-xs text-slate-500 font-medium">School of Champions</p>
          </div>
          <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200 mt-2">
            <div
              className="h-full bg-[#1e3a8a] rounded-full transition-all duration-75"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Logo Sekolah di Navbar */}
            <div className="w-12 h-12 p-1 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
              <img
                src="/logo.png"
                alt="Logo SMA Muhammadiyah 18 Jakarta"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black tracking-tight text-[#1e3a8a] uppercase">
                  SMA MUHAMMADIYAH 18 JAKARTA
                </span>
                <span className="hidden sm:inline-block px-2 py-0.2 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-mono text-[9.5px] font-bold">
                  TIM PTN
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Pusat Analisis &amp; Sistem Pengambilan Keputusan Kelulusan PTN 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10.5px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              145 PTN Terverifikasi
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* HERO BANNER */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1e3a8a] to-blue-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-blue-950 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Pemetaan Terpadu Angkatan 2026</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Pilih Instrumen Jalur Masuk Perguruan Tinggi Anda
            </h1>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Layanan konseling akademik dan bimbingan karir siswa SMA Muhammadiyah 18 Jakarta. Pilih salah satu modul analitik spesifik di bawah untuk melakukan simulasi, pelacakan kurva belajar, dan evaluasi passing grade resmi.
            </p>
          </div>
        </div>

        {/* 3 CARD PILIHAN JALUR UTAMA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* 1. KARTU SNBP */}
          <Link
            href="/snbp"
            className="group bg-white rounded-3xl border-2 border-slate-200 hover:border-emerald-600 p-7 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📊
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                  Jalur Prestasi Rapor
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2 group-hover:text-emerald-700 transition-colors">
                  Modul SNBP Multirumpun
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Formula kalkulasi seimbang <b>50% Skor TKA IRT + 50% Nilai Rapor Semester 1–5</b>, verifikasi mata pelajaran pendukung prodi, dan pembobotan ranking paralel.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 text-[11px] font-medium text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Linearitas Mapel Kepmen 345/M/2022</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Konversi Rapor ke Skala Baku IRT</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
              <span>Buka Analisis SNBP</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* 2. KARTU SNBT */}
          <Link
            href="/snbt"
            className="group bg-white rounded-3xl border-2 border-slate-200 hover:border-[#1e3a8a] p-7 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-[#1e3a8a] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📝
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#1e3a8a] uppercase tracking-wide">
                  Jalur Tes UTBK-SNBT
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2 group-hover:text-[#1e3a8a] transition-colors">
                  Modul Multi-TO &amp; IRT SNBT
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Tracking komparasi progres 3 gelombang Try Out berkala, perhitungan <b>Weighted Proyeksi Hari-H (50:30:20)</b>, dan deteksi subtes penghambat (*bottleneck*).
                </p>
              </div>

              <div className="space-y-1.5 pt-2 text-[11px] font-medium text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                  <span>Koneksi 145 PTN dari Database Resmi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                  <span>Evaluasi Kurva Pertumbuhan (&Delta; Delta)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1e3a8a] group-hover:translate-x-0.5 transition-transform">
              <span>Buka Analisis SNBT</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* 3. KARTU MANDIRI / DINAS */}
          <Link
            href="/mandiri"
            className="group bg-white rounded-3xl border-2 border-slate-200 hover:border-indigo-600 p-7 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🛡️
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 uppercase tracking-wide">
                  Kedinasan &amp; Jalur Mandiri
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2 group-hover:text-indigo-700 transition-colors">
                  Modul Mandiri, Seni &amp; Dinas
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Kalkulator modal akademik jalur mandiri PTN, pembobotan <b>Sertifikat Tahfidz Qur'an (&ge; 3 Juz)</b>, portofolio seni/olahraga, dan simulasi ikatan dinas (STAN/STIS).
                </p>
              </div>

              <div className="space-y-1.5 pt-2 text-[11px] font-medium text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Konversi Sertifikat Juara &amp; Portofolio</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Simulasi Mitigasi Seleksi Cadangan</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700 group-hover:translate-x-0.5 transition-transform">
              <span>Buka Analisis Mandiri</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-16 text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Logo Sekolah di Footer */}
            <div className="w-9 h-9 p-1 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
              <img
                src="/logo.png"
                alt="Logo SMA Muhammadiyah 18 Jakarta"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left">
              <span className="font-bold text-slate-800 block">TIM PTN &bull; SMA Muhammadiyah 18 Jakarta</span>
              <span className="text-[10px] text-slate-400">Jl. Cipulir I No.15, Kebayoran Lama, Jakarta Selatan</span>
            </div>
          </div>
          <p className="font-mono text-[11px] text-slate-400">
            &copy; 2026 EduAnalytics DSS Platform &bull; All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}