"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("@/components/Navigation"), { ssr: false });
import { Heart, Quote, Star, Plane, CheckCircle2 } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import useAuthStore from "@/store/useAuthStore";

export default function SuccessStoriesPage() {
  const [stories, setStories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    partnerName: "",
    marriageDate: "",
    story: "",
    rating: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Fetch live stories from backend
    const fetchStories = async () => {
      try {
        const res = await api.get('/success-stories').catch(() => null);
        if (res && res.data) {
          setStories(res.data);
        } else {
          // Fallback if backend route isn't fully implemented yet
          setStories([
            {
              id: 1,
              names: "Rahul & Anjali",
              date: "Married on Oct 12, 2025",
              quote: "We connected on RishtaWaala last year. The compatibility score was 98%, and from our very first chat, we knew it was right. Thank you for making our forever possible!",
              image: "https://images.unsplash.com/photo-1583939000140-5e7e17cd2bca?q=80&w=800&auto=format&fit=crop",
              stars: 5,
              honeymoonTicket: true
            }
          ]);
        }
      } catch (err) {}
    };
    fetchStories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.loading("Publishing your love story...", { id: 'story' });

    try {
      await api.post('/success-stories', formData);
      toast.success("Congratulations! Your story is live. You might win a Honeymoon Ticket!", { id: 'story', duration: 4000 });
      setShowForm(false);
      // Optimistic upate
      setStories(prev => [{
        id: Date.now(),
        names: `${user?.name || 'You'} & ${formData.partnerName}`,
        date: `Married on ${new Date(formData.marriageDate).toLocaleDateString()}`,
        quote: formData.story,
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
        stars: formData.rating,
        honeymoonTicket: formData.rating === 5 // Logic for honeymoon ticket
      }, ...prev]);
    } catch (err) {
      toast.error("Oops, the backend needs a moment to catch your romance.", { id: 'story' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pl-0 md:pl-64 flex flex-col relative bg-gray-50 text-gray-800">
      <Navigation />
      
      <main className="flex-1 p-6 md:p-12 z-10 w-full max-w-7xl mx-auto">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-rw-pink to-rw-purple flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rw-pink/30"
          >
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black mb-4 text-gray-900"
          >
            Millions of Members.<br />Countless Success Stories.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg font-medium"
          >
            Witness the beautiful journeys of couples who found their soulmates on RishtaWaala. Your story could be next.
          </motion.p>
        </header>

        <div className="space-y-16">
          {stories.map((story, i) => (
            <motion.div 
              key={story.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col ${i % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm group hover:border-rw-pink/40 hover:shadow-xl transition-all duration-500`}
            >
              <div className="w-full md:w-1/2 h-64 md:h-96 rounded-2xl overflow-hidden relative shadow-lg">
                <img src={story.image} alt={story.names} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                {story.honeymoonTicket && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-sm text-rw-purple flex items-center gap-2 shadow-md">
                    <Plane className="w-4 h-4" /> Won Honeymoon Ticket
                  </div>
                )}
              </div>
              
              <div className="w-full md:w-1/2 md:px-8 flex flex-col justify-center">
                <Quote className="w-12 h-12 text-rw-pink/30 mb-4" />
                <p className="text-xl md:text-2xl font-medium leading-relaxed text-gray-700 mb-6 italic">"{story.quote}"</p>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{story.names}</h3>
                  <p className="text-rw-pink font-semibold mb-3">{story.date}</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className={`w-5 h-5 ${idx < (story.stars || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 glass-panel p-8 md:p-12 relative overflow-hidden bg-white/80 border border-gray-200"
        >
          {!showForm ? (
            <div className="text-center relative z-10">
              <h2 className="text-3xl font-black mb-4 text-gray-900">Are you our next success story?</h2>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto font-medium">Have you gotten married through RishtaWaala? Both partners can now add their story. If it's featured, you win a ticket to your Honeymoon!</p>
              <button onClick={() => setShowForm(true)} className="btn-primary shadow-[0_4px_20px_rgba(255,77,141,0.3)]">
                Share Your Story & Win
              </button>
            </div>
          ) : (
             <form onSubmit={handleSubmit} className="relative z-10 max-w-2xl mx-auto text-left">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-2xl font-black text-gray-900">Tell Us Your Love Story</h3>
                   <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-800">Cancel</button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700">Partner's Name</label>
                    <input type="text" required onChange={e => setFormData({...formData, partnerName: e.target.value})} className="input-glass mt-1 bg-white border-gray-200" placeholder="e.g. Priya" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700">Date of Marriage</label>
                    <input type="date" required onChange={e => setFormData({...formData, marriageDate: e.target.value})} className="input-glass mt-1 bg-white border-gray-200" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700">Your Journey / Story</label>
                    <textarea required onChange={e => setFormData({...formData, story: e.target.value})} className="input-glass mt-1 min-h-[120px] bg-white border-gray-200 resize-none" placeholder="We met on RishtaWaala and..."></textarea>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Rate Your Experience</label>
                    <div className="flex gap-2 cursor-pointer">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} onClick={() => setFormData({...formData, rating: star})} className={`w-8 h-8 ${formData.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="bg-rw-pink/10 rounded-xl p-4 flex items-start gap-4 mb-6 border border-rw-pink/20">
                     <Plane className="w-6 h-6 text-rw-pink shrink-0" />
                     <p className="text-sm text-gray-800 font-medium">Stories rated 5-stars with great detail are eligible for our monthly <strong>Honeymoon Ticket Giveaway</strong>!</p>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-4 text-lg">
                    {isSubmitting ? "Submitting..." : "Publish & Enter Giveaway"}
                  </button>
                </div>
             </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}
