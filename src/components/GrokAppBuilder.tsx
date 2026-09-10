/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Code, Play, Download, Smartphone, Apple, Globe, Crown, Eye, CheckCircle2 } from "lucide-react";
import { playTapSound, playCorrectSound, playOopsSound } from "../utils/sound";

interface GrokAppBuilderProps {
  isVip: boolean;
  isAppPublisherPaid: boolean;
  onPurchaseVip: () => void;
  onPurchasePublisher: () => void;
  onTriggerPublish: () => void;
}

export default function GrokAppBuilder({
  isVip,
  isAppPublisherPaid,
  onPurchaseVip,
  onPurchasePublisher,
  onTriggerPublish
}: GrokAppBuilderProps) {
  const [appPrompt, setAppPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string>(() => {
    return `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 flex items-center justify-center min-h-screen p-6 font-sans">
  <div class="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4 shadow-2xl">
    <div class="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto text-3xl">🚀</div>
    <h2 class="text-xl font-bold text-white uppercase tracking-tight">Gemini AI App Sandbox</h2>
    <p class="text-xs text-slate-400">Type a prompt above (e.g. 'Scientific Calculator', 'Pomodoro Timer', 'Physics Gravity Simulator') to generate and test your app live!</p>
  </div>
</body>
</html>`;
  });

  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  const samplePrompts = [
    "Interactive Periodic Table with element details popup",
    "Scientific Calculator with trigonometry and logarithms",
    "Math Flashcards Game with audio sound effects",
    "Physics Pendulum & Gravity motion simulator"
  ];

  const handleGenerateApp = async () => {
    if (!appPrompt.trim() || isGenerating) return;

    if (!isVip) {
      playTapSound();
      onPurchaseVip();
      return;
    }

    playTapSound();
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: appPrompt.trim() })
      });
      const data = await res.json();
      setIsGenerating(false);

      if (data.html) {
        playCorrectSound();
        setGeneratedHtml(data.html);
      }
    } catch (e) {
      setIsGenerating(false);
      playOopsSound();
      alert("Failed to generate app. Please check your connection.");
    }
  };

  const handleDownloadCode = () => {
    playTapSound();
    const blob = new Blob([generatedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spark_generated_app.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePublishPlatform = (platform: "android" | "ios" | "web") => {
    playTapSound();
    if (!isAppPublisherPaid) {
      onPurchasePublisher();
      return;
    }
    playCorrectSound();
    alert(`🚀 Initializing automated ${platform.toUpperCase()} Cloud Packaging build pipeline!`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" id="grok_app_creator_module">
      
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-purple-600/30">
            ⚡
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 text-[10px] font-mono font-bold text-purple-400 uppercase">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>GEMINI AI FULL APP CREATOR &amp; SANDBOX</span>
            </div>
            <h3 className="text-lg font-black font-display text-slate-100 uppercase">
              App Creator Studio
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePublishPlatform("android")}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-mono font-bold flex items-center space-x-1 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Build APK</span>
          </button>

          <button
            onClick={() => handlePublishPlatform("ios")}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-mono font-bold flex items-center space-x-1 cursor-pointer"
          >
            <Apple className="w-3.5 h-3.5" />
            <span>Build IPA</span>
          </button>
        </div>
      </div>

      {/* Prompt Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <label className="block text-xs font-mono uppercase text-purple-300 font-bold">
          DESCRIBE THE APPLICATION YOU WANT GEMINI AI TO BUILD:
        </label>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={appPrompt}
            onChange={(e) => setAppPrompt(e.target.value)}
            placeholder="e.g. Physics projectile motion trajectory calculator with live canvas graph..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-200 outline-none"
            id="input_app_creator_prompt"
          />

          <button
            onClick={handleGenerateApp}
            disabled={isGenerating || !appPrompt.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-black text-xs rounded-2xl uppercase tracking-wider shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 cursor-pointer shrink-0 transition-transform active:scale-95"
            id="btn_generate_app"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? "GENERATING APP..." : "GENERATE APP →"}</span>
          </button>
        </div>

        {/* Sample Prompt Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {samplePrompts.map((p) => (
            <button
              key={p}
              onClick={() => {
                playTapSound();
                setAppPrompt(p);
              }}
              className="text-[10px] font-mono bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Live Sandbox & Code Inspector */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
        
        {/* Tab switcher */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => { playTapSound(); setActiveTab("preview"); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono uppercase flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "preview" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Sandbox Preview</span>
            </button>
            <button
              onClick={() => { playTapSound(); setActiveTab("code"); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono uppercase flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "code" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Source HTML</span>
            </button>
          </div>

          <button
            onClick={handleDownloadCode}
            className="text-xs text-purple-400 hover:text-purple-300 font-mono font-bold flex items-center space-x-1 cursor-pointer"
            id="btn_download_html"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export HTML</span>
          </button>
        </div>

        {/* Content Viewer */}
        <div className="h-[520px] bg-slate-950">
          {activeTab === "preview" ? (
            <iframe
              srcDoc={generatedHtml}
              title="Generated App Live Sandbox"
              sandbox="allow-scripts allow-modals allow-same-origin"
              className="w-full h-full border-none"
            />
          ) : (
            <textarea
              readOnly
              value={generatedHtml}
              className="w-full h-full bg-slate-950 text-cyan-300 p-4 font-mono text-xs outline-none resize-none custom-scrollbar"
            />
          )}
        </div>

      </div>

    </div>
  );
}
