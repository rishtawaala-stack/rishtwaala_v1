"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("@/components/Navigation"), { ssr: false });
import { Send, Phone, Video, MoreVertical, Image as ImageIcon, Smile, ArrowLeft, Heart, Lock, User, ExternalLink, Rocket, Star, ShieldCheck, Check, X, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import toast from "react-hot-toast";
import VibeMatchBanner from "@/components/VibeMatchBanner";
import VibeAnalysisModal from "@/components/VibeAnalysisModal";

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isContactShared, setIsContactShared] = useState(false);
  const [isVibeModalOpen, setIsVibeModalOpen] = useState(false);
  const [vibeScore, setVibeScore] = useState(0);
  const endOfMessagesRef = useRef(null);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchBonds();
  }, []);

  const fetchBonds = async () => {
    try {
      const res = await api.get("/conversations");
      const data = res.data?.data || res.data;
      setChats(data.map(c => ({
        id: c.id,
        name: c.otherProfile?.full_name || "User",
        image: c.otherProfile?.profile_photo_url,
        isEngagementUnlocked: c.isEngagementUnlocked,
        isContactShared: c.isContactShared,
        otherProfile: c.otherProfile
      })));
      setLoading(false);
    } catch (err) {
      console.error("Fetch bonds failed:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
      setIsUnlocked(activeChat.isEngagementUnlocked || false);
      setIsContactShared(activeChat.isContactShared || false);
    }
  }, [activeChat]);

  const fetchMessages = async (conversationId) => {
    try {
      const res = await api.get(`/conversations/${conversationId}/messages`);
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        // Detect unlock from messages if not set in activeChat
        if (data.some(m => m.type === 'engagement_unlocked')) {
            setIsUnlocked(true);
        }
        
        const formattedMessages = data.map(m => ({
          id: m.id,
          sender: m.sender_id === user?.profileId ? "me" : "them",
          rawSenderId: m.sender_id,
          text: m.content,
          time: formatTime(m.sent_at),
          type: m.type
        }));

        setMessages(formattedMessages);
        calculateVibeScore(formattedMessages);
      } else {
        setMessages([{ id: 'system', sender: "system", text: "End-to-End Encrypted. Start your secure conversation.", time: "Now" }]);
        setVibeScore(0);
      }
    } catch (err) {
      setMessages([{ id: 'system', sender: "system", text: "End-to-End Encrypted. Start your secure conversation.", time: "Now" }]);
      setVibeScore(0);
    }
  };

  const calculateVibeScore = (msgs) => {
    if (!msgs || msgs.length === 0) return;
    
    const textMsgs = msgs.filter(m => m.type === 'text');
    if (textMsgs.length === 0) {
        setVibeScore(0);
        return;
    }

    // 1. Message Count Factor (0-40 points)
    const countScore = Math.min(40, textMsgs.length * 2);

    // 2. Response Balance Factor (0-20 points)
    const myMsgs = textMsgs.filter(m => m.sender === 'me').length;
    const theirMsgs = textMsgs.filter(m => m.sender === 'them').length;
    const balance = Math.min(myMsgs, theirMsgs) / Math.max(1, Math.max(myMsgs, theirMsgs));
    const balanceScore = balance * 20;

    // 3. Length/Engagement Factor (0-20 points)
    const avgLength = textMsgs.reduce((acc, m) => acc + (m.text?.length || 0), 0) / textMsgs.length;
    const lengthScore = Math.min(20, avgLength / 5);

    // 4. Sentiment/Emoji Factor (0-20 points)
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u;
    const positiveWords = ['love', 'good', 'great', 'awesome', 'nice', 'happy', 'looking', 'forward', 'yes', 'agree', 'exactly', 'haha', 'lol'];
    let sentimentPoints = 0;
    textMsgs.forEach(m => {
        if (emojiRegex.test(m.text)) sentimentPoints += 2;
        positiveWords.forEach(word => {
            if (m.text?.toLowerCase().includes(word)) sentimentPoints += 1;
        });
    });
    const sentimentScore = Math.min(20, sentimentPoints);

    const total = Math.round(countScore + balanceScore + lengthScore + sentimentScore);
    setVibeScore(Math.min(100, total));
  };

  const handleShareContact = async () => {
    try {
        await api.post(`/conversations/${activeChat.id}/share-contact-request`);
        toast.success("Request sent! 📱");
    } catch (err) {
        toast.error("Failed to send request");
    }
  };

  const handleRespondContact = async (accept, requestId) => {
    try {
        await api.post(`/conversations/${activeChat.id}/respond-contact-share`, { accept, requestId });
        if (accept) {
            toast.success("Contact shared! ✅");
            setIsContactShared(true);
        } else {
            toast("Request declined", { icon: '✖️' });
        }
        fetchMessages(activeChat.id);
    } catch (err) {
        toast.error("Process failed");
    }
  };

  const openVibeAnalysis = () => {
    setIsVibeModalOpen(true);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;

    const newMsg = { id: Date.now(), sender: "me", text: message, time: "Just now", type: "text" };
    setMessages(prev => [...prev, newMsg]);
    const msgText = message;
    setMessage("");

    try {
      await api.post(`/conversations/${activeChat.id}/messages`, { content: msgText, type: "text" });
      // Re-fetch to check for unlock trigger
      setTimeout(() => fetchMessages(activeChat.id), 500);
    } catch (err) {
      console.error("Send message failed:", err);
    }
  };

  const openWhatsApp = (phone) => {
    if (phone) {
      window.open(`https://wa.me/${phone.replace(/[^0-9+]/g, '')}`, '_blank');
    } else {
      toast("Phone number not available yet. Chat here instead!", { icon: '📱' });
    }
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat]);

  // Polling for new messages
  useEffect(() => {
    if (!activeChat) return;
    const interval = setInterval(() => fetchMessages(activeChat.id), 5000);
    return () => clearInterval(interval);
  }, [activeChat]);

  if (loading) return (
    <div className="min-h-screen bg-light flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen pl-0 md:pl-56 flex h-[100dvh] bg-light text-dark">
      <div className="hidden md:block"><Navigation /></div>
      <div className={`md:hidden ${activeChat ? 'hidden' : 'block'}`}><Navigation /></div>

      <div className="flex-1 flex max-h-screen pt-0 overflow-hidden relative z-10 border-l border-gray-100">
        {/* Chat List Sidebar */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 bg-white flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-8 border-b border-gray-50">
            <h2 className="text-2xl font-black mb-6 tracking-tighter text-dark">Messages</h2>
            <input type="text" placeholder="Search conversations..." className="input-premium py-3 rounded-2xl w-full text-sm shadow-none bg-gray-50 border-transparent focus:bg-white" />
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {chats.length === 0 ? (
              <div className="p-8 text-center text-rw-text-soft/60 font-black text-[10px] uppercase tracking-widest leading-loose">
                <Lock className="w-8 h-8 text-rw-text-soft/20 mx-auto mb-4" />
                No active connections yet.
              </div>
            ) : (
              chats.map(chat => (
                <button 
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={`w-full p-5 flex items-center gap-4 hover:bg-gray-50 transition-all border-b border-gray-50 ${activeChat?.id === chat.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
                      {chat.image ? (
                        <img src={chat.image} alt={chat.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300"><User className="w-6 h-6" /></div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-bold text-sm text-dark truncate">{chat.name}</h3>
                    <p className="text-xs truncate text-gray-400 font-medium mt-0.5">Click to view messages</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex flex-col bg-white relative ${activeChat ? 'flex' : 'hidden md:flex'}`}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="h-24 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                  <button className="md:hidden p-2 -ml-2" onClick={() => setActiveChat(null)}>
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                  </button>
                  <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-gray-100 bg-white shadow-sm">
                    {activeChat.image ? (
                      <img src={activeChat.image} alt={activeChat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300"><User className="w-6 h-6" /></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg text-dark tracking-tight leading-tight">{activeChat.name}</h3>
                      {isUnlocked && (
                        <div className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black rounded-full border border-primary/20 animate-pulse uppercase tracking-tighter">
                          {vibeScore}% Vibe
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1">Online Now</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => openWhatsApp()} className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 hover:text-green-600 rounded-2xl transition-all border border-gray-100 shadow-sm" title="WhatsApp">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                  <button className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 hover:text-secondary rounded-2xl transition-all border border-gray-100 shadow-sm">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 hover:text-secondary rounded-2xl transition-all border border-gray-100 shadow-sm">
                    <Phone className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Engagement Banner */}
              {/* Vibe Match Banner */}
              {isUnlocked && (
                <VibeMatchBanner 
                  score={vibeScore}
                  isContactShared={isContactShared}
                  onShareContact={handleShareContact}
                  onVibeMatch={openVibeAnalysis}
                  otherName={activeChat.name}
                />
              )}

              <VibeAnalysisModal 
                isOpen={isVibeModalOpen}
                onClose={() => setIsVibeModalOpen(false)}
                score={vibeScore}
                otherName={activeChat.name}
                messages={messages}
              />

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative z-10">
                <div className="flex justify-center mb-4">
                  <span className="text-[10px] font-bold text-gray-600 bg-white/5 px-3 py-1 rounded-full border border-white/5">Today</span>
                </div>
                
                <div className="space-y-3">
                  {messages.map((msg) => {
                    const isMe = msg.sender === "me";
                    const isSystem = msg.sender === "system";
                    
                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center my-6">
                          <div className="max-w-[80%] text-center">
                            <span className="text-[10px] font-black px-5 py-2.5 rounded-full border flex items-center gap-2.5 mx-auto w-fit bg-gray-50 text-gray-400 border-gray-100">
                              <Lock className="w-3 h-3" /> 
                              {msg.text}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    
                    if (msg.type === 'engagement_unlocked') return null;

                    if (msg.type === 'contact_share_request') {
                      const isReceived = msg.rawSenderId !== user?.profileId;
                      return (
                        <div key={msg.id} className="flex justify-center my-6">
                           <div className="bg-white border-2 border-primary/20 rounded-[32px] p-6 shadow-xl shadow-primary/5 max-w-sm w-full text-center border-dashed">
                             <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                               <ShieldCheck className="w-6 h-6" />
                             </div>
                             <h4 className="text-sm font-black text-dark mb-2">{msg.text}</h4>
                             {isReceived ? (
                               <div className="flex gap-2 mt-4">
                                 <button 
                                   onClick={() => handleRespondContact(false, msg.id)}
                                   className="flex-1 py-3 bg-gray-50 text-gray-500 text-xs font-black rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                                 >
                                   <X className="w-4 h-4" /> Decline
                                 </button>
                                 <button 
                                   onClick={() => handleRespondContact(true, msg.id)}
                                   className="flex-1 py-3 bg-primary text-white text-xs font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                 >
                                   <Check className="w-4 h-4" /> Accept
                                 </button>
                               </div>
                             ) : (
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">Waiting for response...</p>
                             )}
                           </div>
                        </div>
                      );
                    }

                    if (msg.type === 'contact_exchange') {
                       return (
                        <div key={msg.id} className="flex justify-center my-4">
                           <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-3 shadow-sm">
                             <Phone className="w-4 h-4" /> {msg.text}
                             <button onClick={() => openWhatsApp(msg.text.split(': ')[1])} className="p-1.5 bg-white rounded-lg border border-green-100 text-green-600 hover:scale-110 transition-all">
                               <ExternalLink className="w-3 h-3" />
                             </button>
                           </div>
                        </div>
                       );
                    }

                    return (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] md:max-w-[65%] rounded-3xl px-6 py-4 shadow-sm ${isMe ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-tr-none' : 'bg-gray-100 text-dark rounded-tl-none'}`}>
                          <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                          <p className={`text-[9px] text-right mt-2 font-bold uppercase tracking-widest ${isMe ? 'text-white/70' : 'text-gray-400'}`}>{msg.time}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={endOfMessagesRef} className="h-4" />
                </div>
              </div>

              {/* Input Area */}
              <div className="p-6 bg-white border-t border-gray-100 shrink-0 pb-24 md:pb-8 relative z-20">
                <form onSubmit={handleSend} className="flex gap-4 items-center max-w-5xl mx-auto w-full">
                  <button type="button" className="w-12 h-12 flex border border-gray-200 items-center justify-center text-gray-400 hover:text-primary transition-all rounded-2xl bg-white shadow-sm">
                    <Smile className="w-6 h-6" />
                  </button>
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..." 
                    className="flex-1 input-premium py-4 text-sm shadow-none border-gray-200 bg-gray-50 focus:bg-white"
                  />
                  <button 
                    type="submit" 
                    disabled={!message.trim()}
                    className="w-14 h-14 rounded-2xl bg-primary flex justify-center items-center text-white shrink-0 disabled:opacity-30 transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
                  >
                    <Rocket className="w-6 h-6" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 h-full p-8 text-center bg-gray-50">
              <div className="w-28 h-28 rounded-[36px] bg-white shadow-2xl flex items-center justify-center mb-10 animate-float border border-white">
                <Heart className="w-12 h-12 text-primary/20" fill="currentColor" />
              </div>
              <h2 className="text-3xl font-black mb-3 text-dark tracking-tighter">Your Conversations</h2>
              <p className="font-bold text-xs text-gray-400 uppercase tracking-widest">Select a connection to start the magic</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return "Just now";
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
