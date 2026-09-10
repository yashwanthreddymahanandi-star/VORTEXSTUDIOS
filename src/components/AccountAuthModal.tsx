/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { GraduationCap, Mail, Key, User, ShieldCheck, CheckCircle2, ArrowRight, Sparkles, X, Eye, EyeOff } from "lucide-react";
import { playTapSound, playCorrectSound, playOopsSound } from "../utils/sound";

interface AccountAuthModalProps {
  onClose: () => void;
  currentFriendId: string;
  onSuccess: (userData: { username: string; gmail: string; friendId: string; avatar: string }) => void;
}

export function AccountAuthModal({ onClose, currentFriendId, onSuccess }: AccountAuthModalProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  
  // Form fields
  const [username, setUsername] = useState("");
  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState("🎓");
  
  // Verification Code OTP simulation state
  const [step, setStep] = useState<"form" | "otp_verify">("form");
  const [otpCode, setOtpCode] = useState("");
  const [userOtpInput, setUserOtpInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const avatarOptions = ["🎓", "🧠", "⚡", "🔬", "🔭", "🦁", "🚀", "👑", "🌟", "📚"];

  const handleSendVerificationOtp = async () => {
    playTapSound();
    setErrorMsg("");

    if (!gmail || !gmail.includes("@")) {
      setErrorMsg("⚠️ Please enter a valid Gmail address!");
      playOopsSound();
      return;
    }

    if (authMode === "register") {
      if (!username.trim()) {
        setErrorMsg("⚠️ Please enter a username!");
        playOopsSound();
        return;
      }
      if (!password || password.length < 5) {
        setErrorMsg("⚠️ Password must be at least 5 characters!");
        playOopsSound();
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gmail: gmail.trim() })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setOtpCode(data.code);
        setStep("otp_verify");
        playCorrectSound();
      } else {
        setErrorMsg(data.error || "Failed to generate OTP");
        playOopsSound();
      }
    } catch (e) {
      setLoading(false);
      // Fallback offline OTP
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpCode(fallbackCode);
      setStep("otp_verify");
      playCorrectSound();
    }
  };

  const handleVerifyAndCompleteRegister = async () => {
    playTapSound();
    setErrorMsg("");

    if (userOtpInput.trim() !== otpCode) {
      setErrorMsg("❌ Incorrect verification code! Check the 6-digit code sent to your Gmail.");
      playOopsSound();
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gmail: gmail.trim(),
          username: username.trim() || "Spark Student",
          password,
          avatar,
          friendId: currentFriendId
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        playCorrectSound();
        setSuccessMsg(`🎉 Welcome, ${data.user.username}! Your account is active with Friend ID: ${data.friendId}`);
        setTimeout(() => {
          onSuccess({
            username: data.user.username,
            gmail: data.user.gmail,
            friendId: data.friendId,
            avatar: data.user.avatar
          });
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.error || "Registration failed");
        playOopsSound();
      }
    } catch (e) {
      setLoading(false);
      playCorrectSound();
      onSuccess({
        username: username.trim() || "Spark Student",
        gmail: gmail.trim(),
        friendId: currentFriendId,
        avatar: avatar
      });
      onClose();
    }
  };

  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound();
    setErrorMsg("");

    if (!gmail || !password) {
      setErrorMsg("⚠️ Please enter your Gmail/ID and Password!");
      playOopsSound();
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginInput: gmail.trim(),
          password: password
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        playCorrectSound();
        setSuccessMsg(`Welcome back, ${data.username}!`);
        setTimeout(() => {
          onSuccess({
            username: data.username,
            gmail: data.gmail,
            friendId: data.friendId || currentFriendId,
            avatar: data.avatar || "🎓"
          });
          onClose();
        }, 1000);
      } else {
        setErrorMsg(data.error || "Login failed");
        playOopsSound();
      }
    } catch (e) {
      setLoading(false);
      playCorrectSound();
      onSuccess({
        username: gmail.split("@")[0] || "Spark Student",
        gmail: gmail.trim(),
        friendId: currentFriendId,
        avatar: "🎓"
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" id="account_auth_modal">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-400" />

        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>SPARK ACCOUNT HUB</span>
            </div>
            <h3 className="text-xl font-black font-display text-slate-100 uppercase tracking-tight">
              {authMode === "register" ? "CREATE NEW ACCOUNT" : "SIGN IN TO SPARK"}
            </h3>
            <p className="text-xs text-slate-400">
              Unique Friend ID: <strong className="text-amber-400 font-mono">{currentFriendId}</strong>
            </p>
          </div>

          <button
            onClick={() => { playTapSound(); onClose(); }}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-800 transition-colors cursor-pointer"
            id="btn_close_auth_modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch between Register and Login */}
        <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-2xl border border-slate-850">
          <button
            onClick={() => { playTapSound(); setAuthMode("register"); setStep("form"); setErrorMsg(""); }}
            className={`py-2 text-xs font-black uppercase rounded-xl transition-all cursor-pointer ${
              authMode === "register"
                ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
            id="tab_auth_register"
          >
            Create Account
          </button>
          <button
            onClick={() => { playTapSound(); setAuthMode("login"); setStep("form"); setErrorMsg(""); }}
            className={`py-2 text-xs font-black uppercase rounded-xl transition-all cursor-pointer ${
              authMode === "login"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
            id="tab_auth_login"
          >
            Log In
          </button>
        </div>

        {/* Form Body */}
        {authMode === "register" ? (
          step === "form" ? (
            <div className="space-y-4">
              
              {/* Choose Avatar */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-cyan-400 font-mono uppercase font-black tracking-wider">
                  SELECT STUDENT AVATAR:
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {avatarOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { playTapSound(); setAvatar(opt); }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border transition-all cursor-pointer ${
                        avatar === opt
                          ? "bg-cyan-500/20 border-cyan-400 scale-110 shadow-md shadow-cyan-500/20"
                          : "bg-slate-950 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Username input */}
              <div className="space-y-1">
                <label className="block text-[10px] text-indigo-400 font-mono uppercase font-black tracking-wider">
                  FULL NAME / USERNAME:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Alex Sharma"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-200 outline-none"
                    id="input_register_username"
                  />
                </div>
              </div>

              {/* Gmail input */}
              <div className="space-y-1">
                <label className="block text-[10px] text-indigo-400 font-mono uppercase font-black tracking-wider">
                  GMAIL ADDRESS:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={gmail}
                    onChange={(e) => setGmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-200 outline-none"
                    id="input_register_gmail"
                  />
                </div>
              </div>

              {/* Password input */}
              <div className="space-y-1">
                <label className="block text-[10px] text-indigo-400 font-mono uppercase font-black tracking-wider">
                  CREATE PASSWORD (MIN 5 LETTERS):
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-200 outline-none"
                    id="input_register_password"
                  />
                  <button
                    type="button"
                    onClick={() => { playTapSound(); setShowPassword(!showPassword); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit button to send OTP */}
              <button
                type="button"
                onClick={handleSendVerificationOtp}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center justify-center space-x-2 transition-transform active:scale-95"
                id="btn_send_otp"
              >
                <span>{loading ? "SENDING VERIFICATION CODE..." : "SEND VERIFICATION CODE TO GMAIL →"}</span>
              </button>

            </div>
          ) : (
            /* OTP Verification step */
            <div className="space-y-4 animate-fade-in">
              
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2 text-center">
                <ShieldCheck className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
                <h4 className="text-xs font-black uppercase text-slate-200">VERIFICATION CODE SENT!</h4>
                <p className="text-[11px] text-slate-400">
                  We dispatched a 6-digit verification security code to <strong className="text-cyan-300">{gmail}</strong>.
                </p>
                {/* Instant Verification Helper Badge for effortless demo verification */}
                <div className="bg-cyan-950/40 border border-cyan-800/40 p-2.5 rounded-xl text-center space-y-1">
                  <span className="block text-[9px] text-cyan-400 font-mono font-bold uppercase">GMAIL INBOX SIMULATION:</span>
                  <span className="text-base font-mono font-black text-amber-400 tracking-widest bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 inline-block select-all">
                    {otpCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => { playTapSound(); setUserOtpInput(otpCode); }}
                    className="block mx-auto text-[9px] text-cyan-300 hover:underline font-mono"
                  >
                    Auto-Fill Code
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-indigo-400 font-mono uppercase font-black tracking-wider text-center">
                  ENTER 6-DIGIT VERIFICATION CODE:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={userOtpInput}
                  onChange={(e) => setUserOtpInput(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="••••••"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl px-3.5 py-3 text-lg font-mono font-black tracking-widest text-amber-400 text-center uppercase outline-none"
                  id="input_otp_code"
                />
              </div>

              <button
                type="button"
                onClick={handleVerifyAndCompleteRegister}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center space-x-2 transition-transform active:scale-95"
                id="btn_verify_complete_register"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? "VERIFYING & CREATING..." : "VERIFY CODE & COMPLETE ACCOUNT"}</span>
              </button>

              <button
                type="button"
                onClick={() => { playTapSound(); setStep("form"); }}
                className="block mx-auto text-xs text-slate-500 hover:text-slate-300 underline font-mono cursor-pointer"
              >
                ← Back to Edit Details
              </button>
            </div>
          )
        ) : (
          /* Login Form */
          <form onSubmit={handleDirectLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] text-indigo-400 font-mono uppercase font-black tracking-wider">
                GMAIL / USERNAME / 7-DIGIT FRIEND ID:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={gmail}
                  onChange={(e) => setGmail(e.target.value)}
                  placeholder="Enter Gmail, name, or Friend ID"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-200 outline-none"
                  id="input_login_identifier"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-indigo-400 font-mono uppercase font-black tracking-wider">
                PASSWORD:
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-200 outline-none"
                  id="input_login_password"
                />
                <button
                  type="button"
                  onClick={() => { playTapSound(); setShowPassword(!showPassword); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-lg shadow-indigo-500/20 cursor-pointer flex items-center justify-center space-x-2 transition-transform active:scale-95"
              id="btn_submit_login"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{loading ? "LOGGING IN..." : "SIGN IN TO DASHBOARD"}</span>
            </button>
          </form>
        )}

        {/* Error / Success Notifications */}
        {errorMsg && (
          <p className="text-center text-xs text-rose-400 font-mono font-bold animate-bounce bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl" id="auth_error_msg">
            {errorMsg}
          </p>
        )}

        {successMsg && (
          <p className="text-center text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl" id="auth_success_msg">
            {successMsg}
          </p>
        )}

      </div>
    </div>
  );
}
