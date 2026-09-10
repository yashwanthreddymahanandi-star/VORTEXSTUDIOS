/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { GradeBand, UserStats, FriendUser, Subject } from "./types";
import QuizGame from "./components/QuizGame";
import ChessGame from "./components/ChessGame";
import LanguageCoach from "./components/LanguageCoach";
import AIChat from "./components/AIChat";
import GrokAppBuilder from "./components/GrokAppBuilder";
import AIVideoGenerator from "./components/AIVideoGenerator";
import StudyDesk from "./components/StudyDesk";
import FriendsHub from "./components/FriendsHub";
import SparkStore from "./components/SparkStore";
import RoyalSplashScreen from "./components/RoyalSplashScreen";
import { SparkLogo } from "./components/SparkLogo";
import { AccountAuthModal } from "./components/AccountAuthModal";
import { 
  Brain, 
  Trophy, 
  ChevronRight, 
  GraduationCap, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Info,
  HelpCircle,
  MessageSquare,
  Flame,
  CheckCircle2,
  ListTodo,
  Music,
  Languages,
  Crown,
  Video,
  Users,
  Swords,
  Eye,
  EyeOff,
  ShoppingBag
} from "lucide-react";
import { 
  playTapSound, 
  playCorrectSound, 
  playOopsSound,
  playDiamondSound,
  setSoundEnabled, 
  getSoundEnabled,
  startBackgroundMusic,
  stopBackgroundMusic
} from "./utils/sound";

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeMode, setActiveMode] = useState<"quiz" | "chess" | "language" | "chat" | "grok" | "video" | "study" | "friends" | "store">("quiz");
  const [selectedGrade, setSelectedGrade] = useState<GradeBand | null>(null);

  // Persistent Unique 7-Digit Friend ID for each user who opens the app
  const [userFriendId, setUserFriendId] = useState<string>(() => {
    let id = localStorage.getItem("solvemate_user_friend_id");
    if (!id || id.length !== 7 || !/^\d{7}$/.exec(id)) {
      id = Math.floor(1000000 + Math.random() * 9000000).toString();
      localStorage.setItem("solvemate_user_friend_id", id);
    }
    return id;
  });

  // Active Quiz Room Match State
  const [activeRoomMatch, setActiveRoomMatch] = useState<{
    opponent: FriendUser;
    roomCode: string;
    subject: Subject;
  } | null>(null);

  const handleStartRoomMatch = (friend: FriendUser, roomCode: string, subject: Subject) => {
    setActiveRoomMatch({ opponent: friend, roomCode, subject });
    if (!selectedGrade) {
      setSelectedGrade("7-10");
    }
    setActiveMode("quiz");
  };

  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [musicOn, setMusicOn] = useState<boolean>(() => {
    const stored = localStorage.getItem("music_enabled");
    return stored === null ? true : stored === "true";
  });

  // Google Account state
  const [googleEmail, setGoogleEmail] = useState<string>(() => {
    const stored = localStorage.getItem("solvemate_google_email");
    if (!stored || stored === "Geethavanimahanandi.com" || stored.toLowerCase().includes("geethavani")) {
      localStorage.setItem("solvemate_google_email", "student101@gmail.com");
      return "student101@gmail.com";
    }
    return stored;
  });

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // VIP & App Publisher Billing States
  const [isVip, setIsVip] = useState<boolean>(() => {
    return localStorage.getItem("solvemate_vip_status") === "true";
  });
  const [isAppPublisherPaid, setIsAppPublisherPaid] = useState<boolean>(() => {
    return localStorage.getItem("solvemate_publisher_status") === "true";
  });
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [checkoutType, setCheckoutType] = useState<"vip" | "publisher">("vip");
  
  // Start/Stop procedural ambient background music
  useEffect(() => {
    if (showSplash) return;
    if (musicOn && soundOn) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
  }, [musicOn, soundOn, showSplash]);

  // Handle user interaction gesture to satisfy browser AudioContext autoplay requirements
  useEffect(() => {
    const handleGesture = () => {
      if (showSplash) return;
      if (musicOn && soundOn) {
        startBackgroundMusic();
      }
    };
    window.addEventListener("click", handleGesture);
    window.addEventListener("keydown", handleGesture);
    return () => {
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("keydown", handleGesture);
    };
  }, [musicOn, soundOn, showSplash]);
  
  // Real-time statistical dashboard from localStorage
  const [stats, setStats] = useState<UserStats>({
    username: "Mathematical Friend",
    points: 100,
    diamonds: 150,
    subscriptionPlan: "free",
    totalGames: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    highestStreak: 0,
    gradesPlayed: { "1-6": 0, "7-10": 0, "11-12": 0 },
    unlockedLevels: { Telugu: 1, English: 1, Maths: 1, Physics: 1, Chemistry: 1, Biology: 1, Social: 1, Hindi: 1 }
  });

  // Sync initial sound setting and retrieve statistics
  useEffect(() => {
    setSoundOn(getSoundEnabled());
    loadStats();
  }, []);

  // Poll stats when quiz is finished or grade changes
  const loadStats = () => {
    try {
      const stored = localStorage.getItem("ramanujan_user_stats");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.username && parsed.username.toLowerCase().includes("geethavani")) {
          parsed.username = "Mathematical Friend";
        }
        if (parsed.diamonds === undefined) {
          parsed.diamonds = 150;
        }
        localStorage.setItem("ramanujan_user_stats", JSON.stringify(parsed));
        setStats(parsed);
      }
    } catch (e) {
      console.warn("Could not retrieve user stats", e);
    }
  };

  const handleToggleSound = () => {
    const nextState = !soundOn;
    setSoundOn(nextState);
    setSoundEnabled(nextState);
    playTapSound();
  };

  const handleToggleMusic = () => {
    const nextState = !musicOn;
    setMusicOn(nextState);
    localStorage.setItem("music_enabled", nextState ? "true" : "false");
    playTapSound();
  };

  const handleSelectGrade = (band: GradeBand) => {
    playTapSound();
    setSelectedGrade(band);
    setActiveMode("quiz");
  };

  const handleDeleteAccount = () => {
    playTapSound();
    if (confirm("Are you sure you want to delete your entire account? This will wipe all progress, scores, custom settings, and revoke VIP access. The app will restart from zero!")) {
      // Clean up all local storage keys
      localStorage.removeItem("ramanujan_user_stats");
      localStorage.removeItem("solvemate_vip_status");
      localStorage.removeItem("solvemate_publisher_status");

      // Reset VIP state variables
      setIsVip(false);
      setIsAppPublisherPaid(false);

      // Issue fully zero-initialized stats
      const randomID = Math.floor(100 + Math.random() * 900);
      const newStats: UserStats = {
        username: `Mathematical Friend #${randomID}`,
        points: 0,
        totalGames: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        highestStreak: 0,
        gradesPlayed: { "1-6": 0, "7-10": 0, "11-12": 0 },
        unlockedLevels: { Telugu: 1, English: 1, Maths: 1, Physics: 1, Chemistry: 1, Biology: 1, Social: 1, Hindi: 1 }
      };
      
      localStorage.setItem("ramanujan_user_stats", JSON.stringify(newStats));
      setStats(newStats);

      // Clear navigation selection
      setSelectedGrade(null);
      setActiveMode("quiz");

      // Force-restart the app experience by showing the loading splash screen again
      setShowSplash(true);

      window.dispatchEvent(new Event("ramanujan_stats_reset"));
      alert("Account deleted! All points and streaks are refreshed to zero, VIP access is locked, and the app has been restarted.");
    }
  };

  const handleSwitchGoogleAccount = (newEmail: string) => {
    playTapSound();

    // Clean up stats, VIP status, and everything to simulate a fresh app account
    setGoogleEmail(newEmail);
    localStorage.setItem("solvemate_google_email", newEmail);
    localStorage.removeItem("ramanujan_user_stats");
    localStorage.setItem("solvemate_vip_status", "false");
    localStorage.setItem("solvemate_publisher_status", "false");
    
    setIsVip(false);
    setIsAppPublisherPaid(false);

    // Create new fresh default user stats
    const randomID = Math.floor(100 + Math.random() * 900);
    const newStats: UserStats = {
      username: `Mathematical Friend #${randomID}`,
      points: 100,
      totalGames: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      highestStreak: 0,
      gradesPlayed: { "1-6": 0, "7-10": 0, "11-12": 0 },
      unlockedLevels: { Telugu: 1, English: 1, Maths: 1, Physics: 1, Chemistry: 1, Biology: 1, Social: 1, Hindi: 1 }
    };

    localStorage.setItem("ramanujan_user_stats", JSON.stringify(newStats));
    setStats(newStats);

    // Reset application states
    setSelectedGrade(null);
    setActiveMode("quiz");

    // Trigger splash screen reload
    setShowSplash(true);

    // Notify the other components
    window.dispatchEvent(new Event("ramanujan_stats_reset"));
    alert(`⚠️ Switched active Google Account to "${newEmail}".\n\nThe application has restarted and loaded from scratch for this account!`);
  };

  const handleResetStats = () => {
    playTapSound();
    if (confirm("Reset all quiz high scores and achievements statistics? This cannot be undone.")) {
      localStorage.removeItem("ramanujan_user_stats");
      setStats({
        username: "Mathematical Friend",
        points: 100,
        totalGames: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        highestStreak: 0,
        gradesPlayed: { "1-6": 0, "7-10": 0, "11-12": 0 },
        unlockedLevels: {}
      });
    }
  };

  // Switch view tabs
  const handleSwitchTab = (tab: "quiz" | "chess" | "language" | "chat" | "grok" | "video" | "study" | "friends" | "store") => {
    playTapSound();
    setActiveMode(tab);
    loadStats(); // reload points and stats dynamically
  };

  const handleOpenCheckout = (type: "vip" | "publisher") => {
    playTapSound();
    setCheckoutType(type);
    setShowCheckoutModal(true);
  };

  const handlePurchaseSuccess = (type: "vip" | "publisher") => {
    playCorrectSound();
    if (type === "vip") {
      setIsVip(true);
      localStorage.setItem("solvemate_vip_status", "true");
    } else {
      setIsAppPublisherPaid(true);
      localStorage.setItem("solvemate_publisher_status", "true");
    }
    setShowCheckoutModal(false);
  };

  const handleAddPoints = (pointsToAdd: number) => {
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
          unlockedLevels: {}
        };
      }
      currentStats.points = (currentStats.points || 0) + pointsToAdd;
      localStorage.setItem("ramanujan_user_stats", JSON.stringify(currentStats));
      setStats(currentStats);
    } catch (e) {
      console.warn("Could not save points", e);
    }
  };

  // Computed accuracy percentage
  const overallAccuracy = stats.totalQuestions > 0 
    ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) 
    : 0;

  if (showSplash) {
    return (
      <RoyalSplashScreen 
        onComplete={() => {
          setShowSplash(false);
          setShowAuthModal(true);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200" id="main_layout">
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-10">
        <div className="absolute -top-[30%] -left-[10%] w-[600px] h-[600px] bg-indigo-600 rounded-full filter blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] bg-amber-500 rounded-full filter blur-[100px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] bg-purple-600 rounded-full filter blur-[110px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Header Navigation */}
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            
            {/* Logo/Identity */}
            <div 
              onClick={() => {
                playTapSound();
                setSelectedGrade(null);
                handleSwitchTab("quiz");
              }}
              className="flex items-center space-x-2.5 cursor-pointer hover:opacity-90 transition-opacity"
              id="header_identity_logo"
            >
              <div className="p-1 bg-slate-900 border border-cyan-500/30 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center overflow-hidden">
                <SparkLogo size="sm" showText={false} className="scale-125" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight font-display bg-gradient-to-r from-slate-100 via-slate-100 to-amber-400 bg-clip-text text-transparent uppercase flex items-center gap-1.5">
                  <span>SPARK THE EDUCATIONAL FRIEND</span>
                  {isVip && (
                    <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-400/15 border border-amber-400/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      SOLVEMATE
                    </span>
                  )}
                </h1>
                <span className="block text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase">
                  Royal Studios Edition
                </span>
              </div>
            </div>

            {/* Quick Navigation Modes Toggle */}
            <div className="flex items-center space-x-1 md:space-x-3">
              <nav className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl shadow-inner overflow-x-auto max-w-[280px] sm:max-w-none">
                
                <button
                  onClick={() => handleSwitchTab("friends")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 flex items-center space-x-1 cursor-pointer shrink-0 ${
                    activeMode === "friends"
                      ? "bg-indigo-600 text-slate-100 font-extrabold shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  id="tab_mode_friends"
                >
                  <Users className="w-3.5 h-3.5 text-indigo-300" />
                  <span>FRIENDS &amp; CHAT</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedGrade(null);
                    handleSwitchTab("quiz");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 flex items-center space-x-1 cursor-pointer shrink-0 ${
                    activeMode === "quiz"
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  id="tab_mode_quiz"
                >
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>QUIZ</span>
                </button>

                <button
                  onClick={() => handleSwitchTab("study")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 flex items-center space-x-1 cursor-pointer shrink-0 ${
                    activeMode === "study"
                      ? "bg-indigo-600 text-slate-100 font-extrabold shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  id="tab_mode_study"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>STUDY ROOM</span>
                </button>

                <button
                  onClick={() => handleSwitchTab("chess")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 flex items-center space-x-1 cursor-pointer shrink-0 ${
                    activeMode === "chess"
                      ? "bg-indigo-600 text-slate-100 font-extrabold shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  id="tab_mode_chess"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-300" />
                  <span>CHESS</span>
                </button>

                <button
                  onClick={() => handleSwitchTab("language")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 flex items-center space-x-1 cursor-pointer shrink-0 ${
                    activeMode === "language"
                      ? "bg-emerald-600 text-slate-100 font-extrabold shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  id="tab_mode_language"
                >
                  <Languages className="w-3.5 h-3.5 text-emerald-300" />
                  <span>LANG COACH</span>
                </button>

                <button
                  onClick={() => handleSwitchTab("chat")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 flex items-center space-x-1 cursor-pointer shrink-0 ${
                    activeMode === "chat"
                      ? "bg-amber-600 text-slate-950 font-extrabold shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  id="tab_mode_chat"
                >
                  <Brain className="w-3.5 h-3.5 text-slate-950" />
                  <span>SPARK AI</span>
                </button>

                <button
                  onClick={() => handleSwitchTab("grok")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 flex items-center space-x-1 cursor-pointer shrink-0 relative ${
                    activeMode === "grok"
                      ? "bg-purple-600 text-slate-100 font-extrabold shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  id="tab_mode_grok"
                >
                  <Crown className="w-3.5 h-3.5 text-purple-300" />
                  <span>APP CREATOR</span>
                  {!isVip && (
                    <span className="absolute -top-1 -right-1 text-[8px] bg-amber-500 text-slate-950 px-1 rounded-full font-black scale-90">VIP</span>
                  )}
                </button>

                <button
                  onClick={() => handleSwitchTab("video")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 flex items-center space-x-1 cursor-pointer shrink-0 relative ${
                    activeMode === "video"
                      ? "bg-indigo-600 text-slate-100 font-extrabold shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  id="tab_mode_video"
                >
                  <Video className="w-3.5 h-3.5 text-pink-400" />
                  <span>VIDEO GEN</span>
                  {!isVip && (
                    <span className="absolute -top-1 -right-1 text-[8px] bg-amber-500 text-slate-950 px-1 rounded-full font-black scale-90">VIP</span>
                  )}
                </button>

                <button
                  onClick={() => handleSwitchTab("store")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 flex items-center space-x-1 cursor-pointer shrink-0 relative ${
                    activeMode === "store"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/20"
                      : "text-slate-400 hover:text-cyan-300"
                  }`}
                  id="tab_mode_store"
                >
                  <span className="text-sm leading-none">💎</span>
                  <span>STORE</span>
                  <span className="absolute -top-1 -right-1 text-[8px] bg-emerald-400 text-slate-950 px-1 rounded-full font-black scale-90">GPAY</span>
                </button>

              </nav>

              {/* VIP Member Button */}
              {isVip ? (
                <button
                  onClick={() => handleOpenCheckout("vip")}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/10 flex items-center space-x-1 cursor-pointer uppercase tracking-wider"
                  id="btn_header_vip_active"
                >
                  <Crown className="w-3.5 h-3.5 fill-slate-950 text-slate-950 animate-bounce" />
                  <span>VIP MEMBER</span>
                </button>
              ) : (
                <button
                  onClick={() => handleOpenCheckout("vip")}
                  className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-purple-500/15 flex items-center space-x-1 cursor-pointer uppercase tracking-wide"
                  id="btn_header_get_vip"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>GET VIP ACCESS</span>
                </button>
              )}

              {/* Account Portal (Create Account / Log In) Button */}
              <button
                onClick={() => { playTapSound(); setShowAuthModal(true); }}
                className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-cyan-500/20 flex items-center space-x-1.5 cursor-pointer uppercase tracking-wider transition-all transform hover:scale-105"
                id="btn_header_account_portal"
              >
                <GraduationCap className="w-4 h-4" />
                <span className="hidden sm:inline">CREATE ACCOUNT / LOG IN</span>
                <span className="sm:hidden">ACCOUNT</span>
              </button>

              {/* Music Button */}
              <button
                onClick={handleToggleMusic}
                className={`p-2 border rounded-lg transition-all shadow-inner flex items-center justify-center relative cursor-pointer ${
                  musicOn && soundOn
                    ? "bg-slate-900 border-indigo-500/50 text-indigo-400 hover:text-indigo-300"
                    : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400"
                }`}
                title={musicOn ? "Mute Background Music" : "Enable Ambient Music"}
                id="btn_toggle_music"
              >
                <Music className={`w-4 h-4 ${musicOn && soundOn ? "animate-pulse" : ""}`} />
                {musicOn && soundOn && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
                )}
              </button>

              {/* Sound Button */}
              <button
                onClick={handleToggleSound}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-400 rounded-lg transition-all shadow-inner cursor-pointer"
                title={soundOn ? "Mute Sound" : "Enable Sound"}
                id="btn_toggle_sound"
              >
                {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* Global Score Panel */}
        <div className="bg-slate-900/30 border-b border-slate-900/80 px-6 py-2.5 flex flex-wrap items-center justify-center text-xs gap-3 select-none">
          <span className="text-slate-400 font-semibold uppercase">Scoreboard:</span>
          <span className="text-amber-400 font-mono font-black tracking-wide text-sm bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            {stats.points || 0} PTS
          </span>
          <span className="text-slate-600">|</span>

          {/* Diamonds Balance & Store Trigger */}
          <div 
            onClick={() => { playTapSound(); setActiveMode("store"); }}
            className="flex items-center space-x-1.5 bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 rounded-lg cursor-pointer hover:bg-cyan-900/90 transition-colors shadow-sm"
            title="Click to open Google Pay Diamond Store & Subscriptions"
            id="scoreboard_diamonds_badge"
          >
            <span className="text-sm">💎</span>
            <span className="text-cyan-300 font-mono font-black text-xs tracking-wide">
              {(stats.diamonds ?? 150).toLocaleString()} <span className="text-[10px] text-cyan-400 font-normal">GEMS</span>
            </span>
            <span className="text-[9px] bg-cyan-500 text-slate-950 px-1 py-0.2 rounded font-black uppercase ml-1">
              STORE
            </span>
          </div>

          <span className="text-slate-600">|</span>
          <span className="text-indigo-300 font-mono font-bold">Player: {stats.username || "Mathematical Friend"}</span>
          <span className="text-slate-600">|</span>
          
          {/* User 7-Digit Friend ID Quick Badge */}
          <div 
            onClick={() => { playTapSound(); setActiveMode("friends"); }}
            className="flex items-center space-x-1.5 bg-indigo-950/80 border border-indigo-500/40 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-indigo-900/80 transition-colors"
            title="Click to view My Friends & Chat"
          >
            <span className="text-[10px] font-mono text-indigo-300 uppercase font-black">ID:</span>
            <span className="text-amber-400 font-mono font-black text-[11px] tracking-wide">{userFriendId}</span>
          </div>

          <span className="text-slate-600">|</span>

          {/* App Made By Yashwanth Reddy Mahanandi Badge */}
          <div className="flex items-center space-x-1.5 bg-amber-950/50 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[10px] font-mono">
            <span className="text-slate-400 uppercase">Made By:</span>
            <span className="text-amber-400 font-bold tracking-wide">yashwanthreddymahanandi</span>
          </div>

          <span className="text-slate-600">|</span>
          
          {/* Active Google Account Simulator Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-950/90 border border-slate-800 px-2.5 py-1 rounded-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-black">Google:</span>
            <select
              value={googleEmail}
              onChange={(e) => handleSwitchGoogleAccount(e.target.value)}
              className="bg-transparent text-slate-200 font-mono text-[10px] font-bold outline-none border-none cursor-pointer focus:ring-0"
              id="google_account_select"
            >
              <option value="student101@gmail.com" className="bg-slate-950 text-indigo-400 font-bold">student101@gmail.com (Active Account)</option>
              <option value="new.user@gmail.com" className="bg-slate-950 text-slate-300">new.user@gmail.com (Fresh Reset Account)</option>
            </select>
          </div>

          <span className="text-slate-600">|</span>

          <button
            onClick={handleDeleteAccount}
            className="px-2.5 py-1 bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 hover:text-white border border-rose-900/30 hover:border-rose-500/50 rounded-lg font-mono font-extrabold tracking-wide text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-95"
            title="Delete this account and issue a completely fresh new account!"
            id="btn_delete_refresh_account"
          >
            <span>🔄</span> RESET
          </button>
        </div>

        {/* Core Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 relative z-10 flex flex-col justify-start">
          
          {activeMode === "quiz" && (
            selectedGrade ? (
              // Quiz Playing Screen
              <div className="w-full animate-fade-in my-auto">
                <QuizGame
                  gradeBand={selectedGrade}
                  isVip={isVip}
                  onRequestVip={() => handleOpenCheckout("vip")}
                  onExit={() => {
                    playTapSound();
                    setSelectedGrade(null);
                    loadStats();
                  }}
                  onOpenChat={() => {
                    playTapSound();
                    setActiveMode("chat");
                  }}
                  onOpenFriendsHub={() => {
                    playTapSound();
                    setActiveMode("friends");
                  }}
                  roomMatchData={activeRoomMatch}
                  onClearRoomMatch={() => setActiveRoomMatch(null)}
                />
              </div>
            ) : (
              // Main Landing Dashboard (Grade Choices & Stats)
              <div className="space-y-12 animate-fade-in flex-1 flex flex-col justify-center">
                
                {/* Hero Headline */}
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                  <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-400/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: "3s" }} />
                    <span>100% OFFLINE PLAYABLE KNOWLEDGE SYSTEM</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-5xl font-black font-display tracking-tight text-slate-100 uppercase">
                    Mathematical Friend
                  </h2>
                  <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                    Test your logic, calculation, science formulas, demography, and grammar. Play the offline game or consult our AI tutor, <strong className="text-amber-400 font-semibold font-mono">SPARK AI (POWERED BY GEMINI)</strong>, for assistance!
                  </p>
                </div>

                {/* The Three Choices */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto" id="grade_choices_wrapper">
                  
                  {/* Choice 1: Grades 1-6 */}
                  <div
                    onClick={() => handleSelectGrade("1-6")}
                    className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-400/40 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-amber-500/5 cursor-pointer relative overflow-hidden"
                    id="choice_grade_1_6"
                  >
                    <div className="absolute -top-[10%] -left-[10%] w-24 h-24 bg-amber-400/5 rounded-full filter blur-xl group-hover:bg-amber-400/10 transition-colors" />
                    
                    <div className="space-y-4 relative z-10">
                      <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center font-bold text-lg font-mono">
                        01
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold uppercase">Choice One</span>
                        <h3 className="text-xl md:text-2xl font-bold font-display text-slate-100">
                          GRADES 1 TO 6
                        </h3>
                      </div>
                      <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                        Challenging curriculum designed for primary levels. Includes fractional arithmetic, solar eclipses, Declaration of Independence trivia, and synonym vocabulary.
                      </p>
                    </div>

                    <div className="pt-6 flex items-center justify-between border-t border-slate-800/60 mt-6 relative z-10">
                      <span className="text-xs text-slate-400 font-mono">Difficulty: Moderate</span>
                      <div className="flex items-center space-x-1 text-amber-400 group-hover:translate-x-1.5 transition-transform">
                        <span className="text-xs font-bold uppercase tracking-wider">Launch</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Choice 2: Grades 7-10 */}
                  <div
                    onClick={() => handleSelectGrade("7-10")}
                    className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-400/40 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-indigo-500/5 cursor-pointer relative overflow-hidden"
                    id="choice_grade_7_10"
                  >
                    <div className="absolute -top-[10%] -left-[10%] w-24 h-24 bg-indigo-500/5 rounded-full filter blur-xl group-hover:bg-indigo-500/10 transition-colors" />
                    
                    <div className="space-y-4 relative z-10">
                      <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center font-bold text-lg font-mono">
                        02
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono tracking-widest text-indigo-400 font-bold uppercase">Choice Two</span>
                        <h3 className="text-xl md:text-2xl font-bold font-display text-slate-100">
                          GRADES 7 TO 10
                        </h3>
                      </div>
                      <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                        Demanding problems targeting secondary level thinkers. Includes algebra equation variables, Newton laws, mitochondria eukaryotic biology, and classic river-fox logic.
                      </p>
                    </div>

                    <div className="pt-6 flex items-center justify-between border-t border-slate-800/60 mt-6 relative z-10">
                      <span className="text-xs text-slate-400 font-mono">Difficulty: High</span>
                      <div className="flex items-center space-x-1 text-indigo-400 group-hover:translate-x-1.5 transition-transform">
                        <span className="text-xs font-bold uppercase tracking-wider">Launch</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Choice 3: Grades 11-12 */}
                  <div
                    onClick={() => handleSelectGrade("11-12")}
                    className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-purple-400/40 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-purple-500/5 cursor-pointer relative overflow-hidden"
                    id="choice_grade_11_12"
                  >
                    <div className="absolute -top-[10%] -left-[10%] w-24 h-24 bg-purple-500/5 rounded-full filter blur-xl group-hover:bg-purple-500/10 transition-colors" />
                    
                    <div className="space-y-4 relative z-10">
                      <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center font-bold text-lg font-mono">
                        03
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono tracking-widest text-purple-400 font-bold uppercase">Choice Three</span>
                        <h3 className="text-xl md:text-2xl font-bold font-display text-slate-100">
                          GRADES 11 &amp; 12
                        </h3>
                      </div>
                      <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                        Elite collegiate challenges for advanced high school minds. Covering calculus derivatives, complex power variables, demographic Total Fertility Rates, and soliloquies.
                      </p>
                    </div>

                    <div className="pt-6 flex items-center justify-between border-t border-slate-800/60 mt-6 relative z-10">
                      <span className="text-xs text-slate-400 font-mono">Difficulty: Expert</span>
                      <div className="flex items-center space-x-1 text-purple-400 group-hover:translate-x-1.5 transition-transform">
                        <span className="text-xs font-bold uppercase tracking-wider">Launch</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Persistent Stats Local Dashboard */}
                <div className="max-w-4xl mx-auto bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden" id="dashboard_stats_panel">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
                    <div className="flex items-center space-x-2.5">
                      <Trophy className="w-5 h-5 text-amber-400" />
                      <h4 className="font-bold text-slate-200 tracking-wide">
                        PERSISTENT LOCAL RECORDS
                      </h4>
                    </div>
                    {stats.totalQuestions > 0 && (
                      <button
                        onClick={handleResetStats}
                        className="text-xs text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 px-3 py-1.5 rounded-xl bg-slate-950/40 hover:bg-rose-500/5 transition-all self-start"
                        id="btn_reset_stats"
                      >
                        Reset High Scores
                      </button>
                    )}
                  </div>

                  {stats.totalQuestions > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                      <div className="bg-slate-950/50 border border-slate-800/40 p-4 rounded-2xl">
                        <span className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1">Sheet Accuracy</span>
                        <span className="text-xl md:text-3xl font-extrabold text-amber-400">{overallAccuracy}%</span>
                        <span className="block text-[9px] text-slate-500 mt-0.5">Average correct ratio</span>
                      </div>
                      <div className="bg-slate-950/50 border border-slate-800/40 p-4 rounded-2xl">
                        <span className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1">Solved / Total</span>
                        <span className="text-xl md:text-3xl font-extrabold text-indigo-400">{stats.totalCorrect} / {stats.totalQuestions}</span>
                        <span className="block text-[9px] text-slate-500 mt-0.5">Academic solutions count</span>
                      </div>
                      <div className="bg-slate-950/50 border border-slate-800/40 p-4 rounded-2xl">
                        <span className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1">Highest Streak</span>
                        <span className="text-xl md:text-3xl font-extrabold text-emerald-400">{stats.highestStreak} 🔥</span>
                        <span className="block text-[9px] text-slate-500 mt-0.5">Consecutive lock-ins</span>
                      </div>
                      <div className="bg-slate-950/50 border border-slate-800/40 p-4 rounded-2xl">
                        <span className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1">Games Played</span>
                        <span className="text-xl md:text-3xl font-extrabold text-purple-400">{stats.totalGames}</span>
                        <span className="block text-[9px] text-slate-500 mt-0.5">Fully completed attempts</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-400 text-sm italic">
                        No examination records saved yet. Complete your first 30-second-timer Quiz sheet to initialize tracking metrics!
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )
          )}

          {activeMode === "study" && (
            <div className="w-full animate-fade-in my-auto">
              <StudyDesk />
            </div>
          )}

          {activeMode === "chess" && (
            <div className="w-full animate-fade-in my-auto">
              <ChessGame onAddPoints={handleAddPoints} />
            </div>
          )}

          {activeMode === "language" && (
            <div className="w-full animate-fade-in my-auto">
              <LanguageCoach 
                onAddPoints={handleAddPoints} 
                isVip={isVip} 
                onRequestVip={() => handleOpenCheckout("vip")} 
              />
            </div>
          )}

          {activeMode === "chat" && (
            <div className="w-full max-w-4xl mx-auto animate-fade-in my-auto">
              <AIChat />
            </div>
          )}

          {activeMode === "grok" && (
            <div className="w-full animate-fade-in my-auto">
              <GrokAppBuilder
                isVip={isVip}
                isAppPublisherPaid={isAppPublisherPaid}
                onPurchaseVip={() => handleOpenCheckout("vip")}
                onPurchasePublisher={() => handleOpenCheckout("publisher")}
                onTriggerPublish={() => handleOpenCheckout("publisher")}
              />
            </div>
          )}

          {activeMode === "video" && (
            <div className="w-full animate-fade-in my-auto">
              <AIVideoGenerator 
                isVip={isVip} 
                onRequestVip={() => handleOpenCheckout("vip")} 
              />
            </div>
          )}

          {activeMode === "friends" && (
            <div className="w-full animate-fade-in my-auto">
              <FriendsHub
                userStats={stats}
                userFriendId={userFriendId}
                onStartRoomMatch={handleStartRoomMatch}
              />
            </div>
          )}

          {activeMode === "store" && (
            <div className="w-full animate-fade-in my-auto">
              <SparkStore
                userStats={stats}
                isVip={isVip}
                onUpdateStats={(newStats) => {
                  setStats(newStats);
                  localStorage.setItem("ramanujan_user_stats", JSON.stringify(newStats));
                }}
                onSetVip={(vipStatus) => {
                  setIsVip(vipStatus);
                  localStorage.setItem("solvemate_vip_status", vipStatus ? "true" : "false");
                }}
              />
            </div>
          )}

        </main>

        {/* Informational Sub-Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/90 py-6 text-center text-xs text-slate-500 relative z-10">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 justify-center font-sans">
              <GraduationCap className="w-4 h-4 text-amber-500" />
              <span>SPARK THE EDUCATIONAL FRIEND — Royal Studios Hub • Application made by <strong className="text-amber-400 font-bold">yashwanthreddymahanandi</strong> (Yashwanth Reddy Mahanandi).</span>
            </span>
            <span className="text-[10px] font-mono">UTC: 2026 • GOOGLE PAY STORE &amp; DIAMONDS READY</span>
          </div>
        </footer>

      </div>

      {/* STUNNING SIMULATED BILLING CHECKOUT GATEWAY */}
      {showCheckoutModal && (
        <BillingCheckoutModal 
          type={checkoutType}
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={handlePurchaseSuccess}
        />
      )}

      {/* Spark Account Portal Modal (Create Account / Log In) */}
      {showAuthModal && (
        <AccountAuthModal
          onClose={() => setShowAuthModal(false)}
          currentFriendId={userFriendId}
          onSuccess={(userData) => {
            setGoogleEmail(userData.gmail);
            setUserFriendId(userData.friendId);
            loadStats();
            window.dispatchEvent(new Event("ramanujan_stats_reset"));
          }}
        />
      )}

    </div>
  );
}

interface BillingModalProps {
  type: "vip" | "publisher";
  onClose: () => void;
  onSuccess: (type: "vip" | "publisher") => void;
}

function BillingCheckoutModal({ type, onClose, onSuccess }: BillingModalProps) {
  const [checkoutTab, setCheckoutTab] = useState<"gpay" | "passcode">("gpay");
  const [paymentStep, setPaymentStep] = useState<"idle" | "processing" | "success">("idle");
  const [processStatus, setProcessStatus] = useState("");
  const [creatorPassword, setCreatorPassword] = useState("");
  const [creatorError, setCreatorError] = useState("");
  const [showCreatorPassword, setShowCreatorPassword] = useState(false);

  const productName = type === "vip" ? "Spark VIP Monthly Pass" : "App Publisher License";
  const priceInr = type === "vip" ? 299 : 599;
  const priceUsd = type === "vip" ? 4.99 : 9.99;

  const handleTriggerGooglePay = async () => {
    playTapSound();
    setPaymentStep("processing");
    setProcessStatus("Initiating Google Pay checkout for ₹" + priceInr + "...");

    try {
      await new Promise(r => setTimeout(r, 600));
      setProcessStatus("Authorizing payment token via Google Pay Gateway...");

      const res = await fetch("/api/pay/process-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "subscription",
          itemId: type === "vip" ? "vip_monthly" : "publisher_license",
          amountInr: priceInr,
          amountUsd: priceUsd,
          paymentMethod: "google_pay"
        })
      });

      const data = await res.json();
      if (data.success && data.receipt) {
        // Record receipt
        try {
          const stored = localStorage.getItem("spark_payment_receipts");
          const arr = stored ? JSON.parse(stored) : [];
          localStorage.setItem("spark_payment_receipts", JSON.stringify([data.receipt, ...arr]));
        } catch {}

        setProcessStatus("Transaction verified! ID: " + data.receipt.transactionId);
        setPaymentStep("success");
        playDiamondSound();
        setTimeout(() => {
          onSuccess(type);
        }, 1500);
      } else {
        throw new Error(data.error || "Payment verification failed");
      }
    } catch (e: any) {
      alert("⚠️ Google Pay error: " + (e.message || "Please retry."));
      setPaymentStep("idle");
    }
  };

  const handleCheckCreatorPassword = () => {
    playTapSound();
    const cleanInput = creatorPassword.trim().toUpperCase().replace(/\s+/g, " ");
    if (
      cleanInput === "MAHANANDI SARVESWARA REDDY" || 
      cleanInput === "MAHANANDISARVESWARAREDDY" ||
      cleanInput === "YASHWANTH REDDY MAHANANDI" ||
      cleanInput === "YASHWANTHREDDYMAHANANDI"
    ) {
      setCreatorError("");
      setPaymentStep("processing");
      setProcessStatus("Verifying Creator Credentials for Yashwanth Reddy Mahanandi...");
      
      setTimeout(() => {
        setProcessStatus("Configuring Lifetime VIP privileges & Developer bypass...");
      }, 1000);

      setTimeout(() => {
        setPaymentStep("success");
        playCorrectSound();
        setTimeout(() => {
          onSuccess(type);
        }, 1500);
      }, 2000);
    } else {
      setCreatorError("❌ Invalid creator password. OOPS!");
      playOopsSound();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" id="billing_checkout_modal_container">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-red-500 via-yellow-400 to-green-500" />

        {paymentStep === "idle" && (
          <>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded text-cyan-300 font-mono font-bold uppercase tracking-wider">
                  GOOGLE PAY SECURE CHECKOUT
                </span>
                <h3 className="text-lg font-black font-display text-slate-100 uppercase tracking-tight">{productName}</h3>
              </div>
              <button 
                onClick={() => { playTapSound(); onClose(); }}
                className="text-slate-500 hover:text-slate-300 p-1 rounded-lg text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2">
              <div className="flex justify-between items-baseline border-b border-slate-850 pb-2">
                <span className="text-xs font-mono text-slate-400 uppercase font-bold">Total Payable:</span>
                <span className="text-xl font-black font-mono text-emerald-400">
                  ₹{priceInr} <span className="text-xs text-slate-500 font-normal">(~${priceUsd})</span>
                </span>
              </div>
              <h4 className="text-[11px] font-black font-mono tracking-wider text-purple-400 uppercase pt-1">
                💎 PREMIUM PRIVILEGES DETAILED:
              </h4>
              <ul className="text-[10px] text-slate-400 space-y-1 font-medium list-disc list-inside">
                {type === "vip" ? (
                  <>
                    <li>Unlock full 32 global learning languages</li>
                    <li>Instant Gemini AI App Creator &amp; Sandbox</li>
                    <li>Exclusive "VIP.SOLVEMATE" title branding badge</li>
                    <li>Full high-fidelity voice chat synthesizer &amp; 100 Bonus Diamonds</li>
                  </>
                ) : (
                  <>
                    <li>Deploy custom Android APK bundles</li>
                    <li>Deploy custom Apple iOS IPA packages</li>
                    <li>Publish web assets instantly in 1-click</li>
                    <li>Access advanced telemetry configuration</li>
                  </>
                )}
              </ul>
            </div>

            {/* Switch Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold font-display">
              <button
                type="button"
                onClick={() => { playTapSound(); setCheckoutTab("gpay"); }}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  checkoutTab === "gpay"
                    ? "bg-slate-850 text-white shadow font-black"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>Google Pay</span>
                <span className="text-emerald-400 font-mono">₹{priceInr}</span>
              </button>
              <button
                type="button"
                onClick={() => { playTapSound(); setCheckoutTab("passcode"); }}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                  checkoutTab === "passcode"
                    ? "bg-slate-850 text-white shadow font-black"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>Creator Passcode</span>
              </button>
            </div>

            {checkoutTab === "gpay" ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleTriggerGooglePay}
                  className="w-full py-3.5 bg-black hover:bg-neutral-900 border border-neutral-700 text-white rounded-2xl font-display font-bold text-sm tracking-wide flex items-center justify-center space-x-2 cursor-pointer shadow-xl transition-all hover:scale-[1.02] active:scale-98"
                  id="btn_billing_gpay_confirm"
                >
                  <span className="text-xs uppercase font-mono text-neutral-400">Pay with</span>
                  <div className="flex items-center space-x-1 font-black text-base">
                    <span className="text-blue-500">G</span>
                    <span className="text-red-500">o</span>
                    <span className="text-yellow-500">o</span>
                    <span className="text-blue-500">g</span>
                    <span className="text-green-500">l</span>
                    <span className="text-red-500">e</span>
                    <span className="text-slate-100 ml-1">Pay</span>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold ml-1">₹{priceInr}</span>
                </button>

                <p className="text-[10px] text-center text-slate-500 font-mono">
                  Supported via Google Pay Cards &amp; UPI • Created by <strong className="text-amber-400">Yashwanth Reddy Mahanandi</strong>
                </p>
              </div>
            ) : (
              /* Creator Password Board Option */
              <div className="space-y-3" id="creator_password_board">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] text-purple-400 font-mono uppercase font-black tracking-wider">
                      🔑 CREATOR / VIP PASSCODE:
                    </label>
                    <label className="flex items-center space-x-1.5 text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showCreatorPassword}
                        onChange={(e) => setShowCreatorPassword(e.target.checked)}
                        className="rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 cursor-pointer"
                        id="checkbox_show_vip_passcode"
                      />
                      <span className="font-mono text-[9px] uppercase font-bold text-purple-300">Show Passcode</span>
                    </label>
                  </div>

                  <p className="text-[9px] text-slate-500 leading-relaxed pb-1">
                    Beta tester or developer? Enter your secure passcode to instantly unlock this tier for free.
                  </p>

                  <div className="relative">
                    <input
                      type={showCreatorPassword ? "text" : "password"}
                      value={creatorPassword}
                      onChange={(e) => setCreatorPassword(e.target.value)}
                      placeholder="Enter creator passcode..."
                      className="w-full bg-slate-950 border border-slate-850 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 uppercase font-mono tracking-wider text-center pr-10"
                      id="creator_password_input"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCheckCreatorPassword();
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => { playTapSound(); setShowCreatorPassword(!showCreatorPassword); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors cursor-pointer"
                      title={showCreatorPassword ? "Hide passcode" : "Show passcode"}
                      id="btn_toggle_show_vip_passcode"
                    >
                      {showCreatorPassword ? <EyeOff className="w-4 h-4 text-purple-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleCheckCreatorPassword}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl uppercase tracking-wider shadow-lg shadow-purple-500/10 cursor-pointer flex items-center justify-center space-x-1.5"
                  id="btn_submit_creator_password"
                >
                  <span>🔑 UNLOCK WITH PASSCODE</span>
                </button>

                {creatorError && (
                  <p className="text-center text-[10px] text-red-400 font-mono animate-bounce" id="creator_password_error">
                    {creatorError}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {paymentStep === "processing" && (
          <div className="text-center py-12 space-y-6 animate-pulse" id="processing_payment_screen">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 border-r-emerald-500 rounded-full animate-spin mx-auto" />
            <div className="space-y-2">
              <h4 className="font-black text-slate-200 text-sm uppercase tracking-wider font-display">Processing Payment</h4>
              <p className="text-[11px] text-cyan-400 font-mono">{processStatus}</p>
            </div>
          </div>
        )}

        {paymentStep === "success" && (
          <div className="text-center py-12 space-y-6 animate-fade-in" id="success_payment_screen">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
              ✓
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-slate-200 text-sm uppercase tracking-wider font-display">Privileges Granted!</h4>
              <p className="text-[11px] text-emerald-400 font-mono">Welcome to our elite VIP Tier!</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
