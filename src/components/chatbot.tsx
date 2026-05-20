"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, X, Send, Sparkles, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { chatWithAssistant, type ChatMessage } from "@/lib/chatbot";
import { cn } from "@/lib/utils";

type Bubble = ChatMessage & {
  toolCalls?: Array<{ tool: string; input: Record<string, unknown>; result: unknown }>;
  error?: string;
};

const SUGGESTIONS = [
  "How am I doing today?",
  "Show me the facebook ads",
  "What's my reply rate this week?",
  "Find a script for cold emailing brokers",
  "How many past clients have I emailed?",
  "What's the rule about saying AI?",
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [bubbles, pending]);

  const send = (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || pending) return;
    setInput("");
    const next: Bubble[] = [...bubbles, { role: "user", content: t }];
    setBubbles(next);
    startTransition(async () => {
      const history: ChatMessage[] = next.map((b) => ({ role: b.role, content: b.content }));
      const res = await chatWithAssistant(history);
      setBubbles([
        ...next,
        { role: "assistant", content: res.reply, toolCalls: res.toolCalls, error: res.error },
      ]);
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-brand-gradient text-brand-fg shadow-lift flex items-center justify-center hover:scale-105 transition-transform animate-fade-up"
        aria-label="Open AI assistant"
        title="AI assistant — ask anything about your dashboard"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-full sm:w-96 h-[600px] max-h-[80vh] card flex flex-col overflow-hidden animate-fade-up">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-brand-gradient text-brand-fg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <div>
            <div className="text-sm font-semibold leading-tight">Dashboard Assistant</div>
            <div className="text-[10px] opacity-80">Claude · ask anything</div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/10 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-3 bg-bg-sub/40">
        {bubbles.length === 0 && (
          <div className="space-y-3">
            <div className="text-sm text-fg-muted leading-relaxed">
              Hey Yasir 👋 I can search your dashboard, surface stats, find leads & scripts, and tell you what to focus on. Try:
            </div>
            <div className="space-y-1.5">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s)}
                  className="w-full text-left text-xs px-3 py-2 rounded-md bg-bg-card border border-border hover:border-brand/40 hover:bg-bg-sub transition-colors text-fg-muted hover:text-fg"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {bubbles.map((b, i) => (
          <Bubble key={i} bubble={b} onNavigate={(href) => { router.push(href); setOpen(false); }} />
        ))}

        {pending && (
          <div className="flex items-center gap-2 text-xs text-fg-muted pl-2">
            <Loader2 className="w-3 h-3 animate-spin" /> Thinking…
          </div>
        )}
      </div>

      <div className="border-t border-border p-2 flex items-center gap-1.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Ask anything…"
          className="input text-sm py-2 flex-1"
          disabled={pending}
        />
        <button
          onClick={() => send()}
          disabled={pending || !input.trim()}
          className="btn-brand p-2"
          aria-label="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Bubble({ bubble, onNavigate }: { bubble: Bubble; onNavigate: (href: string) => void }) {
  if (bubble.error === "no_api_key") {
    return (
      <div className="card p-3 border-warn/30">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-warn shrink-0 mt-0.5" />
          <div className="text-xs leading-snug">
            <div className="font-semibold mb-1">Set ANTHROPIC_API_KEY to enable the assistant</div>
            <div className="text-fg-muted">Add it to <code className="bg-bg-sub px-1 rounded">.env</code> locally or your Vercel environment variables. Get a key at <a href="https://console.anthropic.com/" target="_blank" className="text-brand underline">console.anthropic.com</a>.</div>
            <div className="text-fg-muted mt-2">In the meantime, use <kbd className="bg-bg-sub px-1 py-0.5 rounded text-[10px]">⌘K</kbd> for fast search.</div>
          </div>
        </div>
      </div>
    );
  }

  if (bubble.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-brand-gradient text-brand-fg rounded-lg px-3 py-2 text-sm max-w-[85%] shadow-card">
          {bubble.content}
        </div>
      </div>
    );
  }

  // Find tool calls that returned navigable items
  const navHits: Array<{ title: string; href: string; meta?: string }> = [];
  for (const tc of bubble.toolCalls ?? []) {
    if (tc.tool === "search_dashboard" && tc.result && typeof tc.result === "object" && "results" in tc.result) {
      const r = (tc.result as { results: Array<{ title: string; subtitle?: string; href: string; meta?: string }> }).results;
      for (const hit of r.slice(0, 6)) {
        navHits.push({ title: hit.title, href: hit.href, meta: hit.subtitle ?? hit.meta });
      }
    }
  }

  return (
    <div className="space-y-2">
      <div className="bg-bg-card border border-border rounded-lg px-3 py-2 text-sm max-w-[95%] whitespace-pre-wrap leading-relaxed">
        {bubble.content || (bubble.toolCalls ? "Done." : "")}
      </div>
      {navHits.length > 0 && (
        <div className="space-y-1">
          {navHits.map((h, i) => (
            <button
              key={i}
              onClick={() => onNavigate(h.href)}
              className="w-full text-left bg-bg-card border border-border hover:border-brand/40 rounded-md px-2.5 py-1.5 flex items-center justify-between gap-2 transition-colors"
            >
              <div className="min-w-0">
                <div className="text-xs font-medium truncate">{h.title}</div>
                {h.meta && <div className="text-[10px] text-fg-muted truncate">{h.meta}</div>}
              </div>
              <ExternalLink className="w-3 h-3 text-fg-subtle shrink-0" />
            </button>
          ))}
        </div>
      )}
      {bubble.toolCalls && bubble.toolCalls.length > 0 && (
        <div className="text-[10px] text-fg-subtle pl-2">
          🔧 used: {bubble.toolCalls.map((t) => t.tool).join(" → ")}
        </div>
      )}
    </div>
  );
}
