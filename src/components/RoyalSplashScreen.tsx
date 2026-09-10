/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, Crown, Zap, BookOpen, GraduationCap } from "lucide-react";
import { SparkLogo } from "./SparkLogo";
import { playTapSound, playCorrectSound } from "../utils/sound";

interface RoyalSplashScreenProps {
  onComplete: () => void;
}

export default function RoyalSplashScreen({ onComplete }: RoyalSplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing Spark Educational Engine...");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          playCorrectSound();
          setTimeout(onComplete, 400);
          return 100;
        }

        const next = prev + 5;
        if (next === 25) setStatusText("Loading 100% Offline Multi-Subject Knowledge Core...");
        if (next === 50) setStatusText("Calibrating 30-Second Timers & Offline Chess AI...");
        if (next === 75) setStatusText("Connecting Gemini AI Engine & Friends Realtime Hub...");
        if (next >= 95) setStatusText("Welcome, Scholar! Entering Royal Studios Learning Hub...");
        
        return next;
      });
    }, 90);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden" id="royal_splash_screen">
      {/* Background glow ambiance */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full filter blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-md w-full flex flex-col items-center text-center space-y-8 animate-fade-in">
        
        {/* Crown Badge */}
        <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-bold text-amber-400 font-mono tracking-widest uppercase">
          <Crown className="w-3.5 h-3.5 animate-bounce" />
          <span>ROYAL STUDIOS LEARNING SYSTEM</span>
        </div>

        {/* Big Logo Icon */}
        <div className="relative">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-amber-400 p-1 shadow-2xl shadow-indigo-500/30 animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex flex-col items-center justify-center relative overflow-hidden">
              <Zap className="w-14 h-14 text-amber-400 fill-amber-400/20" />
              <span className="text-[10px] font-mono font-black text-cyan-300 tracking-wider">SPARK AI</span>
            </div>
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: "5s" }} />
        </div>

        {/* Title & Creator Attribution */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black font-display tracking-tight bg-gradient-to-r from-slate-100 via-cyan-200 to-amber-300 bg-clip-text text-transparent uppercase">
            SPARK THE EDUCATIONAL FRIEND
          </h1>
          <p className="text-xs text-slate-300 font-mono">
            Application made by <strong className="text-amber-400 font-bold tracking-wide">yashwanthreddymahanandi</strong>
          </p>
          <div className="inline-flex items-center space-x-1.5 text-[10px] text-cyan-300 font-mono bg-cyan-950/40 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
            <span>💎 Diamonds &amp; Google Pay Store Integrated</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full space-y-3">
          <div className="h-2 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-400 rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span className="truncate max-w-[280px]">{statusText}</span>
            <span className="text-amber-400 font-bold">{progress}%</span>
          </div>
        </div>

        {/* Skip Button */}
        <button
          onClick={() => {
            playTapSound();
            onComplete();
          }}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase font-mono tracking-wider cursor-pointer underline"
          id="btn_skip_splash"
        >
          Skip Intro →
        </button>

      </div>
    </div>
  );
}
