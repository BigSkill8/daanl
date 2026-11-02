"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Menu, X, ArrowUpRight, UploadCloud, BarChart3, 
  Brain, LineChart, Briefcase, GraduationCap, TrendingUp,
  Code2, Database, Layout, ShieldCheck, Globe, MessageCircle, Share2, Sun, Moon
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    const savedTheme = localStorage.getItem("daanl_theme") as "light" | "dark" | null;
    if (savedTheme) setTheme(savedTheme);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("daanl_theme", theme);
  }, [theme]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0B1120] z-[100]">
        <motion.img src="/logo.jpeg" alt="DAANL Logo" className="w-16 h-16 object-contain dark:brightness-0 dark:invert" animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
        <p className="mt-4 text-xs font-mono tracking-widest text-gray-500 uppercase">Loading DAANL...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col bg-gray-50 dark:bg-[#0B1120] transition-colors duration-300">
      
      {/* BACKGROUND MOTION SHAPES */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div animate={{ y: [0, -30, 0], rotate: [0, 45, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 left-1/4 w-32 h-32 border border-black/10 dark:border-white/10 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg" />
        <motion.div animate={{ y: [0, 40, 0], rotate: [0, -30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-black/10 dark:border-white/10 bg-slate-300/40 dark:bg-slate-700/40 rounded-full" />
      </div>

      {/* TOP NAVIGATION */}
      <nav className="relative z-40 flex justify-between items-center p-8 md:p-12">
        <img src="/logo.jpeg" alt="DAANL Logo" className="h-8 w-auto dark:brightness-0 dark:invert transition-all" />
        <div className="flex items-center gap-4">
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="p-2 rounded-full bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20 transition-all">
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-2 text-sm font-semibold tracking-wide text-black dark:text-white hover:opacity-70 transition-opacity">
            Menu <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-grow flex flex-col px-8 md:px-12 max-w-7xl mx-auto w-full pb-20">
        <div className="flex flex-col gap-32 mt-10">
          
          {/* HERO */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-[12vw] md:text-[8vw] leading-[0.85] font-bold tracking-tighter text-black dark:text-white">
              Data Analysis <br /> Based in <span className="text-gray-400 dark:text-gray-600">AI.</span>
            </h1>
            <div className="mt-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <p className="max-w-md text-gray-600 dark:text-gray-400 text-lg md:text-xl font-medium">
                We're not just an analytics tool. Turn your messy Excel and PDF files into intelligent, interactive insights.
              </p>
              <button onClick={() => router.push("/workspace")} className="w-28 h-28 bg-black dark:bg-white text-white dark:text-black rounded-full flex flex-col items-center justify-center text-xs font-bold uppercase tracking-wider cursor-pointer hover:scale-105 transition-transform shadow-xl">
                <span>Start Now</span>
                <ArrowUpRight className="w-4 h-4 mt-1" />
              </button>
            </div>
          </motion.div>

          {/* HOW IT WORKS */}
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold mb-12 border-b border-black/10 dark:border-white/10 pb-4 text-black dark:text-white">How it works.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl shadow-sm border border-black/5 dark:border-white/5"><UploadCloud className="w-10 h-10 mb-6 text-black dark:text-white" /><h3 className="text-xl font-bold mb-2 text-black dark:text-white">1. Upload File</h3><p className="text-gray-500 dark:text-gray-400">Drag and drop your CSV, Excel, or PDF file. We handle the extraction instantly.</p></div>
              <div className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl shadow-sm border border-black/5 dark:border-white/5"><Brain className="w-10 h-10 mb-6 text-black dark:text-white" /><h3 className="text-xl font-bold mb-2 text-black dark:text-white">2. AI Analyzes</h3><p className="text-gray-500 dark:text-gray-400">Our AI engine reads your columns, calculates KPIs, and finds hidden trends.</p></div>
              <div className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl shadow-sm border border-black/5 dark:border-white/5"><LineChart className="w-10 h-10 mb-6 text-black dark:text-white" /><h3 className="text-xl font-bold mb-2 text-black dark:text-white">3. Get Charts</h3><p className="text-gray-500 dark:text-gray-400">Receive 5-6 interactive charts with clear, human-readable explanations.</p></div>
            </div>
          </motion.div>

          {/* PROJECTS */}
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold mb-12 border-b border-black/10 dark:border-white/10 pb-4 text-black dark:text-white">What you can use DAANL for.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-black dark:bg-white text-white dark:text-black p-8 rounded-3xl"><Briefcase className="w-10 h-10 mb-6 text-gray-400 dark:text-gray-600" /><h3 className="text-xl font-bold mb-2">Business Sales</h3><p className="text-gray-400 dark:text-gray-600">Upload your monthly revenue sheets to instantly see your top-performing products and growth trends.</p></div>
              <div className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl shadow-sm border border-black/5 dark:border-white/5"><GraduationCap className="w-10 h-10 mb-6 text-black dark:text-white" /><h3 className="text-xl font-bold mb-2 text-black dark:text-white">School & HR Data</h3><p className="text-gray-500 dark:text-gray-400">Upload student grades or employee attendance to find patterns, pass rates, and averages easily.</p></div>
              <div className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl shadow-sm border border-black/5 dark:border-white/5"><TrendingUp className="w-10 h-10 mb-6 text-black dark:text-white" /><h3 className="text-xl font-bold mb-2 text-black dark:text-white">Financial Reports</h3><p className="text-gray-500 dark:text-gray-400">Turn messy PDF bank statements into clean, categorized visual expenses and profit charts.</p></div>
            </div>
          </motion.div>

          {/* ABOUT */}
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-black dark:bg-white text-white dark:text-black p-10 md:p-16 rounded-3xl flex flex-col md:flex-row items-center gap-10 shadow-2xl">
            <img src="/owner.png" alt="Owner" className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-white/20 dark:border-black/10" />
            <div>
              <h2 className="text-3xl font-bold mb-2">Meet the Creator.</h2>
              <p className="text-gray-400 dark:text-gray-600 font-mono text-sm mb-4">Founder & Lead Developer</p>
              <p className="text-gray-300 dark:text-gray-700 text-lg md:text-xl leading-relaxed">"I built DAANL because I was tired of spending hours formatting spreadsheets just to understand the data. I wanted a tool that does the heavy lifting instantly, so you can focus on making the right decisions."</p>
            </div>
          </motion.div>

                    {/* FOOTER */}
          <footer className="bg-black dark:bg-white text-white dark:text-black rounded-3xl p-10 md:p-16 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
              <div className="col-span-1 md:col-span-2">
                {/* Replaced Image with Text Logo */}
                <h2 className="text-3xl font-extrabold tracking-tighter mb-4 text-white dark:text-black">
                  DAANL.
                </h2>
                <p className="text-gray-400 dark:text-gray-600 max-w-sm mb-6">The intelligent, automated data analysis platform. Upload your files and get instant, beautiful insights powered by AI.</p>
                <div className="flex gap-4">
                  <a href="#" className="p-2 bg-white/10 dark:bg-black/10 rounded-full hover:bg-white/20 dark:hover:bg-black/20 transition"><Globe className="w-4 h-4" /></a>
                  <a href="https://wa.me/231778549773" target="_blank" rel="noreferrer" className="p-2 bg-white/10 dark:bg-black/10 rounded-full hover:bg-white/20 dark:hover:bg-black/20 transition text-green-400 dark:text-green-600"><MessageCircle className="w-4 h-4" /></a>
                  <a href="#" className="p-2 bg-white/10 dark:bg-black/10 rounded-full hover:bg-white/20 dark:hover:bg-black/20 transition"><Share2 className="w-4 h-4" /></a>
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-4 uppercase tracking-wider text-sm text-gray-400 dark:text-gray-600">Product</h4>
                <ul className="flex flex-col gap-3 text-gray-300 dark:text-gray-700">
                  <li><button onClick={() => window.scrollTo(0,0)} className="hover:text-white dark:hover:text-black transition">Home</button></li>
                  <li><button onClick={() => router.push("/workspace")} className="hover:text-white dark:hover:text-black transition">Dashboard</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 uppercase tracking-wider text-sm text-gray-400 dark:text-gray-600">Legal & Support</h4>
                <ul className="flex flex-col gap-3 text-gray-300 dark:text-gray-700">
                  <li><a href="#" className="hover:text-white dark:hover:text-black transition">Privacy Policy</a></li>
                  <li><a href="mailto:peterokolliejr@gmail.com" className="hover:text-white dark:hover:text-black transition text-blue-400 dark:text-blue-600">Contact Support</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-16 pt-8 border-t border-white/10 dark:border-black/10 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-500">
              <p>© {new Date().getFullYear()} DAANL. All rights reserved.</p>
              <p>Built by <a href="mailto:peterokolliejr@gmail.com" className="text-white dark:text-black font-bold hover:underline">Peter Okollie Jr.</a></p>
            </div>
          </footer>

        </div>
      </main>

      {/* SLIDE-OUT MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-black dark:bg-white text-white dark:text-black z-50 p-12 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex justify-between items-center mb-16">
                <span className="text-sm text-gray-400 dark:text-gray-600 font-mono">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="hover:rotate-90 transition-transform"><X className="w-8 h-8" /></button>
              </div>
              <div className="flex flex-col gap-6 text-4xl font-bold tracking-tight">
                <button onClick={() => { setIsMenuOpen(false); window.scrollTo(0,0); }} className="text-left hover:text-gray-400 dark:hover:text-gray-600 transition-colors">Home</button>
                <button onClick={() => { setIsMenuOpen(false); router.push("/workspace"); }} className="text-left text-blue-400 dark:text-blue-600 hover:text-blue-300 transition-colors">Dashboard</button>
                <a href="#about" onClick={() => setIsMenuOpen(false)} className="hover:text-gray-400 dark:hover:text-gray-600 transition-colors">About</a>
                <a href="#projects" onClick={() => setIsMenuOpen(false)} className="hover:text-gray-400 dark:hover:text-gray-600 transition-colors">Projects</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}