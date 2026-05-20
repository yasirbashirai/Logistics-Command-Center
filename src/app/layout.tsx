import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/topbar";
import { Toaster } from "sonner";
import ThemeBootstrap from "@/components/theme-bootstrap";
import Chatbot from "@/components/chatbot";

export const metadata: Metadata = {
  title: "Logistics Command Center — Yasir",
  description: "Operational dashboard for the Logistics Solutions plan + research.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem("theme") || "light";
                if (t === "dark") document.documentElement.classList.add("dark");
                else document.documentElement.classList.remove("dark");
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans">
        <ThemeBootstrap />
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar />
            <main className="flex-1 px-6 py-6 overflow-x-auto">
              {children}
            </main>
          </div>
        </div>
        <Toaster
          position="top-right"
          theme="system"
          richColors
          closeButton
        />
        <Chatbot />
      </body>
    </html>
  );
}
