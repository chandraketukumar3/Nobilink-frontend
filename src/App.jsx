import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Youtube, Music, Video, History, Clipboard, Trash2,
  CheckCircle, AlertCircle, Loader2, Play, Download,
  Copy, ExternalLink, ChevronDown, Check, X, Sparkles
} from 'lucide-react';
import axios from 'axios';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SkeletonLoader } from './components/SkeletonLoader';

// Utility for tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_BASE = 'https://nobilink-backend-production.up.railway.app';

const QUALITIES = [
  { id: 'best', label: 'Ultra HD (Best)' },
  { id: '1080p', label: 'Full HD (1080p)' },
  { id: '720p', label: 'High Def (720p)' },
  { id: '480p', label: 'Standard (480p)' },
];

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [error, setError] = useState('');
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [quality, setQuality] = useState(QUALITIES[0]);
  const [isDownloading, setIsDownloading] = useState(null); // 'mp4', 'mp3' or null
  const [progress, setProgress] = useState(0);
  const [showQualityDropdown, setShowQualityDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(null);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('nobilinkHistory') || '[]');
    setDownloadHistory(history);
  }, []);

  const normalizeUrl = (url) => {
    if (url.includes("youtu.be")) {
      const id = url.split("/").pop().split("?")[0];
      return `https://www.youtube.com/watch?v=${id}`;
    }
    return url.split("&")[0];
  };

  const fetchVideoInfo = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setVideoInfo(null);
    try {
      const cleanUrl = normalizeUrl(url);
      const { data } = await axios.get(`${API_BASE}/info?url=${encodeURIComponent(cleanUrl)}`);
      setVideoInfo(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid YouTube URL. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.includes('youtube.com') || text.includes('youtu.be')) {
        setUrl(text);
      }
    } catch (err) {
      console.error('Clipboard access denied.');
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadContent = async (type) => {
    if (!videoInfo) return;

    setIsDownloading(type);
    setDownloadSuccess(null);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) {
          clearInterval(interval);
          return 98;
        }
        return prev + 2;
      });
    }, 150);

    try {
      const cleanUrl = normalizeUrl(url);
      const endpoint = type === 'mp3' ? '/download-mp3' : '/download-video';

      const downloadUrl = `${API_BASE}${endpoint}?url=${encodeURIComponent(cleanUrl)}&quality=${quality.id}`;

      // ✅🔥 FINAL FIX (IMPORTANT)
      window.open(downloadUrl, "_blank");

      setProgress(100);

      setTimeout(() => {
        setIsDownloading(null);
        setDownloadSuccess(type);
        setTimeout(() => setDownloadSuccess(null), 3000);
      }, 800);

      const newHistory = [
        {
          id: Date.now(),
          title: videoInfo.title,
          type,
          date: new Date().toLocaleDateString(),
          thumbnail: videoInfo.thumbnail,
          url: cleanUrl
        },
        ...downloadHistory.filter(item => item.url !== cleanUrl).slice(0, 9)
      ];

      setDownloadHistory(newHistory);
      localStorage.setItem('nobilinkHistory', JSON.stringify(newHistory));

    } catch (err) {
      setError('Download failed. Please check your connection.');
      setIsDownloading(null);
      clearInterval(interval);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/40 font-sans tracking-tight overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-red-600/5 blur-[160px] rounded-full animate-float opacity-50" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-red-900/5 blur-[140px] rounded-full animate-float" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/[0.03] px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-red-600 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-gradient-to-br from-red-600 to-red-800 w-11 h-11 rounded-2xl flex items-center justify-center font-black text-2xl italic shadow-2xl shadow-red-600/20 border border-white/10">
              N
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter uppercase italic line-height-1 neon-glow">
              Nobilink
            </span>
            <span className="text-[10px] uppercase font-black tracking-[0.4em] text-red-500/60 -mt-1 whitespace-nowrap">
              Engineered for Excellence
            </span>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-10 text-[11px] font-black tracking-[0.3em] uppercase opacity-40">
          <a href="#" className="hover:opacity-100 transition-all hover:text-red-500 hover:scale-105">Network</a>
          <a href="#" className="hover:opacity-100 transition-all hover:text-red-500 hover:scale-105">Cloud</a>
          <a href="#" className="hover:opacity-100 transition-all hover:text-red-500 hover:scale-105">Support</a>
          <button className="bg-white/5 border border-white/10 px-6 py-2.5 rounded-full hover:bg-white/10 transition-all active:scale-95">
            Login
          </button>
        </div>
      </nav>

      <main className="pt-48 pb-32 px-6 max-w-5xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-24 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass border border-red-500/20 text-red-500 text-[10px] font-black tracking-[0.3em] uppercase mb-10 shadow-xl shadow-red-500/5"
          >
            <Sparkles className="w-3 h-3" />
            Next Gen Streaming Infrastructure
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.85] italic uppercase"
          >
            Instant Content <br />
            <span className="red-gradient-text">Downloader</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/30 text-xl font-medium max-w-2xl mx-auto mb-16 leading-relaxed"
          >
            Nobilink isn't just a tool; it's a precision instrument. Extract high-bitrate media from the platform instantly with zero compression loss.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative max-w-3xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-4 p-4 rounded-[3rem] glass border border-white/5 shadow-3xl">
              <div className="relative flex-1 group">
                <div className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-red-500 transition-all pointer-events-none">
                  <Youtube className="w-7 h-7" />
                </div>
                <input
                  type="text"
                  placeholder="Paste video link or drop URL here..."
                  className="w-full pl-20 pr-14 py-6 bg-transparent outline-none text-white font-bold text-lg placeholder:text-white/5 tracking-tight"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchVideoInfo()}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                  {url && (
                    <button onClick={copyUrl} className="p-3 text-white/20 hover:text-white transition-all hover:bg-white/5 rounded-2xl active:scale-90">
                      {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  )}
                  <button onClick={handlePaste} className="p-3 text-white/20 hover:text-white transition-all hover:bg-white/5 rounded-2xl active:scale-90" title="Paste Link">
                    <Clipboard className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button
                onClick={fetchVideoInfo}
                disabled={loading || !url}
                className="btn-premium ripple-effect flex items-center justify-center gap-4 min-w-[200px]"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                Process Link
              </button>
            </div>

            {/* Visual Indicator of Focus */}
            <div className="absolute inset-0 -z-10 bg-red-600/5 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
          </motion.div>
        </section>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {loading && <SkeletonLoader key="skeleton" />}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="glass-card bg-red-500/[0.03] border-red-500/20 p-8 flex items-center gap-8 text-red-500 mb-16 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
              <div className="bg-red-600/10 p-4 rounded-[2rem] text-red-600">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black uppercase italic tracking-tighter text-lg">Platform Error Response</h4>
                <p className="font-medium opacity-60">{error}</p>
              </div>
            </motion.div>
          )}

          {videoInfo && !loading && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12 mb-24"
            >
              <div className="glass-card p-8 flex flex-col lg:flex-row gap-10 items-start">
                <div className="relative group w-full lg:w-[450px] aspect-video rounded-[2.5rem] overflow-hidden shadow-3xl bg-black border border-white/5">
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                  <div className="absolute bottom-6 left-6 flex items-center gap-3">
                    <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl text-xs font-black border border-white/10 uppercase tracking-widest">
                      {Math.floor(videoInfo.length / 60)}:{(videoInfo.length % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-8 w-full pt-2">
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black italic tracking-tighter leading-[1.1] uppercase">
                      {videoInfo.title}
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="relative">
                      <button
                        onClick={() => setShowQualityDropdown(!showQualityDropdown)}
                        className="w-full bg-white/[0.03] border border-white/[0.08] px-8 py-5 rounded-[2rem] flex justify-between items-center hover:bg-white/[0.06] transition-all active:scale-[0.99] border-red-500/0 hover:border-red-500/20"
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-30 italic">Target Precision</span>
                          <span className="font-black text-red-500 uppercase italic tracking-tighter text-lg">{quality.label}</span>
                        </div>
                        <ChevronDown className={cn("w-6 h-6 transition-transform duration-500 text-white/20", showQualityDropdown && "rotate-180 text-red-500")} />
                      </button>

                      <AnimatePresence>
                        {showQualityDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                            className="absolute top-full left-0 w-full mt-3 glass-card p-3 z-50 border-white/10 bg-[#0a0a0aa0] backdrop-blur-[40px] shadow-3xl overflow-hidden"
                          >
                            {QUALITIES.map((q) => (
                              <button
                                key={q.id}
                                onClick={() => {
                                  setQuality(q);
                                  setShowQualityDropdown(false);
                                }}
                                className={cn(
                                  "w-full px-6 py-5 rounded-2xl flex justify-between items-center transition-all group",
                                  quality.id === q.id ? "bg-red-600/10 text-red-500" : "hover:bg-white/5"
                                )}
                              >
                                <span className="font-black italic uppercase tracking-tighter text-sm">{q.label}</span>
                                {quality.id === q.id && <CheckCircle className="w-5 h-5" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <button
                        onClick={() => downloadContent('mp4')}
                        disabled={isDownloading !== null}
                        className={cn(
                          "h-20 rounded-[2rem] border transition-all flex items-center justify-center gap-4 font-black italic uppercase tracking-widest text-[11px] active:scale-95 disabled:opacity-40",
                          downloadSuccess === 'mp4' ? "bg-green-500 border-green-400 text-white" : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.08] hover:border-red-500/30"
                        )}
                      >
                        {downloadSuccess === 'mp4' ? <Check className="w-6 h-6 animate-bounce" /> : isDownloading === 'mp4' ? <Loader2 className="w-6 h-6 animate-spin text-red-500" /> : <Video className="w-6 h-6 mb-1" />}
                        {downloadSuccess === 'mp4' ? "Success" : "Export MP4"}
                      </button>
                      <button
                        onClick={() => downloadContent('mp3')}
                        disabled={isDownloading !== null}
                        className={cn(
                          "h-20 rounded-[2rem] border transition-all flex items-center justify-center gap-4 font-black italic uppercase tracking-widest text-[11px] active:scale-95 disabled:opacity-40",
                          downloadSuccess === 'mp3' ? "bg-green-500 border-green-400 text-white" : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.08] hover:border-red-500/30"
                        )}
                      >
                        {downloadSuccess === 'mp3' ? <Check className="w-6 h-6 animate-bounce" /> : isDownloading === 'mp3' ? <Loader2 className="w-6 h-6 animate-spin text-red-500" /> : <Music className="w-6 h-6 mb-1" />}
                        {downloadSuccess === 'mp3' ? "Success" : "Convert MP3"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Progress */}
              {isDownloading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-5"
                >
                  <div className="flex justify-between items-end text-[11px] font-black tracking-[0.4em] uppercase italic opacity-40">
                    <span className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                      Allocating buffer for {isDownloading.toUpperCase()} stream
                    </span>
                    <span className="text-red-500 font-mono">{progress}%</span>
                  </div>
                  <div className="h-3 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5 p-0.5">
                    <motion.div
                      className="h-full red-gradient shadow-[0_0_30px_rgba(255,0,0,0.6)] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Section */}
        {downloadHistory.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-t border-white/[0.03] pt-24"
          >
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-5">
                <History className="w-10 h-10 text-red-600" />
                History
              </h3>
              <button
                onClick={() => {
                  setDownloadHistory([]);
                  localStorage.removeItem('nobilinkHistory');
                }}
                className="text-[10px] font-black tracking-[0.3em] uppercase italic opacity-20 hover:opacity-100 hover:text-red-500 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Purge All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {downloadHistory.map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  key={item.id}
                  className="glass-card p-5 flex items-center gap-6 group hover:border-red-500/20 cursor-pointer relative overflow-hidden active:scale-[0.98]"
                  onClick={() => { setUrl(item.url); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <div className="w-28 h-16 rounded-[1.25rem] overflow-hidden grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 flex-shrink-0 shadow-2xl border border-white/5">
                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-black truncate text-sm uppercase italic tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity">
                      {item.title}
                    </h5>
                    <div className="flex items-center gap-4 mt-3 text-[9px] font-black tracking-[0.2em] uppercase italic opacity-20 group-hover:opacity-40">
                      <span className="bg-red-600/20 text-red-500 px-2 py-0.5 rounded leading-none border border-red-500/10">{item.type}</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = downloadHistory.filter(h => h.id !== item.id);
                        setDownloadHistory(updated);
                        localStorage.setItem('nobilinkHistory', JSON.stringify(updated));
                      }}
                      className="p-2.5 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </main>

      {/* SaaS Compliant Footer */}
      <footer className="pt-32 pb-16 border-t border-white/[0.03] px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 items-start mb-20 text-center md:text-left">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3">
              <div className="bg-red-600 w-8 h-8 rounded-xl flex items-center justify-center font-black text-lg italic border border-white/10">N</div>
              <span className="text-xl font-black tracking-tighter uppercase italic neon-glow">Nobilink</span>
            </div>
            <p className="text-white/20 text-xs font-medium leading-relaxed max-w-xs mx-auto md:mx-0">
              Building the future of digital asset extraction with focus on speed, precision, and excellence.
            </p>
          </div>
          <div className="flex flex-col gap-6 text-[11px] font-black tracking-[0.3em] uppercase italic opacity-30">
            <span className="text-white opacity-100">Company</span>
            <a href="#" className="hover:text-red-500 hover:opacity-100 transition-all">Privacy Policy</a>
            <a href="#" className="hover:text-red-500 hover:opacity-100 transition-all">Terms of Service</a>
            <a href="#" className="hover:text-red-500 hover:opacity-100 transition-all">Cookies Policy</a>
          </div>
          <div className="flex flex-col gap-6 text-[11px] font-black tracking-[0.3em] uppercase italic opacity-30">
            <span className="text-white opacity-100">Connect</span>
            <a href="#" className="hover:text-red-500 hover:opacity-100 transition-all">X / Twitter</a>
            <a href="#" className="hover:text-red-500 hover:opacity-100 transition-all">YouTube</a>
            <a href="#" className="hover:text-red-500 hover:opacity-100 transition-all">GitHub</a>
          </div>
        </div>

        <div className="space-y-12">
          <div className="bg-white/5 border border-white/5 rounded-[2rem] p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-red-600/5 blur-3xl" />
            <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-3 text-red-500">
                <AlertCircle className="w-5 h-5" />
                <span className="text-[10px] font-black tracking-[0.4em] uppercase italic">System Disclaimer</span>
              </div>
              <p className="text-white/20 text-[11px] font-bold leading-[1.8] uppercase italic tracking-wider">
                ⚠️ This tool is provided for educational and personal use only.
                Nobilink does not host or store any content and is not affiliated with YouTube or Google LLC.
                Users are strictly responsible for their own downloads and compliance with local copyright laws.
                Please respect platform terms of service.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5 text-[10px] font-black tracking-[0.4em] uppercase italic opacity-20">
            <p>© {new Date().getFullYear()} Nobilink. Engineered for Excellence.</p>
            <p className="text-red-500/60 opacity-100">Status: All Systems Operational</p>
          </div>
        </div>
      </footer>
    </div>
  );
}