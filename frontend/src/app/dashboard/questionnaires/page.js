"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { HelpCircle, Send, CheckCircle2, MessageSquare, Clock, User } from "lucide-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("@/components/Navigation"), { ssr: false });

export default function QuestionnairesPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(null);

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/profiles/my-questions');
      const data = response.data?.data || response.data || [];
      setQuestions(data);
    } catch (err) {
      console.error("Failed to fetch questions:", err);
      toast.error("Could not load questionnaires");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSubmit = async (questionId) => {
    const answerText = answers[questionId];
    if (!answerText?.trim()) {
      return toast.error("Please type your answer first.");
    }

    setSubmitting(questionId);
    try {
      await api.post(`/profiles/my-questions/${questionId}/answer`, {
        answer_text: answerText
      });
      toast.success("Answer sent to admin! ✨");
      // Remove the question from the list
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    } catch (err) {
      toast.error("Failed to send answer.");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rw-rose/30 border-t-rw-rose rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pl-0 md:pl-56 bg-transparent text-rw-text-deep">
      <Navigation />
      
      <main className="p-5 md:p-10 max-w-4xl mx-auto pb-32">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold mb-2 text-dark tracking-tighter flex items-center gap-3">
            <HelpCircle className="w-10 h-10 text-primary" /> 
            Admin Questionnaires
          </h1>
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em]">
            Help us understand you better by answering these questions.
          </p>
        </header>

        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {questions.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-outer p-16 text-center bg-white/40 border-white/60 flex flex-col items-center"
              >
                <CheckCircle2 className="w-16 h-16 text-green-400 mb-6" />
                <h2 className="text-xl font-black text-dark uppercase tracking-tighter mb-2">All Caught Up!</h2>
                <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                  There are no pending questions for you at the moment.
                </p>
              </motion.div>
            ) : (
              questions.map((q, index) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-outer p-8 bg-white/80 border-gray-100 rounded-[2.5rem] shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5">
                    <MessageSquare className="w-24 h-24 text-primary" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {new Date(q.created_at).toLocaleDateString()}
                      </div>
                      <div className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase rounded-full tracking-widest flex items-center gap-1.5">
                        <User className="w-3 h-3" /> From Admin
                      </div>
                    </div>

                    <h3 className="text-2xl font-black text-dark leading-tight mb-6">
                      {q.question_text}
                    </h3>

                    <div className="relative">
                      <textarea
                        className="w-full p-6 bg-white border border-gray-100 rounded-3xl focus:ring-4 focus:ring-primary/10 outline-none transition-all text-dark font-medium placeholder:text-gray-300 min-h-[120px] shadow-inner"
                        placeholder="Type your answer here..."
                        value={answers[q.id] || ""}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      />
                      
                      <button
                        onClick={() => handleSubmit(q.id)}
                        disabled={submitting === q.id}
                        className="absolute bottom-4 right-4 btn-premium py-3 px-8 text-[11px] flex items-center gap-2 disabled:opacity-50"
                      >
                        {submitting === q.id ? "Sending..." : (
                          <>
                            Send Answer <Send className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
