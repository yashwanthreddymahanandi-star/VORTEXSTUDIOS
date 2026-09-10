/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Crown, 
  ShieldCheck, 
  Zap, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  Trophy, 
  ArrowRight,
  ShoppingBag,
  History,
  Lock,
  Flame,
  Award,
  BookOpen,
  UserCheck,
  Check
} from "lucide-react";
import { 
  DiamondPackage, 
  SubscriptionPlan, 
  StorePerkItem, 
  PaymentReceipt, 
  UserStats 
} from "../types";
import { GooglePayCheckoutModal } from "./GooglePayCheckoutModal";
import { playTapSound, playCorrectSound, playOopsSound, playDiamondSound } from "../utils/sound";
import confetti from "canvas-confetti";

interface SparkStoreProps {
  userStats: UserStats;
  isVip: boolean;
  onUpdateStats: (newStats: UserStats) => void;
  onSetVip: (vipStatus: boolean) => void;
}

export default function SparkStore({
  userStats,
  isVip,
  onUpdateStats,
  onSetVip
}: SparkStoreProps) {
  const [activeTab, setActiveTab] = useState<"diamonds" | "subscriptions" | "perks" | "receipts">("diamonds");

  const [diamondPacks, setDiamondPacks] = useState<DiamondPackage[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [perkItems, setPerkItems] = useState<StorePerkItem[]>([]);
  
  // Checkout Modal State
  const [checkoutModalData, setCheckoutModalData] = useState<{
    itemType: "diamonds" | "subscription";
    item: any;
  } | null>(null);

  // Purchased Perks Stored in LocalStorage
  const [purchasedPerks, setPurchasedPerks] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("spark_unlocked_perks");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Receipts Stored in LocalStorage
  const [receipts, setReceipts] = useState<PaymentReceipt[]>(() => {
    try {
      const stored = localStorage.getItem("spark_payment_receipts");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Load store inventory from backend
  useEffect(() => {
    fetch("/api/store/inventory")
      .then(res => res.json())
      .then(data => {
        if (data.diamondPackages) setDiamondPacks(data.diamondPackages);
        if (data.subscriptionPlans) setSubscriptionPlans(data.subscriptionPlans);
        if (data.storePerks) setPerkItems(data.storePerks);
      })
      .catch(err => {
        console.warn("Could not load inventory from backend, using fallback data", err);
      });
  }, []);

  const currentDiamonds = userStats.diamonds ?? 100;

  const handleOpenGooglePay = (type: "diamonds" | "subscription", item: any) => {
    playTapSound();
    setCheckoutModalData({ itemType: type, item });
  };

  const handlePaymentSuccess = (receipt: PaymentReceipt) => {
    playDiamondSound();
    
    // 1. Update receipts history
    const updatedReceipts = [receipt, ...receipts];
    setReceipts(updatedReceipts);
    localStorage.setItem("spark_payment_receipts", JSON.stringify(updatedReceipts));

    // 2. Update User Stats & Diamonds
    const updatedStats: UserStats = {
      ...userStats,
      diamonds: (userStats.diamonds ?? 100) + (receipt.diamondsAdded || 0)
    };

    if (receipt.subscriptionGranted) {
      updatedStats.subscriptionPlan = receipt.subscriptionGranted as any;
      onSetVip(true);
      localStorage.setItem("solvemate_vip_status", "true");
    }

    onUpdateStats(updatedStats);
    localStorage.setItem("ramanujan_user_stats", JSON.stringify(updatedStats));

    setSuccessToast(`🎉 Successfully processed via Google Pay! ${receipt.itemName} delivered.`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleSpendDiamondsOnPerk = (perk: StorePerkItem) => {
    playTapSound();

    if (currentDiamonds < perk.diamondCost) {
      playOopsSound();
      alert(`⚠️ Not enough diamonds! You have 💎 ${currentDiamonds}, but "${perk.name}" requires 💎 ${perk.diamondCost}.\n\nGet more diamonds instantly with Google Pay!`);
      setActiveTab("diamonds");
      return;
    }

    // Deduct diamonds
    const updatedDiamonds = currentDiamonds - perk.diamondCost;
    const updatedStats: UserStats = {
      ...userStats,
      diamonds: updatedDiamonds
    };

    onUpdateStats(updatedStats);
    localStorage.setItem("ramanujan_user_stats", JSON.stringify(updatedStats));

    // Register perk
    const updated = [...purchasedPerks, perk.id];
    setPurchasedPerks(updated);
    localStorage.setItem("spark_unlocked_perks", JSON.stringify(updated));

    // If it's a 24h VIP ticket, unlock VIP
    if (perk.id === "perk_vip_24h") {
      onSetVip(true);
      localStorage.setItem("solvemate_vip_status", "true");
    }

    playCorrectSound();
    try {
      confetti({ particleCount: 60, spread: 60 });
    } catch (e) {
      // Ignore
    }

    setSuccessToast(`💎 Unlocked "${perk.name}" for ${perk.diamondCost} Diamonds!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-16" id="spark_store_container">
      
      {/* Top Banner: Diamond Bank & VIP Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />

        {/* Left Side: Store Identity */}
        <div className="space-y-2 text-center md:text-left z-10">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/15 via-cyan-500/15 to-indigo-500/15 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" style={{ animationDuration: "4s" }} />
            <span>GOOGLE PAY POWERED STORE &amp; DIAMONDS</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight uppercase bg-gradient-to-r from-slate-100 via-cyan-200 to-amber-300 bg-clip-text text-transparent">
            Spark Vault &amp; Subscriptions
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl font-sans">
            Acquire diamonds with official Google Pay checkout to unlock powerups, quiz lifelines, and chess hints. Or subscribe to VIP for unlimited academic intelligence!
          </p>

          <div className="pt-1">
            <span className="text-[11px] font-mono text-slate-400">
              Application developed with pride by <strong className="text-amber-400 font-bold">Yashwanth Reddy Mahanandi</strong>
            </span>
          </div>
        </div>

        {/* Right Side: Diamond Counter & Membership Pill */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 z-10 w-full md:w-auto shrink-0">
          
          {/* Diamonds Balance Pill */}
          <div className="bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-2xl shadow-inner animate-pulse">
                💎
              </div>
              <div>
                <span className="block text-[10px] font-mono tracking-widest text-cyan-300 uppercase font-bold">
                  Your Diamond Balance
                </span>
                <span className="text-2xl font-black font-mono text-slate-100 flex items-center gap-1.5">
                  {currentDiamonds.toLocaleString()}
                  <span className="text-xs text-cyan-400 font-sans font-normal">Gems</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("diamonds")}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider font-mono shadow-md shadow-cyan-500/20 cursor-pointer shrink-0 transition-transform active:scale-95"
              id="btn_store_top_add_diamonds"
            >
              + Top Up
            </button>
          </div>

          {/* VIP Status Pill */}
          <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <Crown className={`w-4 h-4 ${isVip ? "text-amber-400 fill-amber-400 animate-bounce" : "text-slate-500"}`} />
              <span className="text-slate-300">
                Plan: <strong className={isVip ? "text-amber-400 uppercase font-black" : "text-slate-400"}>{isVip ? (userStats.subscriptionPlan || "VIP SOLVEMATE") : "Free Scholar"}</strong>
              </span>
            </div>

            {!isVip && (
              <button
                onClick={() => setActiveTab("subscriptions")}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold uppercase underline cursor-pointer"
              >
                Upgrade VIP →
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Success Toast Notification */}
      {successToast && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-5 py-3.5 rounded-2xl shadow-xl flex items-center justify-between text-xs sm:text-sm font-mono animate-fade-in">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button 
            onClick={() => setSuccessToast(null)} 
            className="text-emerald-400 hover:text-white text-xs cursor-pointer ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Store Navigation Tabs */}
      <div className="flex bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl max-w-2xl mx-auto shadow-inner overflow-x-auto">
        
        <button
          onClick={() => { playTapSound(); setActiveTab("diamonds"); }}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0 font-display ${
            activeTab === "diamonds"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
          id="tab_store_diamonds"
        >
          <span>💎</span>
          <span>BUY DIAMONDS</span>
        </button>

        <button
          onClick={() => { playTapSound(); setActiveTab("subscriptions"); }}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0 font-display ${
            activeTab === "subscriptions"
              ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-lg shadow-amber-500/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
          id="tab_store_subscriptions"
        >
          <Crown className="w-3.5 h-3.5 text-slate-950" />
          <span>VIP SUBSCRIPTIONS</span>
        </button>

        <button
          onClick={() => { playTapSound(); setActiveTab("perks"); }}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0 font-display ${
            activeTab === "perks"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-lg shadow-purple-500/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
          id="tab_store_perks"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-purple-300" />
          <span>SPEND DIAMONDS</span>
        </button>

        <button
          onClick={() => { playTapSound(); setActiveTab("receipts"); }}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0 font-display ${
            activeTab === "receipts"
              ? "bg-slate-800 text-slate-100 font-black shadow"
              : "text-slate-400 hover:text-slate-200"
          }`}
          id="tab_store_receipts"
        >
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span>RECEIPTS ({receipts.length})</span>
        </button>

      </div>

      {/* TAB 1: BUY DIAMONDS (PAY WITH GOOGLE PAY) */}
      {activeTab === "diamonds" && (
        <div className="space-y-6 animate-fade-in" id="store_diamonds_section">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black font-display text-slate-100 uppercase tracking-tight">
              Official Diamond Bundles — Instant Delivery
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Secure checkout integrated directly with Google Pay (UPI, Cards &amp; Net Banking)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {diamondPacks.map((pack) => {
              const total = pack.diamonds + pack.bonusDiamonds;

              return (
                <div
                  key={pack.id}
                  className={`bg-slate-900/80 border rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    pack.popular
                      ? "border-cyan-500/60 shadow-lg shadow-cyan-500/10 bg-gradient-to-b from-slate-900 to-slate-900/90"
                      : "border-slate-800 hover:border-slate-750"
                  }`}
                  id={`diamond_pack_${pack.id}`}
                >
                  {pack.tag && (
                    <div className="absolute top-3.5 right-3.5">
                      <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                        pack.popular 
                          ? "bg-cyan-500 text-slate-950 shadow" 
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}>
                        {pack.tag}
                      </span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-3xl shadow-inner">
                      {pack.icon}
                    </div>

                    <div>
                      <h4 className="text-lg font-black font-display text-slate-100 uppercase tracking-tight">
                        {pack.name}
                      </h4>
                      <div className="flex items-baseline space-x-2 pt-1">
                        <span className="text-2xl font-black font-mono text-cyan-300">
                          {pack.diamonds.toLocaleString()} 💎
                        </span>
                        {pack.bonusDiamonds > 0 && (
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            +{pack.bonusDiamonds} Bonus
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Total {total.toLocaleString()} Diamonds
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Instant Google Pay verification</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                        <span>No expiration, permanent balance</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono pb-1">
                      <span className="text-slate-400">Price:</span>
                      <span className="text-lg font-black text-emerald-400 font-mono">
                        ₹{pack.priceInr} <span className="text-[10px] text-slate-500 font-normal">(~${pack.priceUsd})</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenGooglePay("diamonds", pack)}
                      className="w-full py-3 bg-black hover:bg-neutral-900 border border-neutral-700 text-white rounded-xl font-display font-bold text-xs tracking-wide flex items-center justify-center space-x-1.5 shadow-lg cursor-pointer transition-all hover:scale-[1.02] active:scale-98"
                      id={`btn_buy_${pack.id}`}
                    >
                      <span className="text-[10px] uppercase font-mono text-neutral-400">Buy with</span>
                      <span className="text-blue-400 font-black">G</span>
                      <span className="text-slate-100 font-bold">Pay</span>
                      <span className="text-emerald-400 font-mono font-bold ml-1">₹{pack.priceInr}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: VIP SUBSCRIPTIONS (PAY WITH GOOGLE PAY) */}
      {activeTab === "subscriptions" && (
        <div className="space-y-6 animate-fade-in" id="store_subscriptions_section">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black font-display text-slate-100 uppercase tracking-tight">
              Spark VIP Membership Passes
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Unleash complete academic power across all 12 grades and subjects with Google Pay
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-slate-900/90 border rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-xl ${
                  plan.highlight
                    ? "border-amber-500/70 shadow-amber-500/10 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20"
                    : "border-slate-800 hover:border-slate-750"
                }`}
                id={`sub_plan_${plan.id}`}
              >
                {plan.tag && (
                  <div className="absolute top-4 right-4">
                    <span className="text-[9px] font-mono font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                      {plan.tag}
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Crown className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">
                      {plan.billingPeriod} Pass
                    </span>
                    <h4 className="text-xl font-black font-display text-slate-100 uppercase tracking-tight">
                      {plan.name}
                    </h4>
                  </div>

                  {/* Pricing Display */}
                  <div className="pt-2 pb-1 border-b border-slate-800">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-black font-mono text-emerald-400">
                        ₹{plan.priceInr}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        / {plan.billingPeriod.toLowerCase()}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      (~${plan.priceUsd} USD)
                    </span>
                  </div>

                  {/* Diamond Perks */}
                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-cyan-500/20 text-xs font-mono text-cyan-300 flex items-center justify-between">
                    <span>💎 Instant Diamonds:</span>
                    <span className="font-bold">+{plan.bonusDiamonds.toLocaleString()}</span>
                  </div>

                  {/* Features Checklist */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                      What's Included:
                    </span>
                    <ul className="text-xs text-slate-300 space-y-2">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => handleOpenGooglePay("subscription", plan)}
                    className={`w-full py-3.5 rounded-2xl font-display font-extrabold text-xs tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-xl transition-all hover:scale-[1.02] active:scale-98 ${
                      plan.highlight
                        ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 shadow-amber-500/20"
                        : "bg-black hover:bg-neutral-900 border border-neutral-700 text-white"
                    }`}
                    id={`btn_subscribe_${plan.id}`}
                  >
                    <span className="text-[10px] uppercase font-mono tracking-wider">Subscribe with</span>
                    <span className="text-blue-400 font-black">G</span>
                    <span className="font-bold">Pay</span>
                    <span className="font-mono font-bold ml-1">₹{plan.priceInr}</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SPEND DIAMONDS (MARKETPLACE) */}
      {activeTab === "perks" && (
        <div className="space-y-6 animate-fade-in" id="store_perks_section">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black font-display text-slate-100 uppercase tracking-tight">
              Diamond Perks &amp; Boosters Marketplace
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Use your earned or purchased diamonds to acquire tactical lifelines, study tokens, and themes!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {perkItems.map((perk) => {
              const isUnlocked = purchasedPerks.includes(perk.id);

              return (
                <div
                  key={perk.id}
                  className={`bg-slate-900/80 border rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-lg ${
                    isUnlocked ? "border-emerald-500/40 bg-emerald-950/10" : "border-slate-800"
                  }`}
                  id={`perk_item_${perk.id}`}
                >
                  {perk.tag && (
                    <div className="absolute top-3.5 right-3.5">
                      <span className="text-[9px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded uppercase tracking-wider">
                        {perk.tag}
                      </span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-3xl shadow-inner">
                      {perk.icon}
                    </div>

                    <div>
                      <h4 className="text-base font-black font-display text-slate-100 uppercase tracking-tight">
                        {perk.name}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1">
                        {perk.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Cost:</span>
                      <span className="text-base font-black text-cyan-300 flex items-center gap-1 font-mono">
                        💎 {perk.diamondCost} Diamonds
                      </span>
                    </div>

                    <button
                      onClick={() => handleSpendDiamondsOnPerk(perk)}
                      className={`w-full py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
                        isUnlocked
                          ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/40"
                          : currentDiamonds >= perk.diamondCost
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-750"
                      }`}
                      id={`btn_perk_${perk.id}`}
                    >
                      {isUnlocked ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>UNLOCKED &amp; READY (GET MORE)</span>
                        </>
                      ) : currentDiamonds >= perk.diamondCost ? (
                        <>
                          <span>GET FOR 💎 {perk.diamondCost}</span>
                        </>
                      ) : (
                        <>
                          <span>NEED 💎 {perk.diamondCost - currentDiamonds} MORE</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: RECEIPTS & GOOGLE PAY HISTORY */}
      {activeTab === "receipts" && (
        <div className="space-y-6 animate-fade-in" id="store_receipts_section">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black font-display text-slate-100 uppercase tracking-tight">
              Google Pay Transaction Ledger
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Verifiable proof of purchases, order references, and diamond credits
            </p>
          </div>

          {receipts.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-2xl">
                📜
              </div>
              <h4 className="text-base font-bold text-slate-200">No Google Pay transactions yet</h4>
              <p className="text-xs text-slate-400 font-mono">
                Purchase any Diamond pack or VIP Pass with Google Pay to record official transaction receipts here!
              </p>
              <button
                onClick={() => setActiveTab("diamonds")}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider font-mono cursor-pointer"
              >
                Browse Diamond Vault →
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {receipts.map((rec) => (
                <div
                  key={rec.transactionId}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono shadow-md"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">
                        ✓ GOOGLE PAY VERIFIED
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        {new Date(rec.timestamp).toLocaleDateString()} {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-100 uppercase tracking-tight">
                      {rec.itemName}
                    </h4>

                    <div className="text-[10px] text-slate-400 space-x-3">
                      <span>Ref: <strong className="text-amber-400">{rec.transactionId}</strong></span>
                      <span>Order: <strong className="text-slate-200">{rec.orderId}</strong></span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    <div className="text-base font-black text-emerald-400">
                      ₹{rec.amountInr} <span className="text-[10px] text-slate-400 font-normal">(~${rec.amountUsd})</span>
                    </div>
                    {rec.diamondsAdded && rec.diamondsAdded > 0 && (
                      <div className="text-[11px] text-cyan-300 font-bold">
                        +{rec.diamondsAdded.toLocaleString()} 💎 Diamonds
                      </div>
                    )}
                    {rec.subscriptionGranted && (
                      <div className="text-[11px] text-amber-300 font-bold uppercase">
                        👑 VIP Pass Granted
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center pt-4">
            <p className="text-[11px] text-slate-500 font-mono">
              All transactions encrypted via 256-Bit SSL • Developed by <strong className="text-amber-400">Yashwanth Reddy Mahanandi</strong>
            </p>
          </div>
        </div>
      )}

      {/* Google Pay Checkout Modal */}
      {checkoutModalData && (
        <GooglePayCheckoutModal
          itemType={checkoutModalData.itemType}
          item={checkoutModalData.item}
          onClose={() => setCheckoutModalData(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

    </div>
  );
}
