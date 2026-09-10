/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Subject, GradeBand, ChatMessage } from "../types";
import { SparkLogo } from "./SparkLogo";
import { playTapSound, playCorrectSound, playOopsSound } from "../utils/sound";
import Markdown from "react-markdown";
import { 
  Send, 
  Brain, 
  Sparkles, 
  Bot, 
  User, 
  RotateCcw, 
  BookOpen, 
  GraduationCap, 
  Calculator, 
  Atom, 
  Languages, 
  Globe, 
  Clock, 
  ChevronDown 
} from "lucide-react";

interface SubjectBotConfig {
  name: string;
  subject: Subject | "General";
  avatar: string;
  roleDescription: string;
  gradient: string;
}

const SUBJECT_BOTS: SubjectBotConfig[] = [
  { name: "SPARK AI (Gemini Flash)", subject: "General", avatar: "✨", roleDescription: "All-subjects Google Gemini AI Tutor & Problem Solver", gradient: "from-cyan-500 to-indigo-600" },
  { name: "Aryabhata Math Coach", subject: "Maths", avatar: "📐", roleDescription: "Equations, calculus, algebra, arithmetic, and puzzles", gradient: "from-amber-500 to-orange-600" },
  { name: "Einstein Physics Sage", subject: "Physics", avatar: "⚡", roleDescription: "Mechanics, optics, electromagnetic theory, formulas", gradient: "from-blue-500 to-indigo-600" },
  { name: "Marie Curie Chemical AI", subject: "Chemistry", avatar: "🧪", roleDescription: "Atoms, molecules, valency, organic synthesis reactions", gradient: "from-purple-500 to-pink-600" },
  { name: "Darwin Biology Explorer", subject: "Biology", avatar: "🌿", roleDescription: "Genetics, human physiology, cell biology, botany", gradient: "from-emerald-500 to-teal-600" },
  { name: "Telugu Bhasha Kovidudu", subject: "Telugu", avatar: "📜", roleDescription: "తెలుగు వ్యాకరణం, పద్యాల భావాలు, జాతీయాలు", gradient: "from-red-500 to-amber-600" },
  { name: "Shakespeare English Mentor", subject: "English", avatar: "🎭", roleDescription: "Literature analysis, grammar, essays, vocabulary", gradient: "from-pink-500 to-rose-600" },
  { name: "Chanakya Civics Advisor", subject: "Social", avatar: "🏛️", roleDescription: "Indian Constitution, history timelines, geography", gradient: "from-yellow-500 to-amber-600" },
  { name: "Kabir Das Hindi Shikshak", subject: "Hindi", avatar: "📖", roleDescription: "हिन्दी व्याकरण, दोहे, कहानियों के भावार्थ", gradient: "from-orange-500 to-red-600" }
];

export default function AIChat() {
  const [selectedBot, setSelectedBot] = useState<SubjectBotConfig>(SUBJECT_BOTS[0]);
  const [gradeLevel, setGradeLevel] = useState<string>("10");
  const [chapterTopic, setChapterTopic] = useState<string>("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `✨ **Greetings! I am SPARK AI, your Educational Assistant powered by Google Gemini AI.**\n\nI can solve mathematical equations step-by-step, explain scientific concepts, translate languages, and help you master any school subject!\n\n*Try asking:*\n* *"Solve 3x + 15 = 45 and show the steps."*\n* *"What is photosynthesis and write its chemical equation?"*\n* *"Tell me a fun math riddle to solve!"*`,
      timestamp: new Date()
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;

    playTapSound();
    const userText = inputPrompt.trim();
    setInputPrompt("");

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          subject: selectedBot.subject === "General" ? undefined : selectedBot.subject,
          grade: gradeLevel,
          chapter: chapterTopic
        })
      });

      const data = await response.json();
      setIsLoading(false);

      if (data.content) {
        playCorrectSound();
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.content,
            timestamp: new Date()
          }
        ]);
      }
    } catch (error) {
      console.warn("Chat API error:", error);
      setIsLoading(false);
      playOopsSound();
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `✨ **[OFFLINE MODE ACTIVATED]** ✨\n\nI received your query: "*${userText}*".\n\nI am currently operating in offline mode. Let's practice with school questions, or check the Quiz and Chess tabs!`,
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleClearHistory = () => {
    playTapSound();
    setMessages([
      {
        id: "welcome_fresh",
        role: "assistant",
        content: `✨ **SPARK AI Tutor refreshed.** How can I assist your studies right now?`,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 flex flex-col h-[750px] relative overflow-hidden" id="spark_ai_chat_container">
      
      {/* Top Bar: Tutor Persona Selector & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        
        <div className="flex items-center space-x-3">
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${selectedBot.gradient} p-0.5 shadow-lg flex items-center justify-center text-xl shrink-0`}>
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              {selectedBot.avatar}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                {selectedBot.subject} TUTOR
              </span>
              <span className="text-[10px] font-mono text-cyan-300">
                Grade {gradeLevel}
              </span>
            </div>
            <h3 className="text-base font-black font-display text-slate-100 uppercase tracking-tight">
              {selectedBot.name}
            </h3>
          </div>
        </div>

        {/* Persona Select Dropdown & Action */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedBot.name}
            onChange={(e) => {
              playTapSound();
              const found = SUBJECT_BOTS.find(b => b.name === e.target.value);
              if (found) setSelectedBot(found);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none cursor-pointer font-mono font-bold"
            id="select_tutor_persona"
          >
            {SUBJECT_BOTS.map((bot) => (
              <option key={bot.name} value={bot.name}>
                {bot.avatar} {bot.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleClearHistory}
            className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Clear Chat History"
            id="btn_clear_chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Grade & Chapter Sub-Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-850 text-xs">
        <div className="flex items-center space-x-2">
          <GraduationCap className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-400 font-mono text-[11px] font-bold">Grade:</span>
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2 py-1 text-xs outline-none font-mono"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
              <option key={g} value={g.toString()}>Grade {g}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2 flex-1 max-w-xs">
          <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
          <input
            type="text"
            value={chapterTopic}
            onChange={(e) => setChapterTopic(e.target.value)}
            placeholder="Topic (e.g. Quadratic Equations)"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none placeholder:text-slate-600 font-mono"
          />
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar" id="chat_messages_scroll">
        {messages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : "flex-row"}`}
            >
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold border ${
                isUser
                  ? "bg-indigo-600 text-white border-indigo-500 shadow"
                  : "bg-slate-950 border-cyan-500/30 text-cyan-300"
              }`}>
                {isUser ? <User className="w-4 h-4" /> : selectedBot.avatar}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                isUser
                  ? "bg-indigo-600 text-white rounded-tr-none font-medium"
                  : "bg-slate-950/90 text-slate-200 border border-slate-800 rounded-tl-none font-sans"
              }`}>
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="markdown-body prose prose-invert max-w-none text-slate-200 space-y-2 leading-relaxed">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-slate-950 border border-cyan-500/30 text-cyan-300 flex items-center justify-center text-xs">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-400 font-mono flex items-center space-x-2 animate-pulse">
              <Brain className="w-4 h-4 text-amber-400" />
              <span>Spark AI is computing the step-by-step solution...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar pt-1">
        {[
          "Solve 2x² - 8x + 6 = 0",
          "Explain Newton's 3 Laws of Motion",
          "Give me a fun number riddle",
          "What is the chemical formula of Rust?",
          "భారతదేశ రాజ్యాంగం విశిష్టతలు ఏమిటి?"
        ].map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => {
              playTapSound();
              setInputPrompt(chip);
            }}
            className="text-[10px] font-mono bg-slate-950 hover:bg-slate-850 text-indigo-300 border border-slate-800 px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Field Form */}
      <form onSubmit={handleSendMessage} className="relative flex items-center">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder={`Ask ${selectedBot.name} any academic question, equation, or topic...`}
          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-2xl pl-4 pr-12 py-3.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 outline-none shadow-inner"
          id="input_ai_chat_prompt"
        />

        <button
          type="submit"
          disabled={!inputPrompt.trim() || isLoading}
          className="absolute right-2 p-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl transition-all cursor-pointer shadow-md"
          id="btn_send_chat_message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
