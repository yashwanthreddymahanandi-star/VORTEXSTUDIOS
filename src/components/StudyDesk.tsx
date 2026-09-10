/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BookOpen, Clock, Play, Pause, RotateCcw, FileText, Sparkles, Atom, Calculator, CheckSquare, Save } from "lucide-react";
import { playTapSound, playCorrectSound, playTickSound } from "../utils/sound";

export default function StudyDesk() {
  const [activeTab, setActiveTab] = useState<"pomodoro" | "formulas" | "notes">("pomodoro");

  // Pomodoro timer state
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [pomoMode, setPomoMode] = useState<"study" | "short_break" | "long_break">("study");

  // Notes scratchpad state with auto local storage
  const [notesContent, setNotesContent] = useState<string>(() => {
    return localStorage.getItem("spark_study_notes") || "# My Study Notes\n- Key physics equations:\n  * F = m * a\n  * E = m * c^2\n- Next revision goals:";
  });
  const [savedBadge, setSavedBadge] = useState(false);

  // Pomodoro interval loop
  useEffect(() => {
    let interval: any = null;
    if (isPomoRunning) {
      interval = setInterval(() => {
        if (pomoSeconds > 0) {
          setPomoSeconds(pomoSeconds - 1);
        } else if (pomoMinutes > 0) {
          setPomoMinutes(pomoMinutes - 1);
          setPomoSeconds(59);
        } else {
          // Timer finished
          setIsPomoRunning(false);
          playCorrectSound();
          alert(`⏰ ${pomoMode === "study" ? "Study Session Complete! Take a well-earned break!" : "Break Finished! Ready to focus?"}`);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPomoRunning, pomoMinutes, pomoSeconds, pomoMode]);

  const handleTogglePomo = () => {
    playTapSound();
    setIsPomoRunning(!isPomoRunning);
  };

  const handleResetPomo = (mode: "study" | "short_break" | "long_break") => {
    playTapSound();
    setIsPomoRunning(false);
    setPomoMode(mode);
    if (mode === "study") {
      setPomoMinutes(25);
    } else if (mode === "short_break") {
      setPomoMinutes(5);
    } else {
      setPomoMinutes(15);
    }
    setPomoSeconds(0);
  };

  const handleSaveNotes = () => {
    playTapSound();
    localStorage.setItem("spark_study_notes", notesContent);
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="study_desk_module">
      
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-xl text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 text-[10px] font-mono font-bold text-indigo-400 uppercase">
              <Sparkles className="w-3 h-3" />
              <span>FOCUSED SCHOLAR DESK</span>
            </div>
            <h3 className="text-base font-black font-display text-slate-100 uppercase">
              Study Room &amp; Utilities
            </h3>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => { playTapSound(); setActiveTab("pomodoro"); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "pomodoro" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ⏱️ Pomodoro Timer
          </button>
          <button
            onClick={() => { playTapSound(); setActiveTab("formulas"); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "formulas" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            📐 Cheat Sheets
          </button>
          <button
            onClick={() => { playTapSound(); setActiveTab("notes"); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "notes" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            📝 Scratchpad
          </button>
        </div>
      </div>

      {/* Tab 1: Pomodoro Timer */}
      {activeTab === "pomodoro" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fade-in">
          
          <div className="flex justify-center space-x-3">
            {[
              { id: "study", label: "Focus (25m)" },
              { id: "short_break", label: "Short Break (5m)" },
              { id: "long_break", label: "Long Break (15m)" }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => handleResetPomo(m.id as any)}
                className={`px-4 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer border ${
                  pomoMode === m.id
                    ? "bg-indigo-600 text-white border-indigo-500 shadow"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="py-6">
            <div className="text-6xl sm:text-8xl font-black font-mono tracking-tight bg-gradient-to-r from-cyan-300 via-indigo-200 to-amber-300 bg-clip-text text-transparent select-none">
              {String(pomoMinutes).padStart(2, "0")}:{String(pomoSeconds).padStart(2, "0")}
            </div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block mt-2">
              {pomoMode === "study" ? "Deep Academic Focus Session" : "Relaxation & Hydration Period"}
            </span>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={handleTogglePomo}
              className={`px-8 py-3 rounded-2xl font-black text-xs font-mono uppercase tracking-wider flex items-center space-x-2 transition-transform active:scale-95 cursor-pointer shadow-lg ${
                isPomoRunning
                  ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
              }`}
              id="btn_toggle_pomodoro"
            >
              {isPomoRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPomoRunning ? "Pause Timer" : "Start Focus Session"}</span>
            </button>

            <button
              onClick={() => handleResetPomo(pomoMode)}
              className="p-3 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-2xl cursor-pointer transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Tab 2: Formulas & Cheat Sheets */}
      {activeTab === "formulas" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 font-bold font-mono text-xs uppercase">
              <Calculator className="w-4 h-4" />
              <span>Mathematics Core Formulas</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 font-mono bg-slate-950 p-4 rounded-2xl border border-slate-850">
              <li>• Quadratic Formula: <strong>x = (-b ± √(b² - 4ac)) / (2a)</strong></li>
              <li>• Pythagoras: <strong>a² + b² = c²</strong></li>
              <li>• Circle Area &amp; Circumference: <strong>A = πr², C = 2πr</strong></li>
              <li>• Arithmetic Progression: <strong>a_n = a + (n - 1)d</strong></li>
              <li>• Calculus Derivative: <strong>d/dx(x^n) = n·x^(n-1)</strong></li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold font-mono text-xs uppercase">
              <Atom className="w-4 h-4" />
              <span>Physics Core Laws</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 font-mono bg-slate-950 p-4 rounded-2xl border border-slate-850">
              <li>• Newton's 2nd Law: <strong>F = m · a</strong></li>
              <li>• Ohm's Law: <strong>V = I · R</strong></li>
              <li>• Kinetic &amp; Potential: <strong>KE = 1/2 mv², PE = mgh</strong></li>
              <li>• Universal Gravitation: <strong>F = G(m₁m₂)/r²</strong></li>
              <li>• De Broglie Wavelength: <strong>λ = h / p</strong></li>
            </ul>
          </div>

        </div>
      )}

      {/* Tab 3: Scratchpad */}
      {activeTab === "notes" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-xs font-mono text-indigo-300 font-bold uppercase">
              <FileText className="w-4 h-4" />
              <span>Auto-Saving Scratchpad</span>
            </div>

            <button
              onClick={handleSaveNotes}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-mono flex items-center space-x-1.5 cursor-pointer shadow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savedBadge ? "Saved! ✓" : "Save Notes"}</span>
            </button>
          </div>

          <textarea
            value={notesContent}
            onChange={(e) => setNotesContent(e.target.value)}
            className="w-full h-72 bg-slate-950 border border-slate-850 focus:border-indigo-500 text-slate-200 p-4 rounded-2xl font-mono text-xs outline-none resize-none leading-relaxed custom-scrollbar"
            placeholder="Type your study notes, homework calculations, or reminders here..."
            id="textarea_study_notes"
          />
        </div>
      )}

    </div>
  );
}
