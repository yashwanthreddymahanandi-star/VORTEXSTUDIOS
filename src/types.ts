/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GradeBand = "1-6" | "7-10" | "11-12";

export type Subject = "Telugu" | "English" | "Maths" | "Physics" | "Chemistry" | "Biology" | "Social" | "Hindi";

export interface Question {
  id: string;
  gradeBand: GradeBand;
  subject: Subject;
  level: number; // 1, 2, or 3 (toughness increases with level)
  question: string;
  options: string[];
  correctOptionIndex: number; // 0-3
  explanation: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface QuizSessionState {
  currentQuestionIndex: number;
  score: number;
  answers: { [questionId: string]: number }; // questionId -> selectedIndex
  timeRemaining: number; // seconds (max 30)
  isCompleted: boolean;
  streak: number;
  pointsEarned: number;
}

export interface UserStats {
  username: string;
  friendId?: string; // Unique 7-digit ID (e.g. "7482915")
  points: number;
  diamonds?: number; // In-app premium currency
  subscriptionPlan?: "free" | "vip_monthly" | "scholar_annual" | "lifetime";
  subscriptionExpiresAt?: string;
  totalGames: number;
  totalCorrect: number;
  totalQuestions: number;
  highestStreak: number;
  gradesPlayed: { [key in GradeBand]: number };
  unlockedLevels: { [subject in Subject]?: number }; // maps subject -> highest unlocked level (1, 2, 3)
}

export interface FriendUser {
  id: string; // 7-digit ID (e.g. "7482915")
  username: string;
  avatar: string;
  subject: Subject;
  points: number;
  status: "online" | "in_room" | "offline";
  isCustom?: boolean;
}

export interface FileAttachment {
  fileName: string;
  fileType: "image" | "audio" | "document" | "voice" | "ppt" | "word";
  fileUrl: string;
  fileSize?: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  toUserId: string;
  timestamp: string;
  status: "pending" | "accepted" | "rejected";
}

export interface FriendChatMessage {
  id: string;
  senderId: string; // "user" or friend 7-digit ID
  senderName: string;
  text: string;
  timestamp: string;
  isRoomInvite?: boolean;
  roomCode?: string;
  attachment?: FileAttachment;
}

export interface QuizRoomMatch {
  roomCode: string; // e.g. "ROOM-748291"
  hostFriendId: string;
  opponentFriendId: string;
  opponentName: string;
  opponentAvatar: string;
  subject: Subject;
  level: number;
  status: "waiting" | "active" | "completed";
}

export interface DiamondPackage {
  id: string;
  name: string;
  diamonds: number;
  bonusDiamonds: number;
  priceInr: number;
  priceUsd: number;
  icon: string;
  tag?: string;
  popular?: boolean;
}

export interface SubscriptionPlan {
  id: "vip_monthly" | "scholar_annual" | "lifetime";
  name: string;
  billingPeriod: string;
  priceInr: number;
  priceUsd: number;
  bonusDiamonds: number;
  dailyDiamonds: number;
  tag?: string;
  features: string[];
  highlight?: boolean;
}

export interface StorePerkItem {
  id: string;
  name: string;
  description: string;
  diamondCost: number;
  icon: string;
  category: "powerup" | "theme" | "avatar" | "token";
  tag?: string;
}

export interface PaymentReceipt {
  transactionId: string;
  orderId: string;
  itemType: "diamonds" | "subscription";
  itemId: string;
  itemName: string;
  amountInr: number;
  amountUsd: number;
  diamondsAdded?: number;
  subscriptionGranted?: string;
  paymentMethod: "google_pay" | "gpay_upi" | "gpay_card";
  timestamp: string;
  status: "success" | "pending" | "failed";
}

