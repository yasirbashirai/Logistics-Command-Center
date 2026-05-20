"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle, ExternalLink, X, Plug, PlugZap, Trash2, BookOpen } from "lucide-react";
import { connectSocialAccount, disconnectSocialAccount } from "@/lib/actions";
import { cn } from "@/lib/utils";
import type { SocialAccount } from "@prisma/client";

type Platform = {
  key: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  setupGuide: string;
  oauthUrl?: string;
};

export default function ConnectionCard({ platform, account }: { platform: Platform; account?: SocialAccount }) {
  const [open, setOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const Icon = platform.icon;
  const connected = account?.status === "connected";

  return (
    <div className={cn("card p-4", connected && "border-success/30")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 bg-gradient-to-br", platform.color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold">{platform.name}</h3>
              {connected ? (
                <span className="pill-success text-[10px]"><CheckCircle className="w-2.5 h-2.5" /> connected</span>
              ) : (
                <span className="pill text-[10px]">not connected</span>
              )}
            </div>
            {connected && account?.accountName && (
              <div className="text-xs text-fg-muted mt-0.5">{account.accountName}</div>
            )}
            {connected && account?.connectedAt && (
              <div className="text-[10px] text-fg-subtle mt-0.5">since {new Date(account.connectedAt).toLocaleDateString()}</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-3">
        {connected ? (
          <DisconnectButton platform={platform.key} />
        ) : (
          <button onClick={() => setOpen(true)} className="btn-brand text-xs">
            <PlugZap className="w-3 h-3" /> Connect
          </button>
        )}
        <button onClick={() => setShowGuide((g) => !g)} className="btn-ghost text-xs">
          <BookOpen className="w-3 h-3" /> {showGuide ? "Hide" : "Setup"}
        </button>
        {platform.oauthUrl && (
          <a href={platform.oauthUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs ml-auto">
            <ExternalLink className="w-3 h-3" /> Get token
          </a>
        )}
      </div>

      {showGuide && (
        <div className="mt-3 text-xs text-fg-muted bg-bg-sub border border-border rounded-md p-3 leading-relaxed">
          {platform.setupGuide}
        </div>
      )}

      {open && (
        <ConnectForm
          platform={platform}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function ConnectForm({ platform, onClose }: { platform: Platform; onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  const [f, setF] = useState({ accountName: "", accountUrl: "", apiKey: "", accessToken: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.apiKey && !f.accessToken) {
      toast.error("Paste an API key or access token");
      return;
    }
    startTransition(async () => {
      await connectSocialAccount({
        platform: platform.key,
        accountName: f.accountName || undefined,
        accountUrl: f.accountUrl || undefined,
        apiKey: f.apiKey || undefined,
        accessToken: f.accessToken || undefined,
      });
      toast.success(`${platform.name} connected`);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-md animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-base font-semibold">Connect {platform.name}</h3>
          <button onClick={onClose} className="btn-ghost"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="p-4 space-y-3">
          <label className="block text-xs uppercase tracking-wider text-fg-muted">
            Account name (display only)
            <input className="input mt-1" value={f.accountName} onChange={(e) => setF({ ...f, accountName: e.target.value })} placeholder="@yasirbashir or 'Logistics Solutions'" />
          </label>
          <label className="block text-xs uppercase tracking-wider text-fg-muted">
            Account URL (optional)
            <input className="input mt-1" value={f.accountUrl} onChange={(e) => setF({ ...f, accountUrl: e.target.value })} placeholder="https://linkedin.com/in/…" />
          </label>
          <label className="block text-xs uppercase tracking-wider text-fg-muted">
            API key (Ayrshare / Beehiiv style)
            <input className="input mt-1 font-mono text-xs" type="password" value={f.apiKey} onChange={(e) => setF({ ...f, apiKey: e.target.value })} placeholder="key_xxx" />
          </label>
          <label className="block text-xs uppercase tracking-wider text-fg-muted">
            OR access token (OAuth)
            <input className="input mt-1 font-mono text-xs" type="password" value={f.accessToken} onChange={(e) => setF({ ...f, accessToken: e.target.value })} placeholder="EAAB…" />
          </label>
          <div className="text-[11px] text-fg-subtle bg-bg-sub border border-border rounded p-2 leading-snug">
            Tokens are stored in your dashboard's database. For production, set <code>NEXTAUTH_SECRET</code> + use Vercel Postgres (encrypted at rest).
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <button type="submit" disabled={pending} className="btn-brand"><Plug className="w-4 h-4" /> Connect</button>
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DisconnectButton({ platform }: { platform: string }) {
  const [pending, startTransition] = useTransition();
  const disconnect = () => {
    if (!window.confirm("Disconnect this account? Stored tokens will be erased.")) return;
    startTransition(async () => {
      await disconnectSocialAccount(platform);
      toast.success("Disconnected");
    });
  };
  return (
    <button onClick={disconnect} disabled={pending} className="btn-danger text-xs">
      <Trash2 className="w-3 h-3" /> Disconnect
    </button>
  );
}
