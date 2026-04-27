import { Inter } from "next/font/google";
import ClientShell from "@/components/ClientShell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata = {
  title: "RishtaWaala | Find Your Perfect Rishta ❤️",
  description: "A premium matchmaking platform for authentic connections. Find your partner securely and intuitively.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
       <body className="antialiased font-inter">
         <ClientShell>
           {children}
         </ClientShell>
       </body>
    </html>
  );
}
