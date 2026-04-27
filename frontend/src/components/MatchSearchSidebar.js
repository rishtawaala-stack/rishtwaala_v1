"use client";

import { Search, ChevronDown, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { CASTE_LIST } from "@/lib/constants";

export default function MatchSearchSidebar({ filters, setFilters }) {
  const religions = ["Hindu", "Muslim", "Sikh", "Christian", "Jain", "Parsi", "Buddhist"];
  const locations = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune"];
  const educations = ["Bachelors", "Masters", "Doctorate", "Diploma", "Secondary", "Higher Secondary"];
  const incomes = ["Below 2L", "2L - 5L", "5L - 10L", "10L - 25L", "25L - 50L", "50L - 1Cr", "Above 1Cr"];
  const familyTypes = ["Nuclear Family", "Joint Family", "Extended Family"];
  const interestOptions = ["Cooking", "Gaming", "Traveling", "Reading", "Music", "Photography", "Painting", "Dancing", "Gardening", "Trekking", "Movies", "Yoga", "Gym", "Cycling", "Swimming", "Coding", "Writing", "Singing", "Acting", "Shopping"];
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAgeChange = (index, value) => {
    const newAgeRange = [...filters.ageRange];
    newAgeRange[index] = parseInt(value) || (index === 0 ? 18 : 60);
    handleFilterChange('ageRange', newAgeRange);
  };

  const handleHeightChange = (index, value) => {
    const newHeightRange = [...(filters.heightRange || [140, 210])];
    newHeightRange[index] = parseInt(value) || (index === 0 ? 140 : 210);
    handleFilterChange('heightRange', newHeightRange);
  };

  return (
    <div className="w-full lg:w-[340px] shrink-0">
      <div className="glass-outer p-8 bg-white border-rw-light shadow-2xl space-y-7 sticky top-28">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-dark tracking-tight leading-none">Find Your<br/><span className="text-primary">Match</span></h2>
        </div>

        <div className="space-y-6">
          {/* Looking For & Age Row */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-black uppercase tracking-[0.15em] ml-1">Looking for</label>
              <div className="relative group">
                <select 
                  className="input-premium !py-3 !px-4 !text-xs appearance-none pr-10 cursor-pointer bg-gray-50/50 hover:bg-white transition-colors"
                  value={filters.lookingFor || ""}
                  onChange={(e) => handleFilterChange('lookingFor', e.target.value)}
                >
                  <option value="Bride">Bride</option>
                  <option value="Groom">Groom</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-black uppercase tracking-[0.15em] ml-1">Age Range</label>
              <div className="flex items-center gap-2">
                <select 
                  className="input-premium !py-3 !px-2 !text-xs appearance-none cursor-pointer text-center bg-gray-50/50 hover:bg-white"
                  value={filters.ageRange[0]}
                  onChange={(e) => handleAgeChange(0, e.target.value)}
                >
                  {[...Array(43)].map((_, i) => (
                    <option key={i + 18} value={i + 18}>{i + 18}</option>
                  ))}
                </select>
                <span className="text-gray-300 text-[10px] font-bold uppercase">to</span>
                <select 
                  className="input-premium !py-3 !px-2 !text-xs appearance-none cursor-pointer text-center bg-gray-50/50 hover:bg-white"
                  value={filters.ageRange[1]}
                  onChange={(e) => handleAgeChange(1, e.target.value)}
                >
                  {[...Array(43)].map((_, i) => (
                    <option key={i + 18} value={i + 18}>{i + 18}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Religion */}
          <div className="flex items-center gap-4 group">
            <label className="text-[10px] font-black text-black uppercase tracking-[0.15em] w-16 shrink-0">Religion</label>
            <div className="relative flex-1">
              <select 
                className="input-premium !py-3.5 !px-5 !text-xs appearance-none pr-10 cursor-pointer bg-gray-50/50 hover:bg-white"
                value={filters.religion || ""}
                onChange={(e) => handleFilterChange('religion', e.target.value)}
              >
                <option value="">Select Religion</option>
                {religions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-primary transition-colors" />
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-4 group">
            <label className="text-[10px] font-black text-black uppercase tracking-[0.15em] w-16 shrink-0">Location</label>
            <div className="relative flex-1">
              <select 
                className="input-premium !py-3.5 !px-5 !text-xs appearance-none pr-10 cursor-pointer bg-gray-50/50 hover:bg-white"
                value={filters.place || ""}
                onChange={(e) => handleFilterChange('place', e.target.value)}
              >
                <option value="">Select Location</option>
                {locations.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-primary transition-colors" />
            </div>
          </div>

          {/* Caste */}
          <div className="flex items-center gap-4 group">
            <label className="text-[10px] font-black text-black uppercase tracking-[0.15em] w-16 shrink-0">Caste</label>
            <div className="relative flex-1">
              <select 
                className="input-premium !py-3.5 !px-5 !text-xs appearance-none pr-10 cursor-pointer bg-gray-50/50 hover:bg-white"
                value={filters.caste || ""}
                onChange={(e) => handleFilterChange('caste', e.target.value)}
              >
                <option value="">Select Caste</option>
                {CASTE_LIST.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-primary transition-colors" />
            </div>
          </div>

          {/* Height Range */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-black uppercase tracking-[0.15em] ml-1">Height Range (cm)</label>
            <div className="flex items-center gap-2">
              <select 
                className="input-premium !py-3 !px-2 !text-xs appearance-none cursor-pointer text-center bg-gray-50/50 hover:bg-white"
                value={filters.heightRange?.[0] || 140}
                onChange={(e) => handleHeightChange(0, e.target.value)}
              >
                {[...Array(81)].map((_, i) => (
                  <option key={i + 140} value={i + 140}>{i + 140}</option>
                ))}
              </select>
              <span className="text-gray-300 text-[10px] font-bold uppercase">to</span>
              <select 
                className="input-premium !py-3 !px-2 !text-xs appearance-none cursor-pointer text-center bg-gray-50/50 hover:bg-white"
                value={filters.heightRange?.[1] || 210}
                onChange={(e) => handleHeightChange(1, e.target.value)}
              >
                {[...Array(81)].map((_, i) => (
                  <option key={i + 140} value={i + 140}>{i + 140}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Education */}
          <div className="flex items-center gap-4 group">
            <label className="text-[10px] font-black text-black uppercase tracking-[0.15em] w-16 shrink-0">Education</label>
            <div className="relative flex-1">
              <select 
                className="input-premium !py-3.5 !px-5 !text-xs appearance-none pr-10 cursor-pointer bg-gray-50/50 hover:bg-white"
                value={filters.education || ""}
                onChange={(e) => handleFilterChange('education', e.target.value)}
              >
                <option value="">Select Education</option>
                {educations.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-primary transition-colors" />
            </div>
          </div>

          {/* Income */}
          <div className="flex items-center gap-4 group">
            <label className="text-[10px] font-black text-black uppercase tracking-[0.15em] w-16 shrink-0">Salary / Income</label>
            <div className="relative flex-1">
              <select 
                className="input-premium !py-3.5 !px-5 !text-xs appearance-none pr-10 cursor-pointer bg-gray-50/50 hover:bg-white"
                value={filters.income || ""}
                onChange={(e) => handleFilterChange('income', e.target.value)}
              >
                <option value="">Select Income</option>
                {incomes.map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-primary transition-colors" />
            </div>
          </div>

          {/* Family Type */}
          <div className="flex items-center gap-4 group">
            <label className="text-[10px] font-black text-black uppercase tracking-[0.15em] w-16 shrink-0">Family</label>
            <div className="relative flex-1">
              <select 
                className="input-premium !py-3.5 !px-5 !text-xs appearance-none pr-10 cursor-pointer bg-gray-50/50 hover:bg-white"
                value={filters.familyType || ""}
                onChange={(e) => handleFilterChange('familyType', e.target.value)}
              >
                <option value="">Select Family Type</option>
                {familyTypes.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-primary transition-colors" />
            </div>
          </div>

          {/* Interests */}
          <div className="flex items-center gap-4 group">
            <label className="text-[10px] font-black text-black uppercase tracking-[0.15em] w-16 shrink-0">Interest</label>
            <div className="relative flex-1">
              <select 
                className="input-premium !py-3.5 !px-5 !text-xs appearance-none pr-10 cursor-pointer bg-gray-50/50 hover:bg-white"
                value={filters.interest || ""}
                onChange={(e) => handleFilterChange('interest', e.target.value)}
              >
                <option value="">Select Interest</option>
                {interestOptions.map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button className="w-full py-5 rounded-[20px] bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.03] active:scale-[0.97] transition-all duration-500 mt-4 uppercase tracking-widest">
          Search Now
        </button>

        {/* Footer Link */}
        <div className="flex justify-center pt-4 border-t border-gray-50">
          <button className="flex items-center gap-3 text-[11px] font-black text-black/60 hover:text-primary uppercase tracking-[0.2em] transition-all group">
            <div className="w-5 h-5 border-2 border-gray-200 group-hover:border-primary/40 rounded-md flex flex-wrap p-1 gap-0.5 transition-colors">
              <div className="w-1.5 h-1.5 bg-gray-200 group-hover:bg-primary transition-colors rounded-[1px]"></div>
              <div className="w-1.5 h-1.5 bg-gray-200 group-hover:bg-primary transition-colors rounded-[1px]"></div>
              <div className="w-1.5 h-1.5 bg-gray-200 group-hover:bg-primary transition-colors rounded-[1px]"></div>
              <div className="w-1.5 h-1.5 bg-gray-200 group-hover:bg-primary transition-colors rounded-[1px]"></div>
            </div>
            Advanced Search
          </button>
        </div>
      </div>
    </div>
  );
}
