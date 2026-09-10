/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { UserStats, FriendUser, FriendRequest, FriendChatMessage, FileAttachment, Subject } from "../types";
import { playTapSound, playCorrectSound, playOopsSound } from "../utils/sound";
import { 
  Users, 
  MessageSquare, 
  UserPlus, 
  Search, 
  Send, 
  Paperclip, 
  Mic, 
  Swords, 
  Check, 
  X, 
  Globe, 
  Sparkles, 
  Trophy, 
  Image, 
  FileText, 
  Volume2,
  Copy,
  CheckCircle2
} from "lucide-react";

interface FriendsHubProps {
  userStats: UserStats;
  userFriendId: string;
  onStartRoomMatch: (friend: FriendUser, roomCode: string, subject: Subject) => void;
}

export default function FriendsHub({
  userStats,
  userFriendId,
  onStartRoomMatch
}: FriendsHubProps) {
  const [activeTab, setActiveTab] = useState<"worldwide" | "direct" | "requests">("direct");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Friends list & Online presences
  const [friendsList, setFriendsList] = useState<FriendUser[]>([
    { id: "7482915", username: "Spark Genius", avatar: "🎓", subject: "Maths", points: 840, status: "online" },
    { id: "2481903", username: "Quantum Scholar", avatar: "🧠", subject: "Physics", points: 1250, status: "online" },
    { id: "5839201", username: "Rishank", avatar: "⚡", subject: "Chemistry", points: 620, status: "online" }
  ]);

  const [selectedFriend, setSelectedFriend] = useState<FriendUser | null>(friendsList[0]);
  const [directChatMessages, setDirectChatMessages] = useState<FriendChatMessage[]>([]);
  const [directInputText, setDirectInputText] = useState("");

  // Worldwide Live Chat state
  const [globalMessages, setGlobalMessages] = useState<any[]>([]);
  const [globalInputText, setGlobalInputText] = useState("");

  // Friend Requests
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [copiedId, setCopiedId] = useState(false);

  // Send Presence heartbeat
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: userFriendId,
            username: userStats.username || "Mathematical Friend",
            avatar: "🎓",
            subject: "Maths",
            points: userStats.points || 100
          })
        });
      } catch (e) {
        // Heartbeat offline
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 15000);
    return () => clearInterval(interval);
  }, [userFriendId, userStats]);

  // Poll Global Chat and Direct Messages
  useEffect(() => {
    const fetchGlobal = async () => {
      try {
        const res = await fetch("/api/global-chat");
        const data = await res.json();
        if (data.messages) setGlobalMessages(data.messages);
      } catch (e) {}
    };

    const fetchDirect = async () => {
      if (!selectedFriend) return;
      try {
        const res = await fetch(`/api/direct-messages?user1=${userFriendId}&user2=${selectedFriend.id}`);
        const data = await res.json();
        if (data.messages) setDirectChatMessages(data.messages);
      } catch (e) {}
    };

    const fetchRequests = async () => {
      try {
        const res = await fetch(`/api/friend-requests?userId=${userFriendId}`);
        const data = await res.json();
        if (data.incoming) setIncomingRequests(data.incoming);
      } catch (e) {}
    };

    fetchGlobal();
    fetchDirect();
    fetchRequests();

    const interval = setInterval(() => {
      fetchGlobal();
      fetchDirect();
      fetchRequests();
    }, 4000);

    return () => clearInterval(interval);
  }, [userFriendId, selectedFriend]);

  // Handle Search Users
  const handleSearchUsers = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/users/search?query=${encodeURIComponent(q.trim())}&currentUserId=${userFriendId}`);
      const data = await res.json();
      setIsSearching(false);
      if (data.results) {
        setSearchResults(data.results);
      }
    } catch (e) {
      setIsSearching(false);
    }
  };

  // Send Friend Request
  const handleSendFriendRequest = async (targetUser: any) => {
    playTapSound();
    try {
      const res = await fetch("/api/friend-request/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: userFriendId,
          fromUserName: userStats.username || "Mathematical Friend",
          fromUserAvatar: "🎓",
          toUserId: targetUser.id
        })
      });
      const data = await res.json();
      if (data.success) {
        playCorrectSound();
        alert(`🎉 Friend request sent to ${targetUser.username}!`);
      }
    } catch (e) {
      playOopsSound();
    }
  };

  // Accept or Reject Request
  const handleRespondRequest = async (requestId: string, action: "accept" | "reject") => {
    playTapSound();
    try {
      const res = await fetch("/api/friend-request/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action, userId: userFriendId })
      });
      const data = await res.json();
      if (data.success) {
        playCorrectSound();
        setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
        if (action === "accept" && data.friendId) {
          setFriendsList(prev => [
            ...prev,
            { id: data.friendId, username: `Friend (${data.friendId})`, avatar: "🎓", subject: "Maths", points: 500, status: "online" }
          ]);
        }
      }
    } catch (e) {}
  };

  // Send Direct Message
  const handleSendDirectMessage = async (e?: React.FormEvent, attachment?: FileAttachment) => {
    if (e) e.preventDefault();
    if ((!directInputText.trim() && !attachment) || !selectedFriend) return;

    playTapSound();
    const textToSend = directInputText.trim();
    setDirectInputText("");

    try {
      const res = await fetch("/api/direct-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: userFriendId,
          recipientId: selectedFriend.id,
          senderName: userStats.username || "Mathematical Friend",
          text: textToSend,
          attachment: attachment || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        playCorrectSound();
        setDirectChatMessages(prev => [...prev, data.message]);
      }
    } catch (e) {
      // Offline fallback
      setDirectChatMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          senderId: userFriendId,
          senderName: userStats.username || "Mathematical Friend",
          text: textToSend,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          attachment: attachment
        }
      ]);
    }
  };

  // Send Worldwide Chat message
  const handleSendGlobalMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalInputText.trim()) return;

    playTapSound();
    const textToSend = globalInputText.trim();
    setGlobalInputText("");

    try {
      const res = await fetch("/api/global-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: userFriendId,
          senderName: userStats.username || "Mathematical Friend",
          avatar: "🎓",
          text: textToSend
        })
      });
      const data = await res.json();
      if (data.success) {
        playCorrectSound();
        setGlobalMessages(prev => [...prev, data.message]);
      }
    } catch (e) {}
  };

  // Start 1v1 Quiz Room Match Challenge
  const handleChallengeFriend = (friend: FriendUser) => {
    playTapSound();
    const roomCode = "ROOM-" + Math.floor(100000 + Math.random() * 900000);
    
    // Send invitation message in direct chat
    handleSendDirectMessage(undefined, {
      fileName: `⚔️ 1v1 Quiz Challenge (${friend.subject})`,
      fileType: "document",
      fileUrl: `#${roomCode}`,
      fileSize: "Room: " + roomCode
    });

    onStartRoomMatch(friend, roomCode, friend.subject);
  };

  // Simulated Voice Note Record
  const handleSendVoiceNote = () => {
    playTapSound();
    handleSendDirectMessage(undefined, {
      fileName: "Study Voice Memo (0:04)",
      fileType: "voice",
      fileUrl: "audio_memo_simulated.mp3",
      fileSize: "64 KB"
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6" id="friends_hub_module">
      
      {/* Top Banner with 7-Digit Friend ID */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-600/30">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 text-[10px] font-mono font-bold text-indigo-400 uppercase">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>REALTIME STUDENT NETWORK</span>
            </div>
            <h3 className="text-lg font-black font-display text-slate-100 uppercase">
              Friends &amp; Worldwide Hub
            </h3>
          </div>
        </div>

        {/* User 7-Digit Friend ID Card with Copy action */}
        <div className="flex items-center space-x-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-850">
          <div>
            <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold">YOUR UNIQUE 7-DIGIT FRIEND ID:</span>
            <span className="text-sm font-mono font-black text-amber-400 tracking-wider" id="display_user_7_digit_id">
              {userFriendId}
            </span>
          </div>

          <button
            onClick={() => {
              playTapSound();
              navigator.clipboard.writeText(userFriendId);
              setCopiedId(true);
              setTimeout(() => setCopiedId(false), 2000);
            }}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl cursor-pointer"
            title="Copy 7-Digit Friend ID"
          >
            {copiedId ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Main Hub Tabs & Search Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Column: Friends List & Search */}
        <div className="space-y-4">
          
          {/* Tabs switch */}
          <div className="grid grid-cols-3 bg-slate-950 p-1 rounded-2xl border border-slate-850 text-xs font-mono font-bold">
            <button
              onClick={() => { playTapSound(); setActiveTab("direct"); }}
              className={`py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "direct" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Friends ({friendsList.length})
            </button>
            <button
              onClick={() => { playTapSound(); setActiveTab("worldwide"); }}
              className={`py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "worldwide" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              World Live
            </button>
            <button
              onClick={() => { playTapSound(); setActiveTab("requests"); }}
              className={`py-1.5 rounded-xl transition-all cursor-pointer relative ${
                activeTab === "requests" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Requests
              {incomingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 rounded-full font-black text-[9px] flex items-center justify-center">
                  {incomingRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* User Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchUsers(e.target.value)}
              placeholder="Search Name, Gmail, or 7-Digit ID..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-2xl pl-9 pr-3.5 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-600"
            />
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar shadow-2xl animate-fade-in">
              <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Search Matches:</span>
              {searchResults.map((usr) => (
                <div key={usr.id} className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-850">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{usr.avatar || "🎓"}</span>
                    <div>
                      <span className="block text-xs font-bold text-slate-200">{usr.username}</span>
                      <span className="block text-[9px] font-mono text-amber-400 font-bold">ID: {usr.id}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendFriendRequest(usr)}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold font-mono uppercase cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Friends List Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 space-y-2 max-h-[440px] overflow-y-auto custom-scrollbar">
            <span className="block text-[10px] font-mono text-indigo-400 uppercase font-black px-2 py-1">
              CONNECTED PEERS
            </span>

            {friendsList.map((friend) => {
              const isSelected = selectedFriend?.id === friend.id;

              return (
                <button
                  key={friend.id}
                  onClick={() => {
                    playTapSound();
                    setSelectedFriend(friend);
                    setActiveTab("direct");
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-600/10"
                      : "bg-slate-950/60 border-slate-850 hover:bg-slate-950"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg">
                      {friend.avatar}
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-200">{friend.username}</span>
                      <span className="block text-[9px] font-mono text-slate-400">
                        {friend.subject} • <span className="text-amber-400 font-bold">{friend.points} PTS</span>
                      </span>
                    </div>
                  </div>

                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Column: Active Chat Interface (Direct or Worldwide) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl h-[620px] flex flex-col justify-between">
          
          {activeTab === "direct" && selectedFriend ? (
            <>
              {/* Direct Chat Top Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xl">
                    {selectedFriend.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-black font-display text-slate-100 uppercase">
                      {selectedFriend.username}
                    </h4>
                    <span className="block text-[10px] font-mono text-emerald-400 font-bold">
                      ● Active Now • Friend ID: {selectedFriend.id}
                    </span>
                  </div>
                </div>

                {/* Challenge 1v1 Room Match Button */}
                <button
                  onClick={() => handleChallengeFriend(selectedFriend)}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 rounded-xl text-xs font-black font-mono uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
                  id="btn_challenge_1v1_match"
                >
                  <Swords className="w-4 h-4" />
                  <span>1v1 Quiz Match</span>
                </button>
              </div>

              {/* Direct Chat Messages Scroll */}
              <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1 custom-scrollbar">
                {directChatMessages.length === 0 ? (
                  <div className="text-center py-16 text-xs text-slate-500 font-mono space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
                    <p>No messages yet. Send a greeting or challenge {selectedFriend.username} to a 1v1 Quiz!</p>
                  </div>
                ) : (
                  directChatMessages.map((msg) => {
                    const isMe = msg.senderId === userFriendId;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                          isMe
                            ? "bg-indigo-600 text-white rounded-tr-none"
                            : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none"
                        }`}>
                          {/* Attachment preview if present */}
                          {msg.attachment && (
                            <div className="p-2 bg-black/20 rounded-xl border border-white/10 mb-2 space-y-1">
                              <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-amber-300">
                                {msg.attachment.fileType === "voice" ? <Volume2 className="w-3.5 h-3.5" /> : <Paperclip className="w-3.5 h-3.5" />}
                                <span>{msg.attachment.fileName}</span>
                              </div>
                              {msg.attachment.fileSize && (
                                <span className="block text-[8px] text-slate-300">{msg.attachment.fileSize}</span>
                              )}
                            </div>
                          )}

                          {msg.text && <p>{msg.text}</p>}
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Direct Chat Input Bar */}
              <form onSubmit={handleSendDirectMessage} className="pt-2 border-t border-slate-800 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSendVoiceNote}
                  className="p-2.5 bg-slate-950 hover:bg-slate-850 text-indigo-400 border border-slate-800 rounded-xl cursor-pointer"
                  title="Send Study Voice Memo"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={directInputText}
                  onChange={(e) => setDirectInputText(e.target.value)}
                  placeholder={`Direct message to ${selectedFriend.username}...`}
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none"
                />

                <button
                  type="submit"
                  disabled={!directInputText.trim()}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl cursor-pointer shadow"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : activeTab === "worldwide" ? (
            <>
              {/* Worldwide Live Room Top Bar */}
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl">
                    🌍
                  </div>
                  <div>
                    <h4 className="text-sm font-black font-display text-slate-100 uppercase">
                      Worldwide Student Live Chat
                    </h4>
                    <span className="block text-[10px] font-mono text-cyan-400 font-bold">
                      Open broadcast across all global study rooms
                    </span>
                  </div>
                </div>
              </div>

              {/* Worldwide Messages Scroll */}
              <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1 custom-scrollbar">
                {globalMessages.map((gmsg) => {
                  const isMe = gmsg.senderId === userFriendId;

                  return (
                    <div key={gmsg.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-850 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-bold text-amber-400 flex items-center gap-1">
                          <span>{gmsg.avatar || "🎓"}</span>
                          <span>{gmsg.senderName}</span>
                          {isMe && <span className="text-cyan-400 font-bold">(You)</span>}
                        </span>
                        <span className="text-slate-500">{gmsg.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">{gmsg.text}</p>
                    </div>
                  );
                })}
              </div>

              {/* Worldwide Input Bar */}
              <form onSubmit={handleSendGlobalMessage} className="pt-2 border-t border-slate-800 flex items-center space-x-2">
                <input
                  type="text"
                  value={globalInputText}
                  onChange={(e) => setGlobalInputText(e.target.value)}
                  placeholder="Broadcast message to worldwide scholars..."
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none"
                />

                <button
                  type="submit"
                  disabled={!globalInputText.trim()}
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-black text-xs font-mono uppercase rounded-xl cursor-pointer shadow"
                >
                  Send 🌍
                </button>
              </form>
            </>
          ) : (
            /* Friend Requests Tab */
            <div className="space-y-4 animate-fade-in flex-1">
              <h4 className="text-xs font-mono uppercase text-amber-400 font-bold">
                INCOMING FRIEND INVITATIONS ({incomingRequests.length})
              </h4>

              {incomingRequests.length === 0 ? (
                <div className="text-center py-24 text-xs text-slate-500 font-mono space-y-2">
                  <UserPlus className="w-8 h-8 mx-auto text-slate-600" />
                  <p>No pending friend requests. Share your 7-Digit Friend ID ({userFriendId}) to connect!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {incomingRequests.map((req) => (
                    <div key={req.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{req.fromUserAvatar || "🎓"}</span>
                        <div>
                          <span className="block text-xs font-bold text-slate-200">{req.fromUserName}</span>
                          <span className="block text-[9px] font-mono text-slate-500">ID: {req.fromUserId}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRespondRequest(req.id, "accept")}
                          className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleRespondRequest(req.id, "reject")}
                          className="p-2 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-xl text-xs cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
