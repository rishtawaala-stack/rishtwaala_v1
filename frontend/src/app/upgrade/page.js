"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("@/components/Navigation"), { ssr: false });
import { Check, Star, Shield, Search, Zap, Crown, UserPlus } from "lucide-react";
import Link from "next/link";

export default function SubscriptionPage() {
  const plans = [
    {
      name: "Silver",
      price: "₹1,499",
      duration: "1 Month",
      features: [
        "View 50 full profiles",
        "Send 10 interests",
        "Basic chat features",
        "See who visited you"
      ],
      popular: false,
      accent: "from-gray-100 to-gray-200"
    },
    {
      name: "Gold",
      price: "₹3,999",
      duration: "3 Months",
      features: [
        "Unlimited profile views",
        "Send 50 interests",
        "Connect directly via chat",
        "See who visited you",
        "Priority customer support"
      ],
      popular: true,
      accent: "from-primary to-secondary"
    },
    {
      name: "Diamond",
      price: "₹6,999",
      duration: "6 Months",
      features: [
        "All Gold features",
        "Send unlimited interests",
        "Contact number visibility",
        "Dedicated relationship manager",
        "Profile highlighted in search"
      ],
      popular: false,
      accent: "from-dark to-primary"
    }
  ];

  return (
    <div className="min-h-screen pl-0 md:pl-56 flex flex-col bg-light text-dark">
      <Navigation />
      
      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full pb-32">
        <header className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full glass-inner border-primary/20 bg-primary/5 text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-10"
          >
            <Crown className="w-4 h-4 fill-current" /> Premium Tiers
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tighter leading-tight"
          >
            Upgrade your <span className="text-primary font-black italic">Search.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest max-w-2xl mx-auto leading-relaxed"
          >
            Gain exclusive access to professional profiles and direct connections. 
            Premium members see 10x higher engagement and successful heartbeats.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full mb-20">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className={`glass-outer relative flex flex-col overflow-hidden border-gray-100 bg-white group hover:shadow-2xl transition-all rounded-[2rem] ${plan.popular ? 'border-primary/20 scale-100 md:scale-110 shadow-2xl z-10' : 'scale-95 opacity-90 hover:opacity-100 shadow-lg'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary to-secondary"></div>
              )}
              {plan.popular && (
                <div className="absolute top-8 right-[-35px] bg-primary text-white text-[9px] font-bold px-12 py-2 rotate-45 transform origin-center shadow-xl tracking-widest uppercase">
                  RECOMMENDED
                </div>
              )}
              
              <div className="p-10 text-center border-b border-gray-50">
                <h3 className={`text-4xl font-extrabold tracking-tighter mb-4 ${plan.popular ? 'text-primary' : 'text-gray-300'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-end justify-center gap-1 mb-2">
                  <span className="text-5xl font-black text-dark tracking-tighter">{plan.price}</span>
                </div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Plan Duration: {plan.duration}</p>
              </div>
              
              <div className="p-10 flex-1 flex flex-col justify-between">
                <ul className="space-y-6 mb-12">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-[11px] font-bold uppercase tracking-tight text-gray-500">
                      <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${plan.popular ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-300'}`}>
                        <Check className="w-4 h-4" strokeWidth={3} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-xl active:scale-95 ${
                  plan.popular 
                    ? 'btn-premium' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100'
                }`}>
                  Get {plan.name} Access
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* trust indicators */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10 text-center max-w-5xl mx-auto glass-inner p-12 border-gray-100 bg-white rounded-[3rem] shadow-xl">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-[24px] bg-gray-50 flex items-center justify-center mb-6 text-green-500 border border-gray-100">
              <Shield className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold mb-3 uppercase tracking-widest leading-none">Secure Payments</h4>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-relaxed">Razorpay encrypted transactions.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-[24px] bg-gray-50 flex items-center justify-center mb-6 text-secondary border border-gray-100">
              <Zap className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold mb-3 uppercase tracking-widest leading-none">Instant Visibility</h4>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-relaxed">Profile highlighted for premium recruiters.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-[24px] bg-gray-50 flex items-center justify-center mb-6 text-primary border border-gray-100">
              <Star className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold mb-3 uppercase tracking-widest leading-none">Elite Verification</h4>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-relaxed">Diamond badge for trust & authenticity.</p>
          </div>
        </div>

        <div className="mt-20 text-center">
            <p className="text-[9px] text-gray-400/40 font-bold uppercase tracking-[0.4em]">Rishtawaala Secure Payment Gateway • Licensed Provider</p>
        </div>
      </main>
    </div>
  );
}
