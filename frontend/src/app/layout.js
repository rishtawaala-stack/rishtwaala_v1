import { Inter } from "next/font/google";
import ClientShell from "@/components/ClientShell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata = {
  title: "Rishtawaala | Find your forever",
  description:
    "A privacy-first matchmaking platform for serious, verified connections. Find someone you'd actually marry, calmly and confidently.",
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
