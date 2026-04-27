"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("@/components/Navigation"), { ssr: false });
import MatchSearchSidebar from "@/components/MatchSearchSidebar";
import { Search, Filter, Heart, ChevronDown, Lock, User, MapPin, Briefcase, GraduationCap, X } from "lucide-react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import Link from "next/link";
import toast from "react-hot-toast";

export default function MatchesPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shortlistedIds, setShortlistedIds] = useState(new Set());
  const [profilePct, setProfilePct] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Filter States
  const [filters, setFilters] = useState({
    ageRange: [18, 60],
    religion: "",
    caste: "",
    profession: "",
    place: "",
    lookingFor: "Bride",
    heightRange: [140, 210],
    education: "",
    income: "",
    familyType: "",
    interest: ""
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("You must register or log in to view matches!", { id: 'auth' });
      router.push('/login');
      return;
    }

    const fetchMatches = async () => {
      try {
        const authRes = await api.get('/auth/me');
        const userData = authRes.data?.data?.user || authRes.data?.user;
        if (!userData) {
          router.push('/login');
          return;
        }

        setProfilePct(userData.profile_complete_pct || 0);

        const [matchesRes, intRes] = await Promise.all([
          api.get('/matches'),
          api.get('/interests/outgoing')
        ]);

        const returnedData = matchesRes.data?.data || matchesRes.data || [];
        setMatches(Array.isArray(returnedData) ? returnedData : []);

        const outgoing = intRes.data?.data?.interests || intRes.data?.interests || [];
        const ids = new Set(outgoing.map(i => i.to_profile?.id || i.to_profile));
        setShortlistedIds(ids);

      } catch (err) {
        console.error("Matches fetch failed:", err);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [router]);

  const handleShortlist = async (profileId) => {
    if (shortlistedIds.has(profileId)) return;

    try {
      await api.post('/interests', { to_profile_id: profileId, type: 'shortlist' });
      setShortlistedIds(prev => new Set([...prev, profileId]));
      toast.success("Added to Interested! 💕", { icon: '💖' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update interest");
    }
  };

  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      const matchesSearch = match.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           match.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           match.profession?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchAge = match.age || 25;
      const matchesAge = matchAge >= filters.ageRange[0] && matchAge <= filters.ageRange[1];
      const matchesReligion = !filters.religion || match.religion?.toLowerCase() === filters.religion.toLowerCase();
      const matchesCaste = !filters.caste || match.caste?.toLowerCase() === filters.caste.toLowerCase();
      const matchesProfession = !filters.profession || match.profession?.toLowerCase().includes(filters.profession.toLowerCase());
      const matchesPlace = !filters.place || match.location?.toLowerCase().includes(filters.place.toLowerCase());
      
      const matchHeight = match.height_cm || 165;
      const matchesHeight = matchHeight >= (filters.heightRange?.[0] || 140) && matchHeight <= (filters.heightRange?.[1] || 210);
      
      const matchesEducation = !filters.education || match.education_level?.toLowerCase() === filters.education.toLowerCase();
      const matchesIncome = !filters.income || match.income?.toLowerCase() === filters.income.toLowerCase();
      const matchesFamily = !filters.familyType || match.family_type?.toLowerCase() === filters.familyType.toLowerCase();
      const matchesInterest = !filters.interest || (match.interests || []).includes(filters.interest) || (match.hobbies || []).includes(filters.interest);

      // Filter by Looking For (Gender)
      const matchesLookingFor = true; 

      return matchesSearch && matchesAge && matchesReligion && matchesCaste && matchesProfession && matchesPlace && matchesHeight && matchesEducation && matchesIncome && matchesFamily && matchesInterest;
    });
  }, [matches, searchQuery, filters]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <Heart className="absolute inset-0 m-auto w-6 h-6 text-primary animate-heart-pulse" fill="currentColor" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pl-0 md:pl-56 flex flex-col text-gray-600 bg-light">
      <Navigation />

      {/* Main Content */}
      <main className="flex-1 p-5 md:p-10 flex flex-col z-10 w-full max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Left Sidebar Filter */}
          <MatchSearchSidebar filters={filters} setFilters={setFilters} />

          {/* Right Content Area */}
          <div className="flex-1 w-full">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
              <div>
                <h1 className="text-4xl font-extrabold mb-1 text-dark tracking-tighter">Discover Matches</h1>
                <p className="text-black/60 font-black text-[11px] uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                  Verified Professional Profiles
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 lg:items-center">
                {/* Search Bar */}
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search by name, place, job..." 
                    className="input-premium pl-12 py-3.5 text-xs min-w-[320px] w-full shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </header>

            <div className="flex-1 pb-24">
              {profilePct < 100 ? (
                <div className="glass-outer p-12 bg-white border-gray-100 text-center max-w-lg mx-auto mt-12 shadow-2xl">
                  <Lock className="w-20 h-20 text-primary mx-auto mb-6" />
                  <h3 className="text-2xl font-extrabold text-dark mb-3 tracking-tight">Profile Incomplete ( {profilePct}% )</h3>
                  <p className="text-gray-500 text-sm mb-8 font-medium leading-relaxed">Requirement: You must complete 100% of your profile setup to view and be visible in the matches section.</p>
                  <Link href="/profile" className="btn-premium py-4 px-12 text-sm font-bold inline-flex items-center gap-3">
                    <User className="w-6 h-6" /> Complete Your Profile
                  </Link>
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className="glass-outer p-16 text-center max-w-2xl mx-auto">
                  <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-8 h-8 text-rw-text-soft/30" />
                  </div>
                  <h3 className="text-2xl font-black text-black mb-2 uppercase tracking-tighter">No Matches Found</h3>
                  <p className="text-black/60 text-sm font-bold mb-8">We couldn't find any profiles matching your current filters. Try broadening your criteria!</p>
                  <button 
                    onClick={() => setSearchQuery("") || setFilters({ ageRange: [18, 60], religion: "", caste: "", profession: "", place: "", lookingFor: "Bride", heightRange: [140, 210], education: "", income: "", familyType: "", interest: "" })}
                    className="btn-premium px-10 py-4"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {filteredMatches.map((match, i) => (
                    <motion.div 
                      key={match.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.3, delay: (i % 10) * 0.05 }}
                      className="glass-outer group p-0 relative overflow-hidden border-gray-100 bg-white shadow-lg flex flex-col"
                      style={{ aspectRatio: '1/1.1' }}
                    >
                      {/* Top: Image Section */}
                      <div className="relative flex-1 overflow-hidden">
                        <div className="w-full h-full group-hover:blur-[1px] transition-all duration-500">
                          {match.image ? (
                            <img src={match.image} alt={match.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                          ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                              <User className="w-20 h-20 text-gray-200" />
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/20 to-transparent opacity-70"></div>

                          <div className="absolute inset-x-5 bottom-5 flex flex-col justify-end pointer-events-none">
                            <h3 className="text-lg font-black text-white leading-none tracking-tight mb-2 truncate drop-shadow-xl">
                              {match.name}, {match.age || '25'}
                            </h3>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-primary-gradient uppercase tracking-widest drop-shadow-lg">
                              <MapPin className="w-3.5 h-3.5" /> {match.location || "India"}
                            </div>
                          </div>
                        </div>
                        
                        <Link 
                          href={`/profile/${match.id}`}
                          className="absolute inset-0 flex items-center justify-center bg-dark/30 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]"
                        >
                          <span className="btn-premium px-8 py-3 rounded-full text-[11px] transform scale-50 group-hover:scale-100 transition-transform duration-300">
                            View Profile
                          </span>
                        </Link>
                      </div>

                      {/* Bottom: Details Section */}
                      <div className="bg-white p-5 flex justify-between items-center h-20">
                        <div className="flex flex-col gap-1 overflow-hidden">
                            <div className="flex items-center gap-2 text-[10px] font-black text-black/60 uppercase tracking-tighter truncate">
                              <Briefcase className="w-3 h-3 text-secondary" /> {match.profession || "Professional"}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-black/60 uppercase tracking-tighter truncate">
                              <Heart className="w-3 h-3 text-primary" /> {match.religion || "Hindu"}
                            </div>
                        </div>

                        <button 
                            onClick={(e) => { e.preventDefault(); handleShortlist(match.id); }}
                            className={`p-4 rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-sm ${
                            shortlistedIds.has(match.id)
                              ? 'bg-primary text-white shadow-primary/20'
                              : 'bg-gray-50 text-gray-300 hover:text-primary hover:bg-primary/5'
                            }`}
                            title="Add to Interested"
                        >
                            <Heart className={`w-5 h-5 ${shortlistedIds.has(match.id) ? 'fill-current' : ''}`} strokeWidth={2.5} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
