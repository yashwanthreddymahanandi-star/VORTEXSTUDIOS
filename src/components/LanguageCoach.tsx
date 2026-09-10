/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Volume2, Languages, Sparkles, CheckCircle2, RotateCcw, Trophy, Crown, ArrowRight } from "lucide-react";
import { playTapSound, playCorrectSound, playOopsSound } from "../utils/sound";
import confetti from "canvas-confetti";

interface LanguageCoachProps {
  onAddPoints: (pts: number) => void;
  isVip: boolean;
  onRequestVip: () => void;
}

interface VocabCard {
  word: string;
  translation: string;
  transliteration?: string;
  category: string;
  exampleSentence: string;
  langCode: string; // for speech synthesis
}

const GLOBAL_LANGUAGES = [
  { name: "Telugu", code: "te-IN", flag: "🇮🇳", isVip: false },
  { name: "Hindi", code: "hi-IN", flag: "🇮🇳", isVip: false },
  { name: "Sanskrit", code: "sa-IN", flag: "🕉️", isVip: false },
  { name: "English (US)", code: "en-US", flag: "🇺🇸", isVip: false },
  { name: "English (UK)", code: "en-GB", flag: "🇬🇧", isVip: false },
  { name: "Spanish", code: "es-ES", flag: "🇪🇸", isVip: false },
  { name: "French", code: "fr-FR", flag: "🇫🇷", isVip: false },
  { name: "German", code: "de-DE", flag: "🇩🇪", isVip: false },
  { name: "Japanese", code: "ja-JP", flag: "🇯🇵", isVip: false },
  { name: "Russian", code: "ru-RU", flag: "🇷🇺", isVip: false },
  { name: "Tamil", code: "ta-IN", flag: "🇮🇳", isVip: false },
  { name: "Kannada", code: "kn-IN", flag: "🇮🇳", isVip: false },
  { name: "Malayalam", code: "ml-IN", flag: "🇮🇳", isVip: true },
  { name: "Marathi", code: "mr-IN", flag: "🇮🇳", isVip: true },
  { name: "Bengali", code: "bn-IN", flag: "🇮🇳", isVip: true },
  { name: "Gujarati", code: "gu-IN", flag: "🇮🇳", isVip: true },
  { name: "Punjabi", code: "pa-IN", flag: "🇮🇳", isVip: true },
  { name: "Chinese (Mandarin)", code: "zh-CN", flag: "🇨🇳", isVip: true },
  { name: "Korean", code: "ko-KR", flag: "🇰🇷", isVip: true },
  { name: "Arabic", code: "ar-SA", flag: "🇸🇦", isVip: true },
  { name: "Italian", code: "it-IT", flag: "🇮🇹", isVip: true },
  { name: "Portuguese", code: "pt-BR", flag: "🇧🇷", isVip: true },
  { name: "Dutch", code: "nl-NL", flag: "🇳🇱", isVip: true },
  { name: "Greek", code: "el-GR", flag: "🇬🇷", isVip: true },
  { name: "Turkish", code: "tr-TR", flag: "🇹🇷", isVip: true },
  { name: "Swedish", code: "sv-SE", flag: "🇸🇪", isVip: true },
  { name: "Polish", code: "pl-PL", flag: "🇵🇱", isVip: true },
  { name: "Vietnamese", code: "vi-VN", flag: "🇻🇳", isVip: true },
  { name: "Thai", code: "th-TH", flag: "🇹🇭", isVip: true },
  { name: "Indonesian", code: "id-ID", flag: "🇮🇩", isVip: true },
  { name: "Hebrew", code: "he-IL", flag: "🇮🇱", isVip: true },
  { name: "Latin", code: "la", flag: "🏛️", isVip: true }
];

const VOCAB_DATABASE: Record<string, VocabCard[]> = {
  Telugu: [
    { word: "నమస్కారం", transliteration: "Namaskāram", translation: "Hello / Greetings", category: "Greetings", exampleSentence: "అందరికీ నమస్కారం! (Greetings to everyone!)", langCode: "te-IN" },
    { word: "జ్ఞానం", transliteration: "Jñānaṁ", translation: "Wisdom / Knowledge", category: "Education", exampleSentence: "జ్ఞానమే పరమ సంపద. (Knowledge is the ultimate wealth.)", langCode: "te-IN" },
    { word: "మిత్రుడు", transliteration: "Mitruḍu", translation: "Friend", category: "Social", exampleSentence: "స్పార్క్ నా మంచి మిత్రుడు. (Spark is my good friend.)", langCode: "te-IN" },
    { word: "ధన్యవాదాలు", transliteration: "Dhan’yavādālu", translation: "Thank you", category: "Politeness", exampleSentence: "మీ సహాయానికి ధన్యవాదాలు. (Thank you for your assistance.)", langCode: "te-IN" }
  ],
  Hindi: [
    { word: "नमस्ते", transliteration: "Namaste", translation: "Hello / Reverence", category: "Greetings", exampleSentence: "आप सभी को मेरा सादर नमस्ते।", langCode: "hi-IN" },
    { word: "विद्या", transliteration: "Vidya", translation: "Education / Knowledge", category: "Education", exampleSentence: "विद्या से विनय की प्राप्ति होती है।", langCode: "hi-IN" },
    { word: "मित्र", transliteration: "Mitra", translation: "Friend", category: "Social", exampleSentence: "सच्चा मित्र जीवन का अनमोल धन है।", langCode: "hi-IN" }
  ],
  Sanskrit: [
    { word: "सत्यमेव जयते", transliteration: "Satyameva Jayate", translation: "Truth alone triumphs", category: "Motto", exampleSentence: "नानृतं सत्येन पन्था विततो देवयानः।", langCode: "sa-IN" },
    { word: "विद्या ददाति विनयं", transliteration: "Vidya Dadati Vinayam", translation: "Knowledge gives humility", category: "Education", exampleSentence: "विनयाद्याति पात्रताम्।", langCode: "sa-IN" }
  ],
  Spanish: [
    { word: "Hola", translation: "Hello", category: "Greetings", exampleSentence: "¡Hola! ¿Cómo estás hoy?", langCode: "es-ES" },
    { word: "Conocimiento", translation: "Knowledge", category: "Education", exampleSentence: "El conocimiento es poder en la vida.", langCode: "es-ES" },
    { word: "Amigo", translation: "Friend", category: "Social", exampleSentence: "Spark es mi mejor amigo de estudio.", langCode: "es-ES" }
  ],
  French: [
    { word: "Bonjour", translation: "Good day / Hello", category: "Greetings", exampleSentence: "Bonjour à tous les étudiants!", langCode: "fr-FR" },
    { word: "Sagesse", translation: "Wisdom", category: "Philosophy", exampleSentence: "La sagesse commence par la curiosité.", langCode: "fr-FR" }
  ],
  German: [
    { word: "Guten Tag", translation: "Good day / Hello", category: "Greetings", exampleSentence: "Guten Tag, mein intelligenter Freund!", langCode: "de-DE" },
    { word: "Wissenschaft", translation: "Science / Scholarship", category: "Education", exampleSentence: "Die Wissenschaft erklärt unser Universum.", langCode: "de-DE" }
  ],
  Japanese: [
    { word: "こんにちは", transliteration: "Konnichiwa", translation: "Hello / Good afternoon", category: "Greetings", exampleSentence: "皆さん、こんにちは！", langCode: "ja-JP" },
    { word: "知識", transliteration: "Chishiki", translation: "Knowledge", category: "Education", exampleSentence: "知識は力なり。(Knowledge is power.)", langCode: "ja-JP" }
  ]
};

export default function LanguageCoach({ onAddPoints, isVip, onRequestVip }: LanguageCoachProps) {
  const [selectedLang, setSelectedLang] = useState<string>("Telugu");
  const [cardIndex, setCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [quizWordOption, setQuizWordOption] = useState<string | null>(null);

  const activeLangObj = GLOBAL_LANGUAGES.find(l => l.name === selectedLang) || GLOBAL_LANGUAGES[0];
  const vocabList = VOCAB_DATABASE[selectedLang] || VOCAB_DATABASE["Telugu"];
  const currentCard = vocabList[cardIndex % vocabList.length];

  const handleSpeak = (text: string, langCode: string) => {
    playTapSound();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectLanguage = (langName: string, langIsVip: boolean) => {
    playTapSound();
    if (langIsVip && !isVip) {
      onRequestVip();
      return;
    }
    setSelectedLang(langName);
    setCardIndex(0);
    setIsCardFlipped(false);
  };

  const handleNextCard = () => {
    playTapSound();
    setCardIndex(prev => prev + 1);
    setIsCardFlipped(false);
    onAddPoints(5);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="language_coach_module">
      
      {/* Top Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl">
            {activeLangObj.flag}
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 text-[10px] font-mono font-bold text-emerald-400 uppercase">
              <Sparkles className="w-3 h-3" />
              <span>32 GLOBAL LANGUAGES ENGINE</span>
            </div>
            <h3 className="text-base font-black font-display text-slate-100 uppercase">
              {selectedLang} Language Coach
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSpeak(currentCard.word, currentCard.langCode)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-mono flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-emerald-600/20"
            id="btn_listen_pronunciation"
          >
            <Volume2 className="w-4 h-4" />
            <span>Listen Pronunciation</span>
          </button>
        </div>
      </div>

      {/* Language Horizontal Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {GLOBAL_LANGUAGES.map((lang) => {
          const isSelected = selectedLang === lang.name;
          const isLocked = lang.isVip && !isVip;

          return (
            <button
              key={lang.name}
              onClick={() => handleSelectLanguage(lang.name, lang.isVip)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer border ${
                isSelected
                  ? "bg-emerald-600 text-white border-emerald-400 shadow-md font-black"
                  : "bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
              {isLocked && (
                <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1 rounded-full uppercase scale-90">
                  VIP
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Interactive 3D Flip Flashcard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Flashcard Area */}
        <div className="md:col-span-2">
          <div
            onClick={() => {
              playTapSound();
              setIsCardFlipped(!isCardFlipped);
            }}
            className="min-h-[280px] bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-8 flex flex-col justify-between shadow-2xl transition-all cursor-pointer relative overflow-hidden group"
            id="language_interactive_flashcard"
          >
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[10px] font-bold uppercase bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full text-emerald-300">
                CATEGORY: {currentCard.category}
              </span>
              <span className="text-slate-500">Tap to Flip Card 🔄</span>
            </div>

            <div className="text-center py-6 space-y-3">
              <h2 className="text-3xl sm:text-5xl font-black font-display text-slate-100 group-hover:scale-105 transition-transform tracking-tight">
                {currentCard.word}
              </h2>

              {currentCard.transliteration && (
                <span className="block text-sm font-mono text-cyan-300 font-bold">
                  [{currentCard.transliteration}]
                </span>
              )}

              {isCardFlipped && (
                <div className="pt-4 border-t border-slate-800/80 space-y-2 animate-fade-in">
                  <span className="text-lg font-bold text-amber-400 font-sans">
                    Meaning: {currentCard.translation}
                  </span>
                  <p className="text-xs text-slate-300 italic font-mono bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                    "{currentCard.exampleSentence}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-800/60 text-xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak(currentCard.word, currentCard.langCode);
                }}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-400 rounded-xl cursor-pointer"
                title="Speak Word"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextCard();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center space-x-1 cursor-pointer shadow-md"
              >
                <span>Next Word (+5 PTS)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Practice Drill Quick Card */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <span className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase font-black">
              QUICK PRACTICE DRILL
            </span>
            <p className="text-xs text-slate-300">
              What is the accurate English meaning of <strong className="text-emerald-400">"{currentCard.word}"</strong>?
            </p>

            <div className="space-y-2 pt-2">
              {[currentCard.translation, "The radiant sun", "Flowing ocean water", "Ancient library"].sort().map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (opt === currentCard.translation) {
                      playCorrectSound();
                      onAddPoints(15);
                      confetti({ particleCount: 40, spread: 50 });
                      alert("🎉 Correct! +15 PTS awarded to your score!");
                    } else {
                      playOopsSound();
                      alert("❌ Incorrect. Flip the flashcard to review!");
                    }
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-850 text-xs text-slate-200 transition-colors cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-3xl text-center space-y-2">
            <Trophy className="w-5 h-5 text-amber-400 mx-auto" />
            <span className="block text-xs font-bold text-slate-200">Language Fluency Mastery</span>
            <span className="block text-[10px] text-slate-400 font-mono">Each verified drill grants +15 Points</span>
          </div>
        </div>

      </div>

    </div>
  );
}
