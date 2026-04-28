import { Plus_Jakarta_Sans, Inter } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: '--font-plus-jakarta' 
});

const inter = Inter({ 
  subsets: ["latin"], 
  variable: '--font-inter' 
});

export const metadata = {
  title: "Rishtawaala Admin Portal",
  description: "Secure Administrative Command Center",
};

export default function AdminLayout({ children }) {
  return (
    <div className={`${plusJakarta.variable} ${inter.variable} min-h-screen bg-[#f8fafc]`}>
      {children}
    </div>
  );
}
