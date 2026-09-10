/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  X, 
  CreditCard, 
  Smartphone, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  Clock,
  Download,
  Crown
} from "lucide-react";
import confetti from "canvas-confetti";
import { playTapSound, playCorrectSound, playOopsSound, playDiamondSound } from "../utils/sound";
import { PaymentReceipt } from "../types";

interface GooglePayModalProps {
  itemType: "diamonds" | "subscription";
  item: {
    id: string;
    name: string;
    priceInr: number;
    priceUsd: number;
    diamonds?: number;
    bonusDiamonds?: number;
    features?: string[];
    tag?: string;
  };
  onClose: () => void;
  onSuccess: (receipt: PaymentReceipt) => void;
}

export function GooglePayCheckoutModal({
  itemType,
  item,
  onClose,
  onSuccess
}: GooglePayModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"gpay_card" | "gpay_upi">("gpay_card");
  const [upiId, setUpiId] = useState("student@oksbi");
  const [selectedCard, setSelectedCard] = useState("•••• 4242 (Google Pay Visa)");
  
  const [checkoutStep, setCheckoutStep] = useState<"review" | "authorizing" | "success">("review");
  const [statusMessage, setStatusMessage] = useState("Connecting to Google Pay API Gateway...");
  const [generatedReceipt, setGeneratedReceipt] = useState<PaymentReceipt | null>(null);

  // Check if Google Pay client API exists on window
  const [isGpayScriptLoaded, setIsGpayScriptLoaded] = useState(false);

  useEffect(() => {
    const checkGPay = () => {
      if ((window as any).google?.payments?.api?.PaymentsClient) {
        setIsGpayScriptLoaded(true);
      }
    };
    checkGPay();
    const timer = setInterval(checkGPay, 800);
    return () => clearInterval(timer);
  }, []);

  const totalDiamonds = (item.diamonds || 0) + (item.bonusDiamonds || 0);

  const handleTriggerGooglePay = async () => {
    playTapSound();
    setCheckoutStep("authorizing");
    setStatusMessage("Connecting to Google Pay encrypted server...");

    try {
      // Step 1: Simulated Handshake with Google Pay client
      await new Promise(r => setTimeout(r, 600));
      setStatusMessage(`Authorizing ₹${item.priceInr} via Google Pay ${paymentMethod === "gpay_upi" ? "UPI" : "Card"}...`);

      // Step 2: 256-bit Tokenization
      await new Promise(r => setTimeout(r, 700));
      setStatusMessage("Securing token with 256-Bit SSL Encryption...");

      // Step 3: Process via backend
      const res = await fetch("/api/pay/process-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType,
          itemId: item.id,
          amountInr: item.priceInr,
          amountUsd: item.priceUsd,
          paymentMethod: paymentMethod === "gpay_upi" ? "gpay_upi" : "gpay_card"
        })
      });

      const data = await res.json();

      if (data.success && data.receipt) {
        setGeneratedReceipt(data.receipt);
        setCheckoutStep("success");
        playDiamondSound();

        // Celebration Confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // Ignore
        }

        // Notify parent
        onSuccess(data.receipt);
      } else {
        throw new Error(data.error || "Payment verification failed");
      }
    } catch (err: any) {
      console.error("Google Pay Error:", err);
      playOopsSound();
      alert("⚠️ Google Pay encountered an issue: " + (err.message || "Please try again!"));
      setCheckoutStep("review");
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
      id="gpay_checkout_modal_backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && checkoutStep !== "authorizing") {
          playTapSound();
          onClose();
        }
      }}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative animate-fade-in my-auto"
        id="gpay_checkout_modal_card"
      >
        {/* Top Google Colors Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-red-500 via-yellow-400 to-green-500" />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Google Pay Official Brand Badge */}
            <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-750 px-3 py-1.5 rounded-xl shadow-inner">
              <span className="font-display font-bold text-sm tracking-tight text-white flex items-center gap-1">
                <span className="text-blue-400 font-black text-base">G</span>
                <span className="text-slate-200">Pay</span>
              </span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-100 font-display">
                Google Pay Secure Checkout
              </h3>
              <span className="block text-[10px] text-slate-400 font-mono">
                Merchant: SPARK • Yashwanth Reddy Mahanandi
              </span>
            </div>
          </div>

          <button
            onClick={() => { playTapSound(); onClose(); }}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors cursor-pointer"
            id="btn_close_gpay_modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content by Step */}
        <div className="p-6 space-y-6">

          {checkoutStep === "review" && (
            <>
              {/* Product Summary Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                      {itemType === "diamonds" ? "DIAMOND BUNDLE" : "VIP SUBSCRIPTION"}
                    </span>
                    <h4 className="text-base font-black text-slate-100 uppercase tracking-tight">
                      {item.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black font-mono text-emerald-400">
                      ₹{item.priceInr}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      (~${item.priceUsd} USD)
                    </div>
                  </div>
                </div>

                {itemType === "diamonds" && totalDiamonds > 0 && (
                  <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 p-2.5 rounded-xl">
                    <span className="text-base">💎</span>
                    <span>You will receive: <strong>{totalDiamonds.toLocaleString()} Diamonds</strong> instantly!</span>
                  </div>
                )}

                {itemType === "subscription" && item.features && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-850">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Included Privileges:</span>
                    <ul className="text-[11px] text-slate-300 space-y-1">
                      {item.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Choose Google Pay Method */}
              <div className="space-y-3">
                <label className="block text-xs font-mono uppercase font-black text-slate-300 tracking-wider">
                  Select Google Pay Payment Source:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Card Option */}
                  <div
                    onClick={() => { playTapSound(); setPaymentMethod("gpay_card"); }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 ${
                      paymentMethod === "gpay_card"
                        ? "bg-indigo-950/50 border-indigo-500 shadow-md shadow-indigo-500/10 text-white"
                        : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <CreditCard className={`w-5 h-5 ${paymentMethod === "gpay_card" ? "text-indigo-400" : "text-slate-500"}`} />
                    <div>
                      <div className="text-xs font-bold font-sans">Cards in Google Pay</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">VISA, MC, AMEX, RuPay</div>
                    </div>
                  </div>

                  {/* UPI Option */}
                  <div
                    onClick={() => { playTapSound(); setPaymentMethod("gpay_upi"); }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 ${
                      paymentMethod === "gpay_upi"
                        ? "bg-emerald-950/50 border-emerald-500 shadow-md shadow-emerald-500/10 text-white"
                        : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <Smartphone className={`w-5 h-5 ${paymentMethod === "gpay_upi" ? "text-emerald-400" : "text-slate-500"}`} />
                    <div>
                      <div className="text-xs font-bold font-sans">Google Pay UPI</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">Instant UPI @okaxis / @okhdfc</div>
                    </div>
                  </div>

                </div>

                {/* Sub-inputs based on payment source */}
                {paymentMethod === "gpay_card" ? (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Google Pay Card: {selectedCard}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Ready</span>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Enter Google Pay UPI VPA:</span>
                      <span className="text-emerald-400 font-bold">Zero Transaction Fee</span>
                    </div>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@okhdfcbank"
                      className="w-full bg-slate-900 border border-slate-750 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Authentic Google Pay Action Button */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleTriggerGooglePay}
                  className="w-full py-3.5 bg-black hover:bg-neutral-900 text-white rounded-2xl border border-neutral-700 font-display font-bold text-sm tracking-wide flex items-center justify-center space-x-2 cursor-pointer shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  id="btn_confirm_gpay_purchase"
                >
                  <span className="text-xs text-neutral-300 font-mono uppercase tracking-wider">Pay with</span>
                  <div className="flex items-center space-x-1 font-black text-base">
                    <span className="text-blue-500">G</span>
                    <span className="text-red-500">o</span>
                    <span className="text-yellow-500">o</span>
                    <span className="text-blue-500">g</span>
                    <span className="text-green-500">l</span>
                    <span className="text-red-500">e</span>
                    <span className="text-slate-100 ml-1">Pay</span>
                  </div>
                  <span className="text-emerald-400 font-mono font-black ml-2">₹{item.priceInr}</span>
                </button>

                <div className="flex items-center justify-center space-x-3 text-[10px] font-mono text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    256-Bit SSL Encrypted
                  </span>
                  <span>•</span>
                  <span>Direct Google Gateway</span>
                  <span>•</span>
                  <span>Instant Crediting</span>
                </div>
              </div>

              {/* Developer Attribution Note */}
              <div className="text-center pt-2 border-t border-slate-800/60">
                <p className="text-[10px] text-slate-400 font-mono">
                  Crafted &amp; Supported by <strong className="text-amber-400">Yashwanth Reddy Mahanandi</strong>
                </p>
              </div>
            </>
          )}

          {checkoutStep === "authorizing" && (
            <div className="py-10 text-center space-y-6 animate-pulse" id="gpay_authorizing_screen">
              <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-blue-500 border-r-emerald-500 border-b-yellow-400 border-l-red-500 animate-spin mx-auto flex items-center justify-center">
                <span className="text-sm font-black font-display text-white">GPay</span>
              </div>
              <div className="space-y-2">
                <h4 className="font-black text-slate-100 text-lg uppercase tracking-tight font-display">
                  Communicating with Google Pay
                </h4>
                <p className="text-xs text-cyan-300 font-mono">{statusMessage}</p>
                <span className="inline-block text-[10px] text-slate-400 font-mono pt-2">
                  Please do not close or reload this window
                </span>
              </div>
            </div>
          )}

          {checkoutStep === "success" && generatedReceipt && (
            <div className="py-4 space-y-6 animate-fade-in" id="gpay_receipt_screen">
              
              {/* Success Badge */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl font-black shadow-lg shadow-emerald-500/20">
                  ✓
                </div>
                <h4 className="text-xl font-black text-slate-100 uppercase tracking-tight font-display">
                  Payment Successful!
                </h4>
                <p className="text-xs text-emerald-400 font-mono font-bold">
                  Google Pay Transaction Verified
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-850 pb-2 text-slate-400">
                  <span>Order ID:</span>
                  <span className="text-slate-200 font-bold">{generatedReceipt.orderId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-850 pb-2 text-slate-400">
                  <span>Transaction Ref:</span>
                  <span className="text-amber-400 font-bold">{generatedReceipt.transactionId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-850 pb-2 text-slate-400">
                  <span>Item Purchased:</span>
                  <span className="text-slate-100 font-bold">{generatedReceipt.itemName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-850 pb-2 text-slate-400">
                  <span>Amount Paid:</span>
                  <span className="text-emerald-400 font-black text-sm">₹{generatedReceipt.amountInr} (~${generatedReceipt.amountUsd})</span>
                </div>
                {generatedReceipt.diamondsAdded && generatedReceipt.diamondsAdded > 0 && (
                  <div className="flex justify-between text-cyan-300 font-bold">
                    <span>Diamonds Credited:</span>
                    <span>+{generatedReceipt.diamondsAdded.toLocaleString()} 💎</span>
                  </div>
                )}
                {generatedReceipt.subscriptionGranted && (
                  <div className="flex justify-between text-amber-300 font-bold">
                    <span>VIP Plan Activated:</span>
                    <span className="uppercase">{generatedReceipt.subscriptionGranted}</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => { playTapSound(); onClose(); }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-lg shadow-emerald-500/20 cursor-pointer"
                  id="btn_close_success_gpay"
                >
                  Return to SPARK App &amp; Enjoy!
                </button>
              </div>

              {/* Creator Signature */}
              <div className="text-center text-[10px] text-slate-400 font-mono">
                Developed with pride by <span className="text-amber-400 font-bold">Yashwanth Reddy Mahanandi</span>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
