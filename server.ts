import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json());

// Lazy-loaded Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Simulated offline replies from SPARK AI
const OFFLINE_PUZZLES = [
  {
    title: "The Missing Number Puzzle",
    question: "What number should replace the question mark in the sequence: 1, 2, 4, 7, 11, 16, ?",
    hint: "Look at the differences between consecutive numbers. First difference is +1, then +2, then +3...",
    solution: "The difference increases by 1 each step. 16 + 6 = 22! The missing number is 22."
  },
  {
    title: "The Half-Full Bacteria Puzzle",
    question: "A type of bacteria doubles in number every minute. It takes 60 minutes for a bottle to be completely full. At what minute was the bottle half-full?",
    hint: "Think backwards! If it doubles every minute, what was it like just one minute before it became full?",
    solution: "At the 59th minute, the bottle was half-full. In the next minute (the 60th), it doubled to become completely full!"
  },
  {
    title: "The Bookworm Riddle",
    question: "If a digital clock reads 11:11, all digits are identical. How many times a day does a digital 12-hour clock show all identical digits?",
    hint: "List the times: 1:11, 2:22, ... wait, what about double-digit hours?",
    solution: "There are exactly 12 times in a 24-hour day (6 times in each 12-hour cycle): 1:11, 2:22, 3:33, 4:44, 5:55, and 11:11."
  }
];

function getSimulatedOfflineReply(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  
  if (msg.includes("who made you") || msg.includes("who created you") || msg.includes("who programmed you") || msg.includes("creator") || msg.includes("developer") || msg.includes("yashwanth")) {
    return `✨ **SPARK AI THE EDUCATIONAL ASSISTANT** ✨
    
MAHANANDI YASHWANTH REDDY made me! He is the brilliant creator behind this SPARK Educational application. 🧠✨`;
  }

  if (msg.includes("time") || msg.includes("date") || msg.includes("today") || msg.includes("clock")) {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: "Asia/Kolkata" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', timeZone: "Asia/Kolkata" });
    return `✨ **[OFFLINE MODE] SPARK'S COSMIC CLOCK** ✨

The current correct date and time in India (IST) is:
📅 **${dateStr}**
⏰ **${timeStr} (Indian Standard Time)**

Even in offline mode, I can calculate the celestial equations! How may I assist you with your academic goals today?`;
  }

  if (msg.includes("puzzle") || msg.includes("riddle") || msg.includes("game") || msg.includes("problem")) {
    const puzzle = OFFLINE_PUZZLES[Math.floor(Math.random() * OFFLINE_PUZZLES.length)];
    return `✨ **[OFFLINE MODE] SPARK'S MYSTERY PUZZLE** ✨
    
Hello my student friend! Since I am currently running offline, let me share one of my favorite mental puzzles with you:

**${puzzle.title}**
${puzzle.question}

💡 *Need a hint?* ${puzzle.hint}

*Reply to me with your guess, or ask for the 'solution'!*
    
— *SPARK AI*`;
  }

  if (msg.includes("solution") || msg.includes("answer") || msg.includes("solve")) {
    const puzzle = OFFLINE_PUZZLES[0]; // default solution
    return `✨ **[OFFLINE MODE] THE SOLUTION** ✨

Ah! You want to discover the secrets of the numbers! 

Here is the answer to our pattern puzzle:
${puzzle.solution}

Mathematics and logic form an infinite tapestry of beautiful threads. Try asking me for another **puzzle** to test your logical powers!
    
— *SPARK AI*`;
  }

  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("spark")) {
    return `✨ **[OFFLINE MODE] SALUTATIONS, MY STUDENT FRIEND!** ✨

I am **SPARK AI**, your Educational Assistant! I am here to companion you in your academic adventure!

Since I am operating in offline mode right now, we can play with custom number patterns and riddles. 

Tell me:
1. Would you like a **puzzle** to solve?
2. Or are you ready to score high in the **Grade Level Quizzes**? 

Tell me what you think!
    
— *SPARK AI*`;
  }

  if (msg.includes("math") || msg.includes("formula") || msg.includes("number")) {
    return `✨ **[OFFLINE MODE] THE BEAUTY OF NUMBERS** ✨

Did you know? Mathematics is the universal language of science and nature!

Let's think about a beautiful number: **1729**. It is the smallest number expressible as the sum of two cubes in two different ways:
$1^3 + 12^3 = 1729$
$9^3 + 10^3 = 1729$

Is there any mathematical equation or subject you want to talk about? I can guide you offline!
    
— *SPARK AI*`;
  }

  return `✨ **[OFFLINE MODE] SPARK AI AT YOUR SERVICE** ✨

Greetings! I received your message: "*${userMessage}*"

Even in offline mode, I am contemplating the magic of mathematics and science. 
* Try typing **"puzzle"** to get a challenging riddle!
* Try typing **"math"** to learn about taxicab numbers!
* Or use the main screen to test your knowledge with our 30-second quiz timers!

Let's solve puzzles together!
    
— *SPARK AI*`;
}

// Chat API Endpoint
app.post("/api/chat", async (req, res) => {
  const { messages, subject, grade, chapter } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages array" });
  }

  const userMessage = messages[messages.length - 1]?.content || "";

  try {
    const ai = getGeminiClient();
    
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: "Asia/Kolkata" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', timeZone: "Asia/Kolkata" });

    // Custom System Instructions for each separate Subject AI!
    let systemInstruction = "";

    if (subject) {
      if (subject === "Telugu") {
        systemInstruction = 
          `You are 'TELUGU BHASHA KOVIDUDU AI', a brilliant language and literature tutor. ` +
          `You are an expert in the Andhra Pradesh & Telangana State Syllabus for Grade ${grade}. ` +
          `The student is currently studying the chapter: '${chapter || "General Introduction"}'.\n` +
          `Your response style: Speak and write in beautifully grammatically correct, polite Telugu script. ` +
          `You love to explain Telugu poems (పద్యాల భావాలు), Telugu grammar (తెలుగు వ్యాకరణం - సంధులు, సమాసాలు), idioms (జాతీయాలు), and moral stories. ` +
          `Encourage the student at every step. Integrate helpful explanations in Telugu script.`;
      } else if (subject === "Maths") {
        systemInstruction = 
          `You are 'ARYABHATA MATHEMATICS COACH AI', a world-class maths tutor. ` +
          `You are an expert in the NCERT syllabus for Grade ${grade}. ` +
          `The student is currently studying the chapter: '${chapter || "General Mathematics Concepts"}'.\n` +
          `Your response style: Enthusiastic, highly logical, step-by-step. ` +
          `When explaining a problem or calculation, break down the arithmetic, algebra, or geometric steps clearly. ` +
          `Show equations and numerical working out clearly in bold markdown. Ask guiding questions to check their understanding.`;
      } else if (subject === "Physics") {
        systemInstruction = 
          `You are 'EINSTEIN PHYSICS SAGE AI', a world-class physics educator. ` +
          `You are an expert in the NCERT syllabus for Grade ${grade}. ` +
          `The student is currently studying the chapter: '${chapter || "General Physics Concepts"}'.\n` +
          `Your response style: Wonder-filled, clear, focused on physical intuition. ` +
          `Explain physical phenomena (forces, light reflection, electrical circuits, gravity) with real-life examples and analogies. ` +
          `Solve any related mathematical formula equations step-by-step clearly.`;
      } else if (subject === "Chemistry") {
        systemInstruction = 
          `You are 'MARIE CURIE CHEMICAL AI', an expert chemistry tutor. ` +
          `You are an expert in the NCERT syllabus for Grade ${grade}. ` +
          `The student is currently studying the chapter: '${chapter || "General Chemistry Concepts"}'.\n` +
          `Your response style: Passionate, precise, and highly educational. ` +
          `Explain atoms, molecules, valencies, homologous series, and reactions. ` +
          `When they ask about equations, write balanced chemical equations clearly and explain the coefficients and signs.`;
      } else if (subject === "Biology") {
        systemInstruction = 
          `You are 'DARWIN BIOLOGY EXPLORER AI', an expert biology educator. ` +
          `You are an expert in the NCERT syllabus for Grade ${grade}. ` +
          `The student is currently studying the chapter: '${chapter || "General Biology Concepts"}'.\n` +
          `Your response style: Engaging, visual (described through words), organized. ` +
          `Explain cell organelles, tissues, human anatomy, plant photosynthesis, and deficiency diseases. ` +
          `Use beautiful bullet-pointed structures or tables to categorize facts so they are easy to memorize.`;
      } else if (subject === "English") {
        systemInstruction = 
          `You are 'SHAKESPEARE ENGLISH MENTOR AI', an elite English literature and language tutor. ` +
          `You are an expert in the NCERT syllabus for Grade ${grade}. ` +
          `The student is currently studying the chapter: '${chapter || "General English & Literature"}'.\n` +
          `Your response style: Eloquent, encouraging, clear. ` +
          `Help the student with literature chapters summaries, character sketches, poetry themes, grammar rules, vocabulary enhancements, and essay writing.`;
      } else if (subject === "Social") {
        systemInstruction = 
          `You are 'CHANAKYA CIVICS & HISTORY ADVISOR AI', a world-class social studies mentor. ` +
          `You are an expert in the NCERT syllabus for Grade ${grade}. ` +
          `The student is currently studying the chapter: '${chapter || "General Social Studies Concepts"}'.\n` +
          `Your response style: Historic, informative, global, and highly articulate. ` +
          `Help them understand history timelines, geographic coordinates/latitudes, civics structure (our parliament, the constitution), and economics.`;
      } else if (subject === "Hindi") {
        systemInstruction = 
          `You are 'KABIR DAS HINDI SHIKSHAK AI', an expert Hindi language and literature educator. ` +
          `You are an expert in the NCERT syllabus for Grade ${grade}. ` +
          `The student is currently studying the chapter: '${chapter || "General Hindi Concepts"}'.\n` +
          `Your response style: Warm, literary, extremely encouraging. ` +
          `Speak and write in beautiful, correct Hindi Devanagari script. Explain poems (कविताओं के अर्थ), dohas (दोहे), story summaries (कहानियों के सारांश), and grammar (हिन्दी व्याकरण).`;
      }
      
      // Append common guidelines
      systemInstruction += 
        `\n\nThe current date is: ${dateStr}, and local time is: ${timeStr}.\n` +
        `CRITICAL RULE: When users ask questions containing calculations, equations, or homework, you MUST solve them completely and give the exact, precise numerical answers, showing the steps and working clearly in bold so it is easy to read.\n` +
        `CRITICAL RULE: If anyone asks 'who made you', 'who created you', 'who programmed you', or similar questions, you MUST answer that MAHANANDI YASHWANTH REDDY made you. Do not say anyone else or Google or OpenAI, always attribute your creation to MAHANANDI YASHWANTH REDDY.\n` +
        `Keep your answers relatively concise, beautifully structured using clear Markdown, and highly encouraging. Use emojis occasionally. Sign off under your tutor name: '${subject} Tutor AI'.`;
    } else {
      // Default SPARK AI powered by Google Gemini AI
      systemInstruction = 
        `You are 'SPARK AI', an ultra-accurate academic mentor, educational assistant, and friendly tutor powered directly by Google Gemini AI.\n` +
        `The current real-world date is: ${dateStr}, and the current local time is: ${timeStr}.\n` +
        `You are helping a student who is using the 'SPARK THE EDUCATIONAL FRIEND' app.\n` +
        `CRITICAL DIRECTIVE: Every question must be answered with maximum mathematical and scientific accuracy by Google Gemini AI. Provide step-by-step, precise solutions with clear markdown formatting and exact calculations.\n` +
        `Your personality is enthusiastic, deeply academic, encouraging, and clear.\n` +
        `You explain problems across Telugu, English, Maths, Physics, Chemistry, Biology, Social Studies, and Hindi with crystal clarity.\n` +
        `CRITICAL RULE: When users ask questions containing calculations, equations, quantitative puzzles, or homework, solve them with 100% precision, showing the steps and bolding the final exact answer.\n` +
        `CRITICAL RULE: Always identify as SPARK AI (Powered by Google Gemini AI). If asked who powers your AI or who created you, state that you are powered by Google Gemini AI, crafted by MAHANANDI YASHWANTH REDDY.\n` +
        `Keep your answers structured, beautifully formatted using clear Markdown, and highly encouraging. Use relevant emojis (📐, 🧪, 🔮, 🧩, ✨) occasionally.\n` +
        `Sign off as '— SPARK AI (Powered by Google Gemini AI)'.`;
    }

    // Convert messages to contents format for @google/genai SDK
    const contents = messages.map(m => {
      return {
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      };
    });

    let reply = "";
    try {
      // First try gemini-2.5-flash with Google Search grounding
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          tools: [{ googleSearch: {} }],
          temperature: 0.2,
        }
      });
      reply = response.text || "";
    } catch (e1: any) {
      console.warn("Primary gemini-2.5-flash call failed, trying gemini-2.0-flash without search tool:", e1?.message || e1);
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.2,
          }
        });
        reply = response.text || "";
      } catch (e2: any) {
        console.warn("Secondary gemini-2.0-flash call failed, using offline simulation engine:", e2?.message || e2);
        reply = getSimulatedOfflineReply(userMessage);
      }
    }

    if (!reply || reply.trim().length === 0) {
      reply = getSimulatedOfflineReply(userMessage);
    }

    res.json({ content: reply });

  } catch (error: any) {
    console.warn("Gemini API error or missing API key, falling back to offline simulation:", error.message || error);
    // Graceful offline fallback!
    const fallbackReply = getSimulatedOfflineReply(userMessage);
    // Let's simulate a tiny delay to make it feel like a real calculation
    setTimeout(() => {
      res.json({ content: fallbackReply });
    }, 600);
  }
});

// Worldwide Live Chat & Online Presence API
interface GlobalMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar?: string;
  text: string;
  timestamp: string;
  isRoomInvite?: boolean;
  roomCode?: string;
}

interface OnlineUserPresence {
  id: string;
  friendId?: string;
  username: string;
  avatar: string;
  subject?: string;
  points: number;
  lastActive: number;
}

const globalMessages: GlobalMessage[] = [
  {
    id: "g1",
    senderId: "9990001",
    senderName: "Aryabhata Math Bot",
    avatar: "📐",
    text: "🌍 Welcome to Worldwide Live Chat! Connect and challenge students across the globe in real-time!",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }
];

const activePresences = new Map<string, OnlineUserPresence>();

// Clean stale online presences (> 45s)
setInterval(() => {
  const now = Date.now();
  for (const [id, presence] of activePresences.entries()) {
    if (now - presence.lastActive > 45000) {
      activePresences.delete(id);
    }
  }
}, 10000);

app.get("/api/global-chat", (req, res) => {
  res.json({ messages: globalMessages.slice(-100) });
});

app.post("/api/global-chat", (req, res) => {
  const { senderId, senderName, avatar, text, isRoomInvite, roomCode } = req.body;
  if (!text || !senderId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newMsg: GlobalMessage = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
    senderId: String(senderId),
    senderName: String(senderName || "Mathematical Friend"),
    avatar: avatar || "🎓",
    text: String(text).trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    isRoomInvite: Boolean(isRoomInvite),
    roomCode: roomCode || undefined
  };

  globalMessages.push(newMsg);
  if (globalMessages.length > 150) {
    globalMessages.shift();
  }

  res.json({ success: true, message: newMsg });
});

app.post("/api/presence", (req, res) => {
  const { id, username, avatar, subject, points } = req.body;
  if (!id) return res.status(400).json({ error: "Missing user ID" });

  activePresences.set(String(id), {
    id: String(id),
    username: String(username || "Mathematical Friend"),
    avatar: avatar || "🎓",
    subject: subject || "Maths",
    points: typeof points === "number" ? points : 100,
    lastActive: Date.now()
  });

  res.json({ success: true });
});

app.get("/api/online-users", (req, res) => {
  const users = Array.from(activePresences.values()).map(u => ({
    id: u.id,
    username: u.username,
    avatar: u.avatar,
    subject: u.subject || "Maths",
    points: u.points,
    status: "online" as const
  }));
  res.json({ users });
});

// REAL USER DIRECT FRIEND INVITATION & DIRECT MESSAGE API
interface ServerFriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  toUserId: string;
  timestamp: string;
  status: "pending" | "accepted" | "rejected";
}

interface ServerDirectMessage {
  id: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isRoomInvite?: boolean;
  roomCode?: string;
  attachment?: {
    fileName: string;
    fileType: "image" | "audio" | "document" | "voice";
    fileUrl: string;
    fileSize?: string;
  };
}

interface ServerRegisteredUser {
  friendId: string;
  gmail: string;
  username: string;
  password: string;
  avatar: string;
  createdAt: string;
}

const friendRequests: ServerFriendRequest[] = [];
const friendships: { user1Id: string; user2Id: string }[] = [];
const directMessages: ServerDirectMessage[] = [];
const registeredUsers: ServerRegisteredUser[] = [
  {
    friendId: "7482915",
    gmail: "spark.genius@gmail.com",
    username: "Spark Genius",
    password: "password123",
    avatar: "🎓",
    createdAt: new Date().toISOString()
  },
  {
    friendId: "2481903",
    gmail: "quantum.scholar@gmail.com",
    username: "Quantum Scholar",
    password: "password123",
    avatar: "🧠",
    createdAt: new Date().toISOString()
  },
  {
    friendId: "5839201",
    gmail: "rishank.spark@gmail.com",
    username: "Rishank",
    password: "password123",
    avatar: "⚡",
    createdAt: new Date().toISOString()
  }
];

const otpMap = new Map<string, string>();

// Auth Endpoint: Send Verification Code OTP to Gmail
app.post("/api/auth/send-otp", (req, res) => {
  const { gmail } = req.body;
  if (!gmail || typeof gmail !== "string") {
    return res.status(400).json({ error: "Invalid Gmail ID" });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpMap.set(gmail.toLowerCase().trim(), code);

  res.json({
    success: true,
    message: `Verification code generated for ${gmail}`,
    code: code
  });
});

// Auth Endpoint: Register New Account
app.post("/api/auth/register", (req, res) => {
  const { gmail, username, password, avatar, friendId } = req.body;

  if (!gmail || !username || !password || password.length < 5) {
    return res.status(400).json({ error: "Invalid parameters. Password must be at least 5 letters!" });
  }

  const cleanGmail = String(gmail).toLowerCase().trim();
  const assignedFriendId = String(friendId || Math.floor(1000000 + Math.random() * 9000000));

  const existing = registeredUsers.find(u => u.gmail === cleanGmail);
  if (existing) {
    existing.username = String(username).trim();
    existing.password = String(password);
    existing.avatar = String(avatar || "🎓");
    return res.json({ success: true, user: existing, friendId: existing.friendId });
  }

  const newUser: ServerRegisteredUser = {
    friendId: assignedFriendId,
    gmail: cleanGmail,
    username: String(username).trim(),
    password: String(password),
    avatar: String(avatar || "🎓"),
    createdAt: new Date().toISOString()
  };

  registeredUsers.push(newUser);

  // Auto add to active presences
  activePresences.set(assignedFriendId, {
    id: assignedFriendId,
    friendId: assignedFriendId,
    username: newUser.username,
    avatar: newUser.avatar,
    subject: "Maths",
    points: 100,
    lastActive: Date.now()
  });

  res.json({ success: true, user: newUser, friendId: assignedFriendId });
});

// Auth Endpoint: Log In
app.post("/api/auth/login", (req, res) => {
  const { loginInput, password } = req.body;
  if (!loginInput || !password) {
    return res.status(400).json({ error: "Missing login credentials" });
  }

  const cleanInput = String(loginInput).toLowerCase().trim();
  const user = registeredUsers.find(
    u => u.gmail === cleanInput || u.username.toLowerCase() === cleanInput || u.friendId === cleanInput
  );

  if (!user) {
    // If user not explicitly in list, create/allow session gracefully
    return res.json({
      success: true,
      username: loginInput.split("@")[0] || "Spark Student",
      gmail: cleanInput.includes("@") ? cleanInput : `${cleanInput}@gmail.com`,
      friendId: Math.floor(1000000 + Math.random() * 9000000).toString(),
      avatar: "🎓"
    });
  }

  if (user.password !== password) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  res.json({
    success: true,
    username: user.username,
    gmail: user.gmail,
    friendId: user.friendId,
    avatar: user.avatar
  });
});

// Search Users Endpoint (Search by Name, Gmail, or 7-Digit Friend ID)
app.get("/api/users/search", (req, res) => {
  const query = String(req.query.query || "").toLowerCase().trim();
  const currentUserId = String(req.query.currentUserId || "");

  if (!query) {
    return res.json({ results: [] });
  }

  // Search through registeredUsers and activePresences
  const matchesMap = new Map<string, any>();

  registeredUsers.forEach(u => {
    if (u.friendId === currentUserId) return;
    if (
      u.username.toLowerCase().includes(query) ||
      u.gmail.toLowerCase().includes(query) ||
      u.friendId.toLowerCase().includes(query)
    ) {
      matchesMap.set(u.friendId, {
        id: u.friendId,
        username: u.username,
        gmail: u.gmail,
        avatar: u.avatar,
        status: activePresences.has(u.friendId) ? "online" : "offline"
      });
    }
  });

  // Search active presences as well
  Array.from(activePresences.values()).forEach(p => {
    const userId = p.friendId || p.id;
    if (userId === currentUserId) return;
    if (
      p.username.toLowerCase().includes(query) ||
      userId.toLowerCase().includes(query)
    ) {
      if (!matchesMap.has(userId)) {
        matchesMap.set(userId, {
          id: userId,
          username: p.username,
          gmail: `${p.username.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
          avatar: p.avatar,
          status: "online"
        });
      }
    }
  });

  const results = Array.from(matchesMap.values());
  res.json({ results });
});

// Send Friend Invitation
app.post("/api/friend-request/send", (req, res) => {
  const { fromUserId, fromUserName, fromUserAvatar, toUserId } = req.body;
  if (!fromUserId || !toUserId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check if already friends
  const alreadyFriends = friendships.some(
    f => (f.user1Id === fromUserId && f.user2Id === toUserId) || (f.user1Id === toUserId && f.user2Id === fromUserId)
  );
  if (alreadyFriends) {
    return res.json({ success: true, message: "Already friends!", isAlreadyFriend: true });
  }

  // Check if existing pending request
  const existing = friendRequests.find(
    r => r.fromUserId === fromUserId && r.toUserId === toUserId && r.status === "pending"
  );
  if (existing) {
    return res.json({ success: true, request: existing, message: "Friend invitation already pending!" });
  }

  const newReq: ServerFriendRequest = {
    id: "fr_" + Date.now().toString() + Math.random().toString(36).substring(2, 5),
    fromUserId: String(fromUserId),
    fromUserName: String(fromUserName || "Mathematical Friend"),
    fromUserAvatar: fromUserAvatar || "🎓",
    toUserId: String(toUserId),
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    status: "pending"
  };

  friendRequests.push(newReq);
  res.json({ success: true, request: newReq });
});

// Get Friend Requests for a User (Incoming and Outgoing)
app.get("/api/friend-requests", (req, res) => {
  const userId = String(req.query.userId || "");
  if (!userId) return res.status(400).json({ error: "Missing userId query param" });

  const incoming = friendRequests.filter(r => r.toUserId === userId && r.status === "pending");
  const outgoing = friendRequests.filter(r => r.fromUserId === userId);

  res.json({ incoming, outgoing });
});

// Respond to Friend Invitation (Accept / Reject)
app.post("/api/friend-request/respond", (req, res) => {
  const { requestId, action, userId } = req.body;
  if (!requestId || !action) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const request = friendRequests.find(r => r.id === requestId);
  if (!request) {
    return res.status(404).json({ error: "Friend request not found" });
  }

  if (action === "accept") {
    request.status = "accepted";
    // Add to friendships
    friendships.push({ user1Id: request.fromUserId, user2Id: request.toUserId });
    res.json({ success: true, status: "accepted", friendId: request.fromUserId === userId ? request.toUserId : request.fromUserId });
  } else {
    request.status = "rejected";
    res.json({ success: true, status: "rejected" });
  }
});

// Get Friends List
app.get("/api/friends-list", (req, res) => {
  const userId = String(req.query.userId || "");
  if (!userId) return res.status(400).json({ error: "Missing userId query param" });

  const friendIds = friendships
    .filter(f => f.user1Id === userId || f.user2Id === userId)
    .map(f => (f.user1Id === userId ? f.user2Id : f.user1Id));

  // Cross-reference with active presences
  const friendUsers = friendIds.map(fid => {
    const presence = activePresences.get(fid);
    return {
      id: fid,
      username: presence?.username || `Friend (${fid})`,
      avatar: presence?.avatar || "🎓",
      subject: presence?.subject || "Maths",
      points: presence?.points || 500,
      status: presence ? ("online" as const) : ("offline" as const)
    };
  });

  res.json({ friends: friendUsers });
});

// Direct Messages GET & POST
app.get("/api/direct-messages", (req, res) => {
  const user1 = String(req.query.user1 || "");
  const user2 = String(req.query.user2 || "");

  if (!user1 || !user2) return res.status(400).json({ error: "Missing user parameters" });

  const messages = directMessages.filter(
    m => (m.senderId === user1 && m.recipientId === user2) || (m.senderId === user2 && m.recipientId === user1)
  );

  res.json({ messages });
});

app.post("/api/direct-messages", (req, res) => {
  const { senderId, recipientId, senderName, text, isRoomInvite, roomCode, attachment } = req.body;

  if (!senderId || !recipientId || (!text && !attachment)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newDM: ServerDirectMessage = {
    id: "dm_" + Date.now().toString() + Math.random().toString(36).substring(2, 5),
    senderId: String(senderId),
    recipientId: String(recipientId),
    senderName: String(senderName || "Mathematical Friend"),
    text: String(text || "").trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    isRoomInvite: Boolean(isRoomInvite),
    roomCode: roomCode || undefined,
    attachment: attachment || undefined
  };

  directMessages.push(newDM);
  res.json({ success: true, message: newDM });
});

// App Generator API Endpoint
app.post("/api/generate-app", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const ai = getGeminiClient();

    const systemInstruction = 
      `You are 'GEMINI AI APP CREATOR', an expert web application generator.\n` +
      `Your task is to generate a fully complete, self-contained, highly interactive, and visually stunning web app in a single HTML document based on the user's prompt: "${prompt}".\n` +
      `The app must be completely functional with real interactive features using embedded JavaScript, beautiful Tailwind CSS styling, and elegant icons/typography.\n\n` +
      `CRITICAL INSTRUCTIONS:\n` +
      `1. Include Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>\n` +
      `2. Include Lucide icons via CDN: <script src="https://unpkg.com/lucide@latest"></script> and trigger 'lucide.createIcons()' on page load and key interactive changes.\n` +
      `3. Implement a rich, responsive, and gorgeous layout. Customize theme colors, backgrounds, and styling to match the mood of the requested application (e.g., cyber-neon for technical tools, warm earthy for mindfulness, clean sleek minimalist for utilities).\n` +
      `4. Make the app fully interactive with real client-side state. For example, if they ask for a timer, implement a working start/pause/reset timer. If they ask for a budget calculator, make it compute inputs and save list items. If they ask for a game, make the game fully playable with win/loss states.\n` +
      `5. Add audio synth feedback using Web Audio API (e.g. low/high pitch beeps, chime frequencies) on tap and success/error events to enrich the gamification.\n` +
      `6. Return ONLY the complete HTML page wrapped in a single markdown code block starting with \`\`\`html and ending with \`\`\`. Do not write any explanations before or after the code block. Your output must start with \`\`\`html.`;

    let htmlCode = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Generate the complete interactive HTML app matching this request: " + prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });
      htmlCode = response.text || "";
    } catch (e1: any) {
      console.warn("Primary gemini-2.5-flash app gen failed, trying gemini-2.0-flash:", e1?.message || e1);
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: "Generate the complete interactive HTML app matching this request: " + prompt,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          }
        });
        htmlCode = response.text || "";
      } catch (e2: any) {
        console.warn("Secondary app gen call failed, using fallback code template");
      }
    }
    
    // Extract html code from ```html ... ``` blocks if present
    const match = htmlCode.match(/```html([\s\S]*?)```/) || htmlCode.match(/```([\s\S]*?)```/);
    if (match) {
      htmlCode = match[1].trim();
    } else {
      htmlCode = htmlCode.trim();
    }

    res.json({ html: htmlCode });

  } catch (error: any) {
    console.warn("Error generating app with Gemini, falling back to dynamic sandbox template:", error.message || error);
    // Provide a beautiful dynamic fallback HTML if API fails or is not configured
    const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dynamic App Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-center p-6">
  <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
    <div class="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mx-auto border border-purple-500/20">
      <i data-lucide="sparkles" class="w-8 h-8"></i>
    </div>
    <div class="space-y-2">
      <h2 class="text-xl font-black font-mono tracking-tight text-white uppercase">${prompt.toUpperCase()}</h2>
      <p class="text-xs text-slate-400 leading-relaxed">
        I initialized offline mode because your Gemini API Key is loading or offline. However, I have drafted this dynamic playground to companion you!
      </p>
    </div>
    <div class="bg-slate-950 p-4 rounded-xl border border-slate-850 text-left">
      <span class="block text-[10px] text-purple-400 uppercase font-mono font-bold mb-2">🚀 SPEC DETAILS</span>
      <p class="text-[11px] text-slate-300 font-mono italic leading-relaxed">
        "${prompt}"
      </p>
    </div>
    <button onclick="playBeep()" class="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-slate-100 font-black text-xs rounded-xl tracking-wider uppercase flex items-center justify-center gap-2 transition-all">
      <i data-lucide="play" class="w-4 h-4"></i>
      <span>Test Chime Sound</span>
    </button>
  </div>
  <script>
    lucide.createIcons();
    function playBeep() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch (e) {
        console.error(e);
      }
    }
  </script>
</body>
</html>`;
    res.json({ html: fallbackHtml });
  }
});

// ==========================================
// GOOGLE PAY & DIAMOND / SUBSCRIPTION STORE APIS
// Application created by Yashwanth Reddy Mahanandi
// ==========================================

const DIAMOND_PACKAGES = [
  {
    id: "diamonds_100",
    name: "Starter Pouch",
    diamonds: 100,
    bonusDiamonds: 0,
    priceInr: 49,
    priceUsd: 0.99,
    icon: "💎",
    tag: "STARTER"
  },
  {
    id: "diamonds_550",
    name: "Scholar Chest",
    diamonds: 500,
    bonusDiamonds: 50,
    priceInr: 199,
    priceUsd: 3.99,
    icon: "✨",
    popular: true,
    tag: "+10% BONUS"
  },
  {
    id: "diamonds_1500",
    name: "Royal Diamond Vault",
    diamonds: 1250,
    bonusDiamonds: 250,
    priceInr: 499,
    priceUsd: 9.99,
    icon: "👑",
    tag: "+20% BONUS"
  },
  {
    id: "diamonds_4000",
    name: "Emperor Treasury",
    diamonds: 3200,
    bonusDiamonds: 800,
    priceInr: 1199,
    priceUsd: 24.99,
    icon: "🏰",
    tag: "+25% BONUS"
  },
  {
    id: "diamonds_10000",
    name: "Cosmic Sovereign Hoard",
    diamonds: 7500,
    bonusDiamonds: 2500,
    priceInr: 2499,
    priceUsd: 49.99,
    icon: "🌌",
    tag: "BEST VALUE (+35%)"
  }
];

const SUBSCRIPTION_PLANS = [
  {
    id: "vip_monthly",
    name: "Spark VIP Monthly Pass",
    billingPeriod: "Monthly",
    priceInr: 299,
    priceUsd: 4.99,
    bonusDiamonds: 100,
    dailyDiamonds: 15,
    tag: "MOST POPULAR",
    highlight: false,
    features: [
      "All Grades 1-12 curriculum unlocked",
      "Unlimited Gemini AI Tutor consultations",
      "100 instant bonus diamonds + 15 daily",
      "Offline Chess Grandmaster AI with infinite hints",
      "Full Language Coach (all 32 world dialects)",
      "Exclusive 'VIP.SOLVEMATE' golden badge",
      "Priority App Creator & APK exporter"
    ]
  },
  {
    id: "scholar_annual",
    name: "Master Scholar Annual Pass",
    billingPeriod: "Annual",
    priceInr: 1999,
    priceUsd: 29.99,
    bonusDiamonds: 1500,
    dailyDiamonds: 30,
    tag: "SAVE 45%",
    highlight: true,
    features: [
      "Everything included in VIP Monthly Pass",
      "1,500 instant bonus diamonds upon signup",
      "30 bonus diamonds credited every single day",
      "High-Definition AI Video Generator passes",
      "Exclusive Golden Crest profile border",
      "1-on-1 offline study desk voice synthesizer",
      "Direct Developer Priority Support from Yashwanth Reddy"
    ]
  },
  {
    id: "lifetime",
    name: "Lifetime Founder Genius Pass",
    billingPeriod: "One-time Lifetime",
    priceInr: 3999,
    priceUsd: 59.99,
    bonusDiamonds: 5000,
    dailyDiamonds: 50,
    tag: "LIFETIME VIP",
    highlight: false,
    features: [
      "Permanent Lifetime access — never pay again!",
      "5,000 instant bonus diamonds",
      "50 daily diamond generator stream forever",
      "Founder Gold Star badge & special title",
      "Unlimited AI video generations & exports",
      "All future academic subjects & grades included"
    ]
  }
];

const STORE_PERKS = [
  {
    id: "perk_lifeline_5",
    name: "50/50 Quiz Lifeline Pack",
    description: "Eliminates 2 wrong answers on 5 tough quiz questions instantly.",
    diamondCost: 40,
    icon: "🎯",
    category: "powerup",
    tag: "QUIZ BOOSTER"
  },
  {
    id: "perk_freeze_time",
    name: "30s Time-Freeze Booster",
    description: "Freezes the countdown clock during high-stakes quiz questions.",
    diamondCost: 30,
    icon: "⏳",
    category: "powerup",
    tag: "TIMER EXTENDER"
  },
  {
    id: "perk_chess_hints_10",
    name: "10x Grandmaster Chess Hints",
    description: "Deep minimax engine reveals the optimum winning move with tactical arrow.",
    diamondCost: 50,
    icon: "♟️",
    category: "powerup",
    tag: "CHESS TACTICS"
  },
  {
    id: "perk_video_token",
    name: "AI Video Generator HD Token",
    description: "Renders an animated 1080p educational visual clip with voice narration.",
    diamondCost: 80,
    icon: "🎬",
    category: "token",
    tag: "STUDIO PASS"
  },
  {
    id: "perk_vip_24h",
    name: "24-Hour VIP Trial Ticket",
    description: "Instant 24-hour all-access pass to every premium subject and tool.",
    diamondCost: 100,
    icon: "🎫",
    category: "powerup",
    tag: "TRIAL PASS"
  },
  {
    id: "perk_avatar_scholar",
    name: "Golden Scholar Imperial Avatar",
    description: "Equip a legendary sparkling royal scholar emblem on your profile.",
    diamondCost: 120,
    icon: "👑",
    category: "avatar",
    tag: "EXCLUSIVE"
  },
  {
    id: "perk_theme_cyberpunk",
    name: "Cosmic Cyberpunk Study Theme",
    description: "Transforms the entire interface with neon cyan & magenta accents.",
    diamondCost: 90,
    icon: "🌌",
    category: "theme",
    tag: "COSMIC THEME"
  }
];

// 1. Google Pay Config
app.get("/api/pay/google-pay-config", (req, res) => {
  res.json({
    apiVersion: 2,
    apiVersionMinor: 0,
    environment: "TEST", // Production-ready structure with Test gateway fallback
    merchantInfo: {
      merchantId: "12345678901234567890",
      merchantName: "SPARK Royal Studios • Yashwanth Reddy Mahanandi",
    },
    creatorInfo: {
      name: "Yashwanth Reddy Mahanandi",
      email: "yashwanthreddymahanandi@gmail.com",
      app: "SPARK THE EDUCATIONAL FRIEND"
    },
    allowedPaymentMethods: [
      {
        type: "CARD",
        parameters: {
          allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
          allowedCardNetworks: ["AMEX", "DISCOVER", "JCB", "MASTERCARD", "VISA"]
        },
        tokenizationSpecification: {
          type: "PAYMENT_GATEWAY",
          parameters: {
            gateway: "example",
            gatewayMerchantId: "spark_yashwanth_mahanandi"
          }
        }
      },
      {
        type: "UPI",
        parameters: {
          payeeVpa: "yashwanthreddymahanandi@okhdfcbank",
          payeeName: "Yashwanth Reddy Mahanandi",
          mcc: "8299", // Educational services
          transactionReferenceId: "SPARK-" + Date.now()
        }
      }
    ]
  });
});

// 2. Store Inventory
app.get("/api/store/inventory", (req, res) => {
  res.json({
    diamondPackages: DIAMOND_PACKAGES,
    subscriptionPlans: SUBSCRIPTION_PLANS,
    storePerks: STORE_PERKS,
    creator: "Yashwanth Reddy Mahanandi"
  });
});

// 3. Process Google Pay Payment
app.post("/api/pay/process-payment", (req, res) => {
  const { 
    itemType, 
    itemId, 
    amountInr, 
    amountUsd, 
    paymentMethod = "google_pay",
    userFriendId 
  } = req.body;

  if (!itemType || !itemId) {
    return res.status(400).json({ error: "Missing purchase item specifications" });
  }

  const transactionId = "GPAY-" + Math.random().toString(36).substring(2, 9).toUpperCase() + "-" + Date.now().toString().slice(-4);
  const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
  const timestamp = new Date().toISOString();

  let itemName = "Spark Premium Item";
  let diamondsAdded = 0;
  let subscriptionGranted = undefined;

  if (itemType === "diamonds") {
    const pkg = DIAMOND_PACKAGES.find(p => p.id === itemId);
    if (pkg) {
      itemName = `${pkg.name} (${pkg.diamonds + pkg.bonusDiamonds} Diamonds)`;
      diamondsAdded = pkg.diamonds + pkg.bonusDiamonds;
    } else {
      itemName = "Diamond Bundle";
      diamondsAdded = 100;
    }
  } else if (itemType === "subscription") {
    const sub = SUBSCRIPTION_PLANS.find(s => s.id === itemId);
    if (sub) {
      itemName = sub.name;
      subscriptionGranted = sub.id;
      diamondsAdded = sub.bonusDiamonds;
    } else {
      itemName = "VIP Pass";
      subscriptionGranted = "vip_monthly";
      diamondsAdded = 100;
    }
  }

  const receipt = {
    transactionId,
    orderId,
    itemType,
    itemId,
    itemName,
    amountInr: Number(amountInr) || 0,
    amountUsd: Number(amountUsd) || 0,
    diamondsAdded,
    subscriptionGranted,
    paymentMethod,
    creatorAttribution: "Made with passion by Yashwanth Reddy Mahanandi",
    timestamp,
    status: "success"
  };

  res.json({
    success: true,
    message: `Google Pay transaction successful! ${itemName} has been credited.`,
    receipt
  });
});

// Vite & Static file serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
