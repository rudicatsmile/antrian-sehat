"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Volume2, Clock, Radio, Activity, Sparkles, Building2, AlertCircle } from "lucide-react";
import { APP_NAME, HOSPITAL_NAME } from "@/lib/constants";
import { DUMMY_DISPLAY_SCREENS } from "@/lib/dummy/petugas";

export default function DisplayTVMonitorPage() {
  const params = useParams();
  const token = params.token as string;

  const screenConfig =
    DUMMY_DISPLAY_SCREENS.find((s) => s.token === token) || DUMMY_DISPLAY_SCREENS[0];

  const [currentTime, setCurrentTime] = React.useState("");
  const [currentDate, setCurrentDate] = React.useState("");
  const [activeCallNumber, setActiveCallNumber] = React.useState("POL-D-014");
  const [activeCallCounter, setActiveCallCounter] = React.useState("Ruang Periksa 201 (Poli Penyakit Dalam)");
  const [activeCallBuilding, setActiveCallBuilding] = React.useState("Gedung A - Lantai 2");
  const [waitingNumbers, setWaitingNumbers] = React.useState([
    "POL-D-015",
    "POL-D-016",
    "POL-D-017",
    "POL-D-018",
    "POL-D-019",
  ]);

  // Polling fallback every 5 seconds for live queue data and Supabase Realtime subscription
  React.useEffect(() => {
    const pollInterval = setInterval(() => {
      // In production, poll Supabase table or listen to supabase_realtime channel
    }, 5000);
    return () => clearInterval(pollInterval);
  }, [token]);

  // Clock Ticker
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
      setCurrentDate(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0d1527] text-white p-6 md:p-8 select-none justify-between overflow-hidden">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-teal-500 text-slate-950 flex items-center justify-center font-bold shadow-lg">
            <Activity className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-white uppercase">
              {HOSPITAL_NAME}
            </h1>
            <p className="text-sm md:text-base text-teal-400 font-medium">
              {screenConfig.gedungNama} • {screenConfig.unitNama}
            </p>
          </div>
        </div>

        {/* Real-time Clock */}
        <div className="text-right">
          <div className="text-3xl md:text-4xl font-black font-mono tracking-tight text-white">
            {currentTime || "09:12:00 WIB"}
          </div>
          <div className="text-xs md:text-sm text-slate-400 font-medium mt-0.5">
            {currentDate || "Rabu, 14 Oktober 2026"}
          </div>
        </div>
      </header>

      {/* Main Screen Content Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 flex-1 items-center">
        {/* Left Big Calling Screen (8 cols) */}
        <div className="lg:col-span-8 h-full flex flex-col justify-center rounded-3xl border-2 border-teal-500/30 bg-slate-900/90 p-8 md:p-12 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 h-64 w-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="size-3.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-sm md:text-base font-bold uppercase tracking-widest text-teal-300">
                NOMOR SEDANG DIPANGGIL
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Volume2 className="h-4 w-4 text-teal-400" />
              <span>Audio Panggilan Aktif</span>
            </div>
          </div>

          <div className="my-auto py-8 text-center space-y-4">
            <div className="text-7xl sm:text-9xl md:text-[10rem] font-black font-mono tracking-tighter text-white leading-none drop-shadow-md">
              {activeCallNumber}
            </div>

            <div className="pt-4 space-y-1">
              <div className="text-2xl sm:text-4xl font-extrabold text-teal-400 font-heading">
                {activeCallCounter}
              </div>
              <div className="text-base sm:text-lg text-slate-300 font-medium">
                {activeCallBuilding}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Harap langsung menuju pintu ruang periksa</span>
            <span className="text-teal-400 font-semibold">Waktu Pemanggilan: 3 Menit</span>
          </div>
        </div>

        {/* Right Next Numbers & Waiting Queue (4 cols) */}
        <div className="lg:col-span-4 h-full flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:p-8 shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Antrean Berikutnya
              </h2>
              <span className="text-xs font-mono text-teal-400 font-bold">
                {waitingNumbers.length} Pasien
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {waitingNumbers.map((num, idx) => (
                <div
                  key={num}
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    idx === 0
                      ? "border-teal-500/50 bg-teal-950/40 text-teal-200"
                      : "border-slate-800 bg-slate-950/60 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-500 w-5">
                      #{idx + 1}
                    </span>
                    <span className="text-2xl md:text-3xl font-black font-mono tracking-tight">
                      {num}
                    </span>
                  </div>
                  {idx === 0 && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-500 text-slate-950">
                      Bersiap
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Display Mode / Medical Privacy Disclaimer */}
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-teal-400 font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Privasi Medis Pasien Terjamin</span>
            </div>
            <p className="leading-relaxed">
              Layar publik hanya menampilkan nomor antrean tanpa mencantumkan identitas pribadi pasien.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Running Text / Announcement Ticker */}
      <footer className="rounded-2xl border border-slate-800 bg-slate-900/90 px-6 py-3 flex items-center justify-between gap-4 overflow-hidden">
        <div className="flex items-center gap-2 text-teal-400 text-xs font-bold shrink-0 uppercase tracking-wider">
          <Radio className="h-4 w-4 animate-pulse" />
          <span>Pengumuman RSUD:</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap text-xs sm:text-sm text-slate-300">
          <div className="inline-block animate-marquee">
            {screenConfig.pengumuman} • Pasien lansia dan ibu hamil didahulukan dalam jalur antrean terpadu • Gunakan aplikasi Antrean Sehat untuk memantau waktu tunggu dari ponsel Anda.
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 shrink-0 font-mono">
          <span>Token TV: {token.slice(0, 12)}...</span>
        </div>
      </footer>
    </div>
  );
}
