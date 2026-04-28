"use client";

import { useState, useEffect, useRef, Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("@/components/Navigation"), { ssr: false });
import { Send, Phone, Video, MoreVertical, Search, Smile, ArrowLeft, Heart, Lock, User, ExternalLink, Rocket, Sparkles, MapPin, ShieldCheck, Plus, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import toast from "react-hot-toast";
import FloatingHearts from "@/components/FloatingHearts";
import VibeMatchBanner from "@/components/VibeMatchBanner";
import VibeAnalysisModal from "@/components/VibeAnalysisModal";

function BondsContent() {
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isVibeModalOpen, setIsVibeModalOpen] = useState(false);
  const [vibeScore, setVibeScore] = useState(0);
  const [chatSearch, setChatSearch] = useState("");
  const endOfMessagesRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const initPage = async () => {
      try {
        const userRes = await api.get('/auth/me');
        const userData = userRes.data?.data?.user || userRes.data?.user;
        useAuthStore.getState().setUser(userData);

        const res = await api.get('/conversations');
        const data = res.data?.data || res.data || [];

        if (Array.isArray(data)) {
          const formattedChats = data.map(c => ({
            id: c.id,
            name: c.otherProfile?.full_name || "User",
            image: c.otherProfile?.profile_photo_url,
            profileId: c.otherProfile?.id,
            location: c.otherProfile?.current_city || "India",
            age: c.otherProfile?.age,
            lastMessageAt: c.lastMessageAt,
            isEngagementUnlocked: c.isEngagementUnlocked,
            isContactShared: c.isContactShared,
            otherProfile: c.otherProfile
          }));
          setChats(formattedChats);

          const autoId = searchParams.get('id');
          if (autoId) {
            const autoChat = formattedChats.find(c => String(c.id) === String(autoId));
            if (autoChat) setActiveChat(autoChat);
          }
        }
      } catch (err) {
        console.error("Bonds init failed:", err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, [router, searchParams]);

  const filteredChats = useMemo(() => {
    return chats.filter(c => c.name?.toLowerCase().includes(chatSearch.toLowerCase()));
  }, [chats, chatSearch]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
      setIsUnlocked(activeChat.isEngagementUnlocked || false);
      setIsShared(activeChat.isContactShared || false);
      const interval = setInterval(() => fetchMessages(activeChat.id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  const fetchMessages = async (conversationId) => {
    try {
      const res = await api.get(`/conversations/${conversationId}/messages`);
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data)) {
        if (data.some(m => m.type === 'engagement_unlocked')) {
          setIsUnlocked(true);
        }
        
        setMessages(data.map(m => {
          const mSenderId = String(m.sender_id).toLowerCase().trim();
          const myId = String(user?.profileId || "").toLowerCase().trim();
          
          // Detect specialized message types by content if 'type' column is missing
          let msgType = m.type;
          if (!msgType) {
            if (m.content?.includes("wants to share contact details") || m.content?.includes("exchange phone numbers")) {
              msgType = "contact_share_request";
            } else if (m.content?.includes("phone:") && m.content?.includes("'s")) {
              msgType = "contact_exchange";
            } else if (m.content?.includes("meaningful level") || m.content?.includes("meaningful level")) {
              msgType = "engagement_unlocked";
            }
          }

          return {
            id: m.id,
            sender: mSenderId === myId ? "me" : "them",
            text: m.content,
            time: formatTime(m.sent_at || m.created_at),
            type: msgType
          };
        }));
        
        const formattedMsgs = data.map(m => ({
            id: m.id,
            sender: String(m.sender_id).toLowerCase().trim() === String(user?.profileId || "").toLowerCase().trim() ? "me" : "them",
            text: m.content,
            type: m.type
        }));
        calculateVibeScore(formattedMsgs);
      }
    } catch (err) { }
  };

  const calculateVibeScore = (msgs) => {
    if (!msgs || msgs.length === 0) return;
    const textMsgs = msgs.filter(m => m.type === 'text' || !m.type);
    const countScore = Math.min(40, textMsgs.length * 2);
    const myMsgs = textMsgs.filter(m => m.sender === 'me').length;
    const theirMsgs = textMsgs.filter(m => m.sender === 'them').length;
    const balance = Math.min(myMsgs, theirMsgs) / Math.max(1, Math.max(myMsgs, theirMsgs));
    const balanceScore = balance * 20;
    const avgLength = textMsgs.reduce((acc, m) => acc + (m.text?.length || 0), 0) / Math.max(1, textMsgs.length);
    const lengthScore = Math.min(20, avgLength / 5);
    const total = Math.round(countScore + balanceScore + lengthScore + 20); // Base resonance
    setVibeScore(Math.min(100, total));
  };

  const handleShareContact = async () => {
    try {
      await api.post(`/conversations/${activeChat.id}/share-contact-request`);
      toast.success("Contact sharing request sent! 📱");
    } catch (err) {
      toast.error("Failed to send request");
    }
  };

  const openVibeAnalysis = () => {
    setIsVibeModalOpen(true);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;

    const msgText = message;
    setMessage("");

    const tempId = Date.now();
    setMessages(prev => [...prev, { id: tempId, sender: "me", text: msgText, time: "Just now" }]);

    try {
      await api.post(`/conversations/${activeChat.id}/messages`, { content: msgText, type: "text" });
      fetchMessages(activeChat.id);
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen pl-0 md:pl-56 bg-light text-dark h-[100dvh] flex flex-col relative overflow-hidden">
      <FloatingHearts opacity={0.1} />
      <Navigation />

      <div className="flex-1 flex overflow-hidden relative z-10 border-l border-gray-100 bg-white">
        {/* Bonds Sidebar */}
        <div className={`w-full md:w-[350px] lg:w-[400px] border-r border-gray-100 flex flex-col bg-white ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-8 pb-6">
            <h1 className="text-4xl font-extrabold text-dark tracking-tighter flex items-center gap-4 mb-2">
              My Bonds 💖
            </h1>
            <p className="text-gray-400 font-bold text-[9px] uppercase tracking-[0.3em] mb-8">Active soulmate connections</p>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search bonds..." 
                className="input-premium pl-12 py-3.5 text-xs bg-gray-50/50 border-transparent focus:bg-white shadow-none" 
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-2 pb-10">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                <div className="w-20 h-20 bg-primary/5 rounded-[30px] flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-primary/20" />
                </div>
                <h3 className="text-lg font-black text-dark tracking-tight mb-2">No {chatSearch ? 'Matching' : ''} Bonds Found</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                  {chatSearch ? `We couldn't find any bond named "${chatSearch}"` : 'No active connections yet.'}
                </p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all duration-300 ${activeChat?.id === chat.id ? 'bg-primary/5 shadow-sm border-l-4 border-l-primary' : 'hover:bg-gray-50'}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white bg-gray-100 shadow-sm">
                      {chat.image ? (
                        <img src={chat.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><User className="w-6 h-6 text-gray-300" /></div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className="font-black text-sm text-dark truncate">{chat.name}</h4>
                      <span className="text-[9px] font-bold text-gray-300 uppercase shrink-0">Now</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold truncate flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> {chat.location} • {chat.age || '25'}y
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Messaging Area */}
        <div className={`flex-1 flex flex-col bg-white relative ${activeChat ? 'flex' : 'hidden md:flex'}`}>
          {activeChat ? (
            <>
              {/* Active Header */}
              <header className="h-24 border-b border-gray-50 flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                  <button className="md:hidden p-2 -ml-2" onClick={() => setActiveChat(null)}>
                    <ArrowLeft className="w-6 h-6 text-dark" />
                  </button>
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-gray-100 bg-white">
                    {activeChat.image ? (
                      <img src={activeChat.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300"><User className="w-5 h-5" /></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-dark tracking-tighter leading-tight flex items-center gap-2">
                      {activeChat.name} <ShieldCheck className="w-4 h-4 text-green-500" />
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => router.push(`/profile/${activeChat.profileId}`)} className="p-3 rounded-2xl hover:bg-gray-50 text-gray-400 hover:text-primary transition-all shadow-sm border border-gray-50" title="View Identity">
                    <User className="w-5 h-5" />
                  </button>
                  <button className="p-3 rounded-2xl hover:bg-gray-50 text-gray-400 transition-all shadow-sm border border-gray-50">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </header>

              {/* Vibe Match Banner */}
              {isUnlocked && (
                <div className="px-8 mt-6">
                  <VibeMatchBanner 
                    score={vibeScore}
                    isContactShared={isShared}
                    onShareContact={handleShareContact}
                    onVibeMatch={openVibeAnalysis}
                    otherName={activeChat.name}
                  />
                </div>
              )}

              <VibeAnalysisModal 
                isOpen={isVibeModalOpen}
                onClose={() => setIsVibeModalOpen(false)}
                score={vibeScore}
                otherName={activeChat.name}
                messages={messages}
              />

              {/* Bubbles */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar space-y-6">
                <div className="flex justify-center mb-8">
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100/50 px-4 py-1.5 rounded-full border border-gray-200/50">
                    Conversation Start
                  </span>
                </div>

                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-30 select-none pointer-events-none">
                    <Rocket className="w-16 h-16 text-primary mb-6 animate-float" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-dark">Propelling your first message...</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender === "me";

                    if (msg.type === 'engagement_unlocked') return null;

                    if (msg.type === 'contact_share_request') {
                      return (
                        <div key={msg.id} className="flex justify-center my-8">
                           <div className="bg-white border-2 border-[#AC002F]/10 rounded-[2.5rem] p-8 shadow-2xl max-w-sm w-full text-center relative overflow-hidden group">
                             <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                             <div className="w-16 h-16 bg-primary/10 rounded-[24px] flex items-center justify-center text-primary mx-auto mb-6 relative z-10">
                               <ShieldCheck className="w-8 h-8" />
                             </div>
                             <h4 className="text-sm font-black text-dark mb-3 relative z-10">{msg.text}</h4>
                             {isMe ? (
                               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest relative z-10 mt-6">Awaiting their response...</p>
                             ) : (
                               <div className="flex gap-3 mt-8 relative z-10">
                                 <button onClick={() => api.post(`/conversations/${activeChat.id}/respond-contact-share`, { accept: false, requestId: msg.id })} className="flex-1 py-3.5 bg-gray-50 text-gray-500 text-[10px] font-black rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-widest">
                                   Decline
                                 </button>
                                 <button onClick={() => api.post(`/conversations/${activeChat.id}/respond-contact-share`, { accept: true, requestId: msg.id })} className="flex-1 py-3.5 bg-[#AC002F] text-white text-[10px] font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all uppercase tracking-widest">
                                   Accept
                                 </button>
                                </div>
                             )}
                           </div>
                        </div>
                      );
                    }

                    if (msg.type === 'contact_exchange') {
                      return (
                        <div key={msg.id} className="flex justify-center my-6">
                           <div className="bg-green-50 border border-green-100 px-8 py-4 rounded-[1.8rem] flex items-center gap-4 shadow-sm">
                             <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                               <Phone className="w-4 h-4" />
                             </div>
                             <div>
                               <p className="text-[9px] font-black text-green-600 uppercase tracking-[0.2em] mb-1">Contact Details Exchanged</p>
                               <span className="text-sm font-black text-dark">{msg.text}</span>
                             </div>
                           </div>
                        </div>
                      );
                    }

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}
                      >
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%]`}>
                          <div className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isMe && (
                              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-100 mb-1">
                                {activeChat.image ? (
                                  <img src={activeChat.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300"><User className="w-4 h-4" /></div>
                                )}
                              </div>
                            )}
                            <div className={`p-4 md:p-5 rounded-[1.8rem] shadow-sm relative ${isMe ? 'bg-[#AC002F] text-white rounded-tr-none' : 'bg-[#E8E8E8] text-[#1C1C1E] rounded-tl-none'}`}>
                              <p className="text-sm font-medium leading-[1.6]">{msg.text}</p>
                            </div>
                          </div>
                          <p className={`text-[9px] font-bold text-gray-400 mt-1.5 flex items-center gap-1.5 ${isMe ? 'mr-1' : 'ml-11'}`}>
                            {msg.time} {isMe && <CheckCheck className="w-3 h-3 text-[#AC002F]" />}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={endOfMessagesRef} className="h-4" />
              </div>

              {/* Input Area */}
              <div className="p-8 border-t border-gray-50 bg-white shrink-0 pb-32 md:pb-8 relative z-20">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-4 items-center">
                  <div className="flex-1 relative flex items-center gap-3 bg-gray-50/50 border border-gray-100 rounded-3xl px-4 py-2 focus-within:bg-white focus-within:border-primary/20 transition-all duration-300">
                    <button type="button" className="p-2 bg-gray-200/50 rounded-full text-dark hover:bg-gray-200 transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent py-3 text-sm outline-none font-medium placeholder:text-gray-400"
                    />
                    <button type="button" className="text-gray-400 hover:text-primary transition-colors">
                      <Smile className="w-6 h-6" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="w-14 h-14 bg-gradient-to-tr from-[#AC002F] to-[#7B2FF7] rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-20 transition-all duration-500"
                  >
                    <Send className="w-6 h-6 -rotate-12 translate-x-0.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/30">
              <div className="w-32 h-32 bg-white rounded-[45px] shadow-2xl flex items-center justify-center mb-10 border border-gray-100 relative group overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 group-hover:scale-125 transition-transform duration-700"></div>
                <Heart className="w-12 h-12 text-primary opacity-20 relative z-10" fill="currentColor" />
              </div>
              <h2 className="text-3xl font-black text-dark tracking-tighter mb-4">Engage Your Bonds</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">Select one of your established soulmate connections from the left to start manifesting your future together.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BondsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Suspense fallback={<div className="min-h-screen bg-light" />}>
      <BondsContent />
    </Suspense>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return "Now";
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
