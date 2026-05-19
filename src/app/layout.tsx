import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/topbar";

export const metadata: Metadata = {
  title: "Logistics Command Center — Yasir",
  description: "Operational dashboard for the 30-day Logistics Solutions plan + research.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar />
            <main className="flex-1 px-6 py-6 overflow-x-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
