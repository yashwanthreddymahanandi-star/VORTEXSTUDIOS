/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { GradeBand, Subject, Question, QuizSessionState, UserStats, FriendUser } from "../types";
import { getFilteredQuestions, ALL_QUESTIONS } from "../data/questions";
import { playTapSound, playCorrectSound, playOopsSound, playTickSound } from "../utils/sound";
import confetti from "canvas-confetti";
import { 
  Clock, 
  Flame, 
  Trophy, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  ChevronRight, 
  BookOpen, 
  Brain, 
  Lock, 
  Unlock,
  Swords,
  Users
} from "lucide-react";

interface QuizGameProps {
  gradeBand: GradeBand;
  isVip: boolean;
  onRequestVip: () => void;
  onExit: () => void;
  onOpenChat: () => void;
  onOpenFriendsHub?: () => void;
  roomMatchData?: {
    opponent: FriendUser;
    roomCode: string;
    subject: Subject;
  } | null;
  onClearRoomMatch?: () => void;
}

export default function QuizGame({
  gradeBand,
  isVip,
  onRequestVip,
  onExit,
  onOpenChat,
  onOpenFriendsHub,
  roomMatchData,
  onClearRoomMatch
}: QuizGameProps) {
  const subjects: Subject[] = ["Maths", "Physics", "Chemistry", "Biology", "English", "Telugu", "Social", "Hindi"];
  
  const [selectedSubject, setSelectedSubject] = useState<Subject>(() => {
    return roomMatchData?.subject || "Maths";
  });
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [highestStreakSession, setHighestStreakSession] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [isRoundCompleted, setIsRoundCompleted] = useState<boolean>(false);
  const [showAiHint, setShowAiHint] = useState<boolean>(false);

  // Simulated Opponent Score for Room Matches
  const [opponentScore, setOpponentScore] = useState<number>(0);

  const timerRef = useRef<any>(null);

  // Load questions when gradeBand, subject, or level changes
  useEffect(() => {
    let list = getFilteredQuestions(gradeBand, selectedSubject, selectedLevel);
    if (list.length === 0) {
      // Fallback: take any questions matching gradeBand
      list = ALL_QUESTIONS.filter(q => q.gradeBand === gradeBand);
    }
    // Shuffle slightly
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    resetQuizRound();
  }, [gradeBand, selectedSubject, selectedLevel]);

  const resetQuizRound = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    setScore(0);
    setStreak(0);
    setHighestStreakSession(0);
    setTimeRemaining(30);
    setIsTimerRunning(true);
    setIsRoundCompleted(false);
    setShowAiHint(false);
    setOpponentScore(0);
  };

  // 30-Second Countdown timer
  useEffect(() => {
    if (!isTimerRunning || isRoundCompleted || isAnswerRevealed) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        if (prev <= 6) {
          playTickSound();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isRoundCompleted, isAnswerRevealed, currentIndex]);

  const handleTimeOut = () => {
    playOopsSound();
    setIsAnswerRevealed(true);
    setSelectedOption(-1); // -1 indicates timeout
    setStreak(0);
  };

  const handleSelectOption = (index: number) => {
    if (isAnswerRevealed || !questions[currentIndex]) return;

    playTapSound();
    setSelectedOption(index);
    setIsAnswerRevealed(true);
    setIsTimerRunning(false);

    const isCorrect = index === questions[currentIndex].correctOptionIndex;

    if (isCorrect) {
      playCorrectSound();
      const points = 10 + streak * 5;
      setScore((prev) => prev + points);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > highestStreakSession) {
        setHighestStreakSession(nextStreak);
      }
      saveStats(true, points);
    } else {
      playOopsSound();
      setStreak(0);
      saveStats(false, 0);
    }

    // Room match opponent simulation
    if (roomMatchData) {
      if (Math.random() > 0.35) {
        setOpponentScore(prev => prev + 10);
      }
    }
  };

  const handleNextQuestion = () => {
    playTapSound();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
      setTimeRemaining(30);
      setIsTimerRunning(true);
      setShowAiHint(false);
    } else {
      // Completed all questions in round!
      setIsRoundCompleted(true);
      setIsTimerRunning(false);
      playCorrectSound();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Ignore confetti error
      }
    }
  };

  const saveStats = (isCorrect: boolean, pointsWon: number) => {
    try {
      const stored = localStorage.getItem("ramanujan_user_stats");
      let currentStats: UserStats;
      if (stored) {
        currentStats = JSON.parse(stored);
      } else {
        currentStats = {
          username: "Mathematical Friend",
          points: 100,
          totalGames: 0,
          totalCorrect: 0,
          totalQuestions: 0,
          highestStreak: 0,
          gradesPlayed: { "1-6": 0, "7-10": 0, "11-12": 0 },
          unlockedLevels: { [selectedSubject]: 1 }
        };
      }

      currentStats.totalQuestions = (currentStats.totalQuestions || 0) + 1;
      if (isCorrect) {
        currentStats.totalCorrect = (currentStats.totalCorrect || 0) + 1;
        currentStats.points = (currentStats.points || 0) + pointsWon;
      }
      if (streak + 1 > (currentStats.highestStreak || 0)) {
        currentStats.highestStreak = streak + 1;
      }
      currentStats.gradesPlayed[gradeBand] = (currentStats.gradesPlayed[gradeBand] || 0) + 1;

      // Check level unlock
      if (!currentStats.unlockedLevels) currentStats.unlockedLevels = {};
      if (score > 30 && selectedLevel < 3) {
        currentStats.unlockedLevels[selectedSubject] = Math.max(
          currentStats.unlockedLevels[selectedSubject] || 1,
          selectedLevel + 1
        );
      }

      localStorage.setItem("ramanujan_user_stats", JSON.stringify(currentStats));
    } catch (e) {
      console.warn("Could not save stats", e);
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="quiz_game_container">
      
      {/* Top Bar Navigation & Subject Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 p-4 rounded-3xl backdrop-blur-sm shadow-xl">
        <div className="flex items-center space-x-3">
          <button
            onClick={onExit}
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-100 rounded-xl transition-all cursor-pointer"
            id="btn_quiz_back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                GRADE {gradeBand}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>
            <h3 className="text-base font-black font-display text-slate-100 uppercase">
              {selectedSubject} Challenge
            </h3>
          </div>
        </div>

        {/* Live Score & Timer Stats */}
        <div className="flex items-center space-x-4">
          
          {/* Streak Indicator */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Flame className={`w-4 h-4 ${streak > 0 ? "text-amber-400 animate-bounce" : "text-slate-600"}`} />
            <span className="text-xs font-mono font-bold text-slate-300">{streak}x</span>
          </div>

          {/* Points */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-black text-amber-400">{score} PTS</span>
          </div>

          {/* 30s Timer Display */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-mono font-black text-xs transition-colors ${
            timeRemaining <= 5 
              ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse" 
              : "bg-slate-950 border-slate-800 text-cyan-300"
          }`}>
            <Clock className="w-4 h-4" />
            <span>{timeRemaining}s</span>
          </div>
        </div>
      </div>

      {/* 1v1 Room Challenge Banner (If Active) */}
      {roomMatchData && (
        <div className="bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-slate-950 border border-indigo-500/40 p-3.5 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-xl">
              {roomMatchData.opponent.avatar}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                  ROOM MATCH: {roomMatchData.roomCode}
                </span>
              </div>
              <span className="text-xs font-black text-slate-200">
                Versus: {roomMatchData.opponent.username}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs">
            <div className="text-right">
              <span className="block text-[9px] text-slate-400 uppercase">Opponent Score</span>
              <span className="font-black text-purple-400">{opponentScore} PTS</span>
            </div>
            <Swords className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
        </div>
      )}

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => {
              playTapSound();
              setSelectedSubject(sub);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold tracking-wide transition-all duration-150 shrink-0 cursor-pointer border ${
              selectedSubject === sub
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Level Selection (1, 2, 3) */}
      <div className="flex items-center justify-between bg-slate-900/40 border border-slate-850 px-4 py-2 rounded-2xl text-xs">
        <span className="text-slate-400 font-mono text-[11px] uppercase font-bold">Difficulty Tier:</span>
        <div className="flex space-x-2">
          {[1, 2, 3].map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                playTapSound();
                setSelectedLevel(lvl);
              }}
              className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer ${
                selectedLevel === lvl
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              Level {lvl} {lvl === 3 && "🔥"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Question Card or Round Results Screen */}
      {!isRoundCompleted ? (
        currentQ ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden" id="active_quiz_card">
            
            {/* Timer Progress Bar */}
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-1000 ease-linear ${
                  timeRemaining <= 5 ? "bg-rose-500" : "bg-gradient-to-r from-cyan-500 to-amber-400"
                }`}
                style={{ width: `${(timeRemaining / 30) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-black">
                {currentQ.subject} • Level {currentQ.level}
              </span>
              <h2 className="text-lg md:text-2xl font-bold font-display text-slate-100 leading-relaxed">
                {currentQ.question}
              </h2>
            </div>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctOptionIndex;
                let btnStyle = "bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200";

                if (isAnswerRevealed) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-md shadow-emerald-500/10";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 font-bold";
                  } else {
                    btnStyle = "bg-slate-950/40 border-slate-850 text-slate-500 opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerRevealed}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-xs font-bold text-slate-400 shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm leading-snug flex-1">{option}</span>
                    {isAnswerRevealed && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {isAnswerRevealed && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Solution Explanation Box when revealed */}
            {isAnswerRevealed && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 animate-fade-in">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-mono font-black uppercase tracking-wider">Solution Explanation:</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {currentQ.explanation}
                </p>
              </div>
            )}

            {/* Bottom Actions (Ask AI Hint / Next Question) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              
              <button
                onClick={onOpenChat}
                className="px-3.5 py-2 bg-slate-950 hover:bg-slate-850 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all"
                id="btn_quiz_ask_spark_ai"
              >
                <Brain className="w-4 h-4 text-amber-400" />
                <span>Ask Spark AI Tutor →</span>
              </button>

              {isAnswerRevealed ? (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 cursor-pointer transition-transform active:scale-95"
                  id="btn_quiz_next_question"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <span className="text-[10px] font-mono text-slate-500 italic">
                  Select your answer within the 30-second timer!
                </span>
              )}
            </div>

          </div>
        ) : (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
            <p className="text-slate-400">No questions found for this subject and level combination.</p>
            <button
              onClick={() => setSelectedLevel(1)}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
            >
              Reset to Level 1
            </button>
          </div>
        )
      ) : (
        /* Round Completed Summary Screen */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fade-in" id="quiz_round_summary">
          
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full flex items-center justify-center mx-auto text-2xl font-black shadow-lg shadow-amber-500/20">
            🏆
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-black">
              EXAMINATION COMPLETE
            </span>
            <h2 className="text-2xl md:text-3xl font-black font-display text-slate-100 uppercase">
              Round Completed!
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
              <span className="block text-[10px] font-mono text-slate-400 uppercase">Total Score</span>
              <span className="text-xl font-mono font-black text-amber-400">{score} PTS</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
              <span className="block text-[10px] font-mono text-slate-400 uppercase">Best Streak</span>
              <span className="text-xl font-mono font-black text-emerald-400">{highestStreakSession} 🔥</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 col-span-2 sm:col-span-1">
              <span className="block text-[10px] font-mono text-slate-400 uppercase">Subject</span>
              <span className="text-sm font-bold text-indigo-300">{selectedSubject}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={resetQuizRound}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider shadow-lg flex items-center space-x-1.5 cursor-pointer"
              id="btn_quiz_play_again"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>

            <button
              onClick={onExit}
              className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer"
              id="btn_quiz_exit_dashboard"
            >
              Back to Dashboard
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
