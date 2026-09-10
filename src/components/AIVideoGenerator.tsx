/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Video, Film, Sparkles, Play, Pause, Download, Crown, Clapperboard, Layers } from "lucide-react";
import { playTapSound, playCorrectSound, playOopsSound } from "../utils/sound";

interface AIVideoGeneratorProps {
  isVip: boolean;
  onRequestVip: () => void;
}

interface StoryboardScene {
  sceneNumber: number;
  title: string;
  visualPrompt: string;
  narrationVoiceover: string;
  cameraMovement: string;
  durationSeconds: number;
}

export default function AIVideoGenerator({ isVip, onRequestVip }: AIVideoGeneratorProps) {
  const [topicPrompt, setTopicPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const [storyboard, setStoryboard] = useState<StoryboardScene[]>([
    {
      sceneNumber: 1,
      title: "Introduction to Black Holes & Gravitational Lensing",
      visualPrompt: "Hyper-realistic cinematic 3D render of a supermassive black hole with an intense glowing accretion disk swirling in deep interstellar space.",
      narrationVoiceover: "In the quiet expanse of the cosmos, gravity curves spacetime itself into an inescapable singularity: the black hole.",
      cameraMovement: "Slow orbital zoom inward toward the event horizon",
      durationSeconds: 5
    },
    {
      sceneNumber: 2,
      title: "The Event Horizon & Singularity",
      visualPrompt: "Close-up raytracing of photons bending along geodesic curves, creating an Einstein ring effect with relativistic Doppler beaming.",
      narrationVoiceover: "At the event horizon, escape velocity surpasses the speed of light. Nothing, not even electromagnetic radiation, can escape.",
      cameraMovement: "Pan across the distortion arc of light",
      durationSeconds: 6
    },
    {
      sceneNumber: 3,
      title: "Hawking Radiation & Quantum Evaporation",
      visualPrompt: "Virtual particle-antiparticle pairs materializing at the boundary, one escaping as subtle thermal radiation while the other enters.",
      narrationVoiceover: "Through quantum vacuum fluctuations, black holes slowly radiate thermal energy over immense cosmological timescales.",
      cameraMovement: "Macro focal shift onto glowing particle sparkles",
      durationSeconds: 5
    }
  ]);

  const handleGenerateScript = () => {
    if (!topicPrompt.trim() || isGenerating) return;

    if (!isVip) {
      playTapSound();
      onRequestVip();
      return;
    }

    playTapSound();
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      playCorrectSound();
      setStoryboard([
        {
          sceneNumber: 1,
          title: `Intro: ${topicPrompt}`,
          visualPrompt: `Stunning 4K hyper-detailed animated diagram highlighting the foundational principles of ${topicPrompt}.`,
          narrationVoiceover: `Welcome to our deep-dive exploration into ${topicPrompt}. Let's examine how this fundamental concept operates in nature.`,
          cameraMovement: "Smooth cinematic tracking shot",
          durationSeconds: 5
        },
        {
          sceneNumber: 2,
          title: "Mechanism & Formula Dynamics",
          visualPrompt: `Dynamic 3D particles and mathematical equations illustrating the internal interactions of ${topicPrompt}.`,
          narrationVoiceover: `Notice the precision of each moving variable and how energy transfers smoothly across the system.`,
          cameraMovement: "Slow dolly zoom with highlighted annotations",
          durationSeconds: 6
        },
        {
          sceneNumber: 3,
          title: "Real-World Application & Future Horizons",
          visualPrompt: `Modern laboratory and industrial implementation of ${topicPrompt} powering technological breakthroughs.`,
          narrationVoiceover: `Mastering these concepts unlocks revolutionary advancements in modern science and engineering.`,
          cameraMovement: "Ascending cinematic wide angle",
          durationSeconds: 5
        }
      ]);
    }, 1200);
  };

  const handleTogglePlay = () => {
    playTapSound();
    setIsPlayingPreview(!isPlayingPreview);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="ai_video_generator_module">
      
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-600 flex items-center justify-center text-2xl shadow-lg shadow-pink-600/30">
            🎬
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 text-[10px] font-mono font-bold text-pink-400 uppercase">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>AI EDUCATIONAL VIDEO GENERATOR</span>
            </div>
            <h3 className="text-lg font-black font-display text-slate-100 uppercase">
              Storyboard Studio
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleTogglePlay}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold font-mono flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-pink-600/20"
          >
            {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlayingPreview ? "Pause Storyboard" : "Play Storyboard"}</span>
          </button>
        </div>
      </div>

      {/* Video Generation Prompt Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <label className="block text-xs font-mono uppercase text-pink-300 font-bold">
          ENTER TOPIC FOR 4K AI EDUCATIONAL VIDEO SCRIPT &amp; STORYBOARD:
        </label>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={topicPrompt}
            onChange={(e) => setTopicPrompt(e.target.value)}
            placeholder="e.g. Mitochondria ATP cycle, Quantum Entanglement, French Revolution..."
            className="flex-1 bg-slate-950 border border-slate-850 focus:border-pink-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-200 outline-none"
            id="input_video_prompt"
          />

          <button
            onClick={handleGenerateScript}
            disabled={isGenerating || !topicPrompt.trim()}
            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-40 text-white font-black text-xs rounded-2xl uppercase tracking-wider shadow-lg shadow-pink-600/20 flex items-center justify-center space-x-2 cursor-pointer shrink-0 transition-transform active:scale-95"
            id="btn_generate_video"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? "CRAFTING STORYBOARD..." : "GENERATE VIDEO →"}</span>
          </button>
        </div>
      </div>

      {/* Storyboard Scenes Grid */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
          <Clapperboard className="w-4 h-4 text-pink-400" />
          <span>Cinematic Scene Breakdown ({storyboard.length} Shots)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {storyboard.map((scene, idx) => (
            <div
              key={scene.sceneNumber}
              onClick={() => {
                playTapSound();
                setActiveSceneIndex(idx);
              }}
              className={`bg-slate-900 border rounded-3xl p-5 space-y-3 cursor-pointer transition-all ${
                activeSceneIndex === idx
                  ? "border-pink-500 shadow-xl shadow-pink-500/10 scale-102"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full font-bold">
                  SHOT 0{scene.sceneNumber}
                </span>
                <span className="text-slate-500">{scene.durationSeconds}s</span>
              </div>

              <h5 className="text-sm font-bold text-slate-100 font-display">
                {scene.title}
              </h5>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850 space-y-1.5">
                <span className="block text-[9px] text-slate-500 font-mono uppercase font-bold">Visual Prompt:</span>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {scene.visualPrompt}
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850 space-y-1.5">
                <span className="block text-[9px] text-slate-500 font-mono uppercase font-bold">Voiceover:</span>
                <p className="text-[11px] text-pink-200 italic line-clamp-2 leading-relaxed">
                  "{scene.narrationVoiceover}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
