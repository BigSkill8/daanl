"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { 
  LogOut, UploadCloud, BarChart3, Brain, Settings, 
  Send, MessageCircle, X, Menu, ChevronLeft, ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp, Download
} from "lucide-react";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });
const WHATSAPP_NUMBER = "231778549773"; 

export default function Workspace() {
  const router = useRouter();
  
  // App State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "settings">("dashboard");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [expandedChartIndex, setExpandedChartIndex] = useState<number | null>(null); 
  const [isDownloading, setIsDownloading] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [messages, setMessages] = useState<{sender: "bot" | "user", text: string}[]>([
    { sender: "bot", text: "Hi there! 👋 I'm the DAANL assistant. Need help analyzing your file?" }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen, isChatLoading]);

  const handleExit = () => {
    router.push("/");
  };

  // --- DOWNLOAD REPORT LOGIC ---
  const handleDownload = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = reportRef.current;
      
      const opt = {
        margin:       0.5,
        filename:     `DAANL_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to download report. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // --- THE INTELLIGENT AI ENGINE ---
  const processData = () => {
    if (!selectedFile) return;
    setIsAnalyzing(true); 
    setAiResponse(null);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data as any[];
        if (data.length === 0) {
          setIsAnalyzing(false);
          return;
        }

        const columns = Object.keys(data[0]);
        const sampleRows = data.slice(0, 10); 

        try {
          const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
          if (!apiKey) throw new Error("Missing API Key.");

          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "openai/gpt-oss-20b",
              response_format: { type: "json_object" },
              messages: [
                {
                  role: "system",
                  content: `You are a highly rigorous Senior Data Scientist. Analyze the provided CSV columns and sample data.
                  Return a JSON object with exactly these keys:
                  1. "domain": A short string guessing the industry.
                  2. "summary": A 2-3 sentence paragraph explaining the dataset and a specific business decision.
                  3. "kpis": An array of exactly 3 objects with "title", "value", "trend" ("up" or "down"), and "trendValue".
                  4. "charts": An array of 2 to 6 objects. Available types: "bar", "line", "pie", "donut", "scatter", "histogram", "box", "violin", "area", "bubble". Each chart needs "title", "type", "x", "y", and "explanation" (2 paragraphs).
                  Return ONLY valid JSON.`
                },
                {
                  role: "user",
                  content: `Columns: ${columns.join(", ")}\nSample Data: ${JSON.stringify(sampleRows)}`
                }
              ]
            })
          });

          const aiData = await response.json();
          if (!response.ok) throw new Error(aiData.error?.message || "Failed to fetch");

          const parsedData = JSON.parse(aiData.choices[0].message.content);
          
          const generatedCharts = parsedData.charts.map((chart: any, i: number) => {
            const xCol = columns.includes(chart.x) ? chart.x : columns[0];
            const yCol = columns.includes(chart.y) ? chart.y : columns.find(c => !isNaN(parseFloat(data[0][c]))) || columns[1];
            
            const xData = data.map(r => r[xCol]);
            const yData = data.map(r => parseFloat(r[yCol]) || 0);

            let plotData: any = {};

            if (chart.type === "bar") {
              plotData = { x: xData.slice(0, 12), y: yData.slice(0, 12), type: "bar", marker: { color: "#111111", cornerradius: 4 } };
            } else if (chart.type === "line" || chart.type === "area") {
              plotData = { x: xData.slice(0, 15), y: yData.slice(0, 15), type: "scatter", mode: "lines+markers", fill: chart.type === "area" ? "tozeroy" : "none", line: { color: "#111111", width: 2 }, marker: { color: "#111111", size: 6 } };
            } else if (chart.type === "pie" || chart.type === "donut") {
              plotData = { labels: xData.slice(0, 6), values: yData.slice(0, 6), type: "pie", hole: chart.type === "donut" ? 0.6 : 0, marker: { colors: ["#111111", "#444444", "#777777", "#AAAAAA", "#CCCCCC", "#F5F5F5"] } };
            } else if (chart.type === "scatter" || chart.type === "bubble") {
              plotData = { x: xData.slice(0, 30), y: yData.slice(0, 30), type: "scatter", mode: "markers", marker: { color: "#111111", size: chart.type === "bubble" ? 12 : 8 } };
            } else if (chart.type === "histogram") {
              plotData = { x: yData, type: "histogram", marker: { color: "#111111" } };
            } else if (chart.type === "box" || chart.type === "violin") {
              plotData = { y: yData, type: chart.type, marker: { color: "#111111" }, box: { visible: false }, meanline: { visible: true } };
            } else {
              plotData = { x: xData.slice(0, 12), y: yData.slice(0, 12), type: "bar", marker: { color: "#111111", cornerradius: 4 } };
            }

            return {
              title: chart.title,
              type: chart.type,
              explanation: chart.explanation, 
              data: [plotData],
              layout: {
                autosize: true, 
                margin: { t: 10, b: 50, l: 40, r: 20 },
                paper_bgcolor: "#ffffff",
                plot_bgcolor: "#ffffff",
                font: { family: "Inter, sans-serif", color: "#64748B", size: 11 },
                xaxis: { showgrid: false, zeroline: false },
                yaxis: { showgrid: true, gridcolor: "#F1F5F9", zeroline: false },
                showlegend: true,
                legend: { orientation: 'h', x: 0, y: -0.25, font: { size: 10 } }
              }
            };
          });

          setAiResponse({
            domain: parsedData.domain,
            summary: parsedData.summary,
            kpis: parsedData.kpis,
            charts: generatedCharts
          });

        } catch (error: any) {
          console.error("AI Error:", error);
          alert("AI failed. Using basic fallback.");
          
          const numCols = columns.filter(c => !isNaN(parseFloat(data[0][c])));
          const strCols = columns.filter(c => isNaN(parseFloat(data[0][c])));
          const x = strCols[0] || columns[0];
          const y1 = numCols[0] || columns[1];

          setAiResponse({
            domain: "General Data",
            summary: "AI is currently offline. Here is a basic data overview.",
            kpis: [
              { title: "Total Rows", value: data.length.toString(), trend: "up", trendValue: "+0%" },
              { title: "Columns", value: columns.length.toString(), trend: "up", trendValue: "+0%" },
              { title: "Status", value: "Local Engine", trend: "down", trendValue: "-0%" }
            ],
            charts: [{
              title: `${y1} by ${x}`,
              type: "bar",
              explanation: "This is a fallback chart because the AI service is currently offline.",
              data: [{ x: data.slice(0, 10).map(r => r[x]), y: data.slice(0, 10).map(r => parseFloat(r[y1]) || 0), type: "bar", marker: { color: "#111111", cornerradius: 4 } }],
              layout: { autosize: true, margin: { t: 10, b: 50, l: 40, r: 20 }, paper_bgcolor: "#ffffff", plot_bgcolor: "#ffffff", font: { color: "#64748B" }, showlegend: true }
            }]
          });
        } finally {
          setIsAnalyzing(false);
        }
      }
    });
  };

  // --- AI CHATBOT ENGINE ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput;
    setMessages(prev => [...prev, { sender: "user", text: userText }]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (!apiKey) throw new Error("Missing API Key.");

      const chatHistory = messages.map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }));

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content: "You are the helpful AI support assistant for DAANL. Keep answers brief and friendly."
            },
            ...chatHistory,
            { role: "user", content: userText }
          ]
        })
      });

      const aiData = await response.json();
      if (!response.ok) throw new Error("AI failed to respond.");

      const botReply = aiData.choices[0].message.content;
      setMessages(prev => [...prev, { sender: "bot", text: botReply }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { sender: "bot", text: "Sorry, I'm having trouble connecting right now. Please click the WhatsApp button below." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] font-sans selection:bg-black selection:text-white">
      
      {/* COLLAPSIBLE SIDEBAR */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border-r border-[#E2E8F0] flex flex-col justify-between hidden md:flex overflow-hidden whitespace-nowrap z-20 print:hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-10">
                {/* UPDATED LOGO TO JPEG */}
                <img src="/logo.jpeg" alt="Logo" className="h-6 cursor-pointer" onClick={handleExit} />
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded-md text-slate-400 hover:bg-[#F1F5F9] hover:text-black transition">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold text-sm transition ${activeTab === "dashboard" ? "bg-[#F1F5F9] text-black" : "text-slate-500 hover:bg-[#F8FAFC] hover:text-black"}`}><BarChart3 className="w-4 h-4" /> Dashboard</button>
                <button onClick={() => setActiveTab("settings")} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold text-sm transition ${activeTab === "settings" ? "bg-[#F1F5F9] text-black" : "text-slate-500 hover:bg-[#F8FAFC] hover:text-black"}`}><Settings className="w-4 h-4" /> Settings</button>
              </div>
            </div>
            <div className="p-6">
              <button onClick={handleExit} className="flex items-center justify-center gap-2 w-full p-2.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 font-bold text-sm transition"><LogOut className="w-4 h-4" /> Exit Workspace</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN APP CONTENT */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* TOP BAR */}
        <div className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* MOBILE BACK BUTTON */}
            <button onClick={handleExit} className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-[#F1F5F9] hover:text-black transition md:hidden">
              <ChevronLeft className="w-6 h-6" />
            </button>

            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg text-slate-500 hover:bg-[#F1F5F9] hover:text-black transition hidden md:block">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-lg font-bold text-black capitalize tracking-tight">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-500 hidden md:block">DAANL User</span>
            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs">U</div>
          </div>
        </div>

        {/* WORKSPACE AREA */}
        <div className="p-6 md:p-10 max-w-6xl w-full mx-auto overflow-y-auto h-[calc(100vh-64px)] print:h-auto print:overflow-visible">
          
          {activeTab === "dashboard" && (
            <>
              {!aiResponse && !isAnalyzing ? (
                <div className="max-w-xl mx-auto mt-12 text-center print:hidden">
                  <h2 className="text-3xl font-extrabold tracking-tight text-black mb-2">Workspace.</h2>
                  <p className="text-slate-500 mb-8 text-sm">Upload your data file to generate intelligent, minimalist insights.</p>
                  
                  <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 shadow-sm">
                    <label className="flex flex-col items-center justify-center w-full h-56 border border-dashed border-slate-300 hover:border-black hover:bg-[#F8FAFC] transition cursor-pointer rounded-2xl group">
                      <div className="p-3 bg-[#F1F5F9] text-black rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-black">{selectedFile ? selectedFile.name : "Select a CSV File"}</span>
                      <span className="text-xs text-slate-400 mt-1">Click to browse</span>
                      <input type="file" className="hidden" accept=".csv" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                    </label>
                    <button onClick={processData} disabled={!selectedFile} className={`mt-6 px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mx-auto w-full ${selectedFile ? 'bg-black text-white hover:bg-slate-800 shadow-md' : 'bg-[#F1F5F9] text-slate-400 cursor-not-allowed'}`}>
                      <Brain className="w-4 h-4" /> Analyze Data
                    </button>
                  </div>
                </div>
              ) : isAnalyzing ? (
                <div className="text-center mt-24 print:hidden">
                  <div className="w-16 h-16 bg-white border border-[#E2E8F0] text-black rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-sm">
                    <Brain className="w-8 h-8" />
                  </div>
                  <h2 className="text-lg font-bold text-black mb-1">Analyzing Data...</h2>
                  <p className="text-sm text-slate-500">Calculating standard deviations, variances, and generating tailored insights.</p>
                </div>
              ) : (
                <div ref={reportRef} className="space-y-6 bg-[#F8FAFC] p-2 print:p-0">
                  
                  {/* HEADER & DOWNLOAD BUTTON */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
                    <div>
                      <h2 className="text-2xl font-extrabold text-black tracking-tight">Analytics Dashboard</h2>
                      <p className="text-slate-500 text-xs mt-1">Industry Detected: <span className="text-black font-bold bg-[#F1F5F9] px-2 py-0.5 rounded-md">{aiResponse.domain}</span></p>
                    </div>
                    
                    <div className="flex items-center gap-3 print:hidden">
                      <button 
                        onClick={handleDownload} 
                        disabled={isDownloading}
                        className="text-xs font-bold text-white bg-black px-4 py-2 rounded-lg shadow-sm hover:bg-slate-800 transition flex items-center gap-2 disabled:opacity-50"
                      >
                        {isDownloading ? "Generating PDF..." : <><Download className="w-4 h-4" /> Download Report</>}
                      </button>
                      <button onClick={() => { setAiResponse(null); setSelectedFile(null); setExpandedChartIndex(null); }} className="text-xs font-bold text-black bg-white px-4 py-2 rounded-lg border border-[#E2E8F0] shadow-sm hover:bg-[#F8FAFC] transition">
                        Upload New File
                      </button>
                    </div>
                  </div>

                  {/* KPI CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {aiResponse.kpis.map((kpi: any, i: number) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm relative overflow-hidden">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">{kpi.title}</p>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-4xl font-extrabold text-black tracking-tight">{kpi.value}</p>
                            <div className="flex items-center gap-1 mt-2">
                              {kpi.trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> : <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />}
                              <span className={`text-xs font-bold ${kpi.trend === "up" ? "text-emerald-500" : "text-rose-500"}`}>
                                {kpi.trendValue || "+0%"}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold ml-1">prev</span>
                            </div>
                          </div>
                          <div className="w-16 h-8 opacity-70">
                            <svg viewBox="0 0 100 50" className="w-full h-full stroke-slate-400 fill-none stroke-[2]">
                               <path d="M0 40 L20 25 L40 35 L60 15 L80 30 L100 10" />
                               <circle cx="100" cy="10" r="3" className="fill-white stroke-black stroke-[2]" />
                            </svg>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* AI SUMMARY */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex items-start gap-4">
                    <div className="p-2 bg-[#F1F5F9] text-black rounded-lg mt-0.5">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-black mb-1">AI Business Summary & Decisions</h3>
                      <p className="text-slate-600 leading-relaxed text-sm">
                        {aiResponse.summary}
                      </p>
                    </div>
                  </motion.div>

                  {/* DYNAMIC CHARTS GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {aiResponse.charts.map((chart: any, i: number) => {
                      const isLarge = i === 0; 
                      const isExpanded = expandedChartIndex === i;

                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          transition={{ delay: 0.2 + (i * 0.1) }} 
                          key={i} 
                          className={`bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col ${isLarge ? 'md:col-span-2 lg:col-span-2' : ''}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-black truncate pr-4">{chart.title}</h3>
                            <span className="text-[9px] font-bold text-slate-400 bg-[#F8FAFC] px-2 py-0.5 rounded border border-[#E2E8F0] uppercase tracking-wider shrink-0">{chart.type}</span>
                          </div>
                          
                          <div className={`w-full ${isLarge ? 'h-[300px]' : 'h-[220px]'}`}>
                            <Plot data={chart.data} layout={chart.layout} useResizeHandler={true} style={{ width: "100%", height: "100%" }} config={{ displayModeBar: false }} />
                          </div>

                          <div className="mt-4 pt-3 border-t border-[#F1F5F9]">
                            <p className={`text-xs text-slate-600 leading-relaxed transition-all ${isExpanded ? '' : 'line-clamp-2'}`}>
                              {chart.explanation}
                            </p>
                            <button 
                              onClick={() => setExpandedChartIndex(isExpanded ? null : i)}
                              className="text-[10px] font-bold text-black mt-2 flex items-center gap-1 hover:underline print:hidden"
                            >
                              {isExpanded ? <><ChevronUp className="w-3 h-3" /> Read Less</> : <><ChevronDown className="w-3 h-3" /> Read Full AI Analysis</>}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "settings" && <div className="text-center mt-24 text-slate-400 print:hidden"><Settings className="w-12 h-12 mx-auto mb-4 opacity-50" /><p className="text-sm font-medium">Account settings coming soon.</p></div>}

        </div>
      </div>

      {/* FLOATING CHATBOT */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end print:hidden">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="mb-4 w-[340px] bg-white border border-[#E2E8F0] rounded-2xl shadow-xl overflow-hidden flex flex-col">
              <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] p-4 flex justify-between items-center">
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-black rounded-full animate-pulse"></div><span className="font-bold text-sm text-black">Support</span></div>
                <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-black"><X className="w-4 h-4" /></button>
              </div>
              <div className="h-64 overflow-y-auto p-4 flex flex-col gap-3 bg-white">
                {messages.map((msg, i) => (
                  <div key={i} className={`max-w-[85%] p-3 rounded-xl text-xs font-medium ${msg.sender === "user" ? "bg-black text-white self-end rounded-br-none" : "bg-[#F1F5F9] text-black self-start rounded-bl-none"}`}>{msg.text}</div>
                ))}
                
                {isChatLoading && (
                  <div className="bg-[#F1F5F9] text-black self-start rounded-bl-none p-3 rounded-xl text-xs font-medium animate-pulse">
                    AI is typing...
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
              <div className="px-4 pb-2 bg-white">
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-black rounded-lg text-xs font-bold hover:bg-[#F1F5F9] transition"><MessageCircle className="w-3 h-3" /> Chat on WhatsApp</a>
              </div>
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#E2E8F0] flex gap-2">
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  placeholder={isChatLoading ? "Please wait..." : "Type your problem..."} 
                  disabled={isChatLoading}
                  className="flex-grow bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-black placeholder-slate-400 focus:outline-none focus:border-black disabled:opacity-50" 
                />
                <button type="submit" disabled={isChatLoading} className="p-2 bg-black text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50">
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">{isChatOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}</button>
      </div>
    </div>
  );
}