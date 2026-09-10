/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Zap } from "lucide-react";

interface SparkLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function SparkLogo({ size = "md", showText = true, className = "" }: SparkLogoProps) {
  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-amber-400 p-0.5 shadow-lg shadow-cyan-500/20`}>
        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Zap className={`${iconSizes[size]} text-amber-400 fill-amber-400/30 animate-pulse`} />
          <Sparkles className="absolute top-1 right-1 w-2.5 h-2.5 text-cyan-300 animate-spin" style={{ animationDuration: "4s" }} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-display font-black text-lg tracking-wider bg-gradient-to-r from-cyan-300 via-indigo-200 to-amber-300 bg-clip-text text-transparent uppercase">
            SPARK
          </span>
          <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase -mt-1">
            Educational Friend
          </span>
        </div>
      )}
    </div>
  );
}
