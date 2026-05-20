"use client";

import { Facebook, Linkedin, Instagram, Youtube, Twitter, Mail, Plug } from "lucide-react";
import ConnectionCard from "./connection-card";
import type { SocialAccount } from "@prisma/client";

type Platform = {
  key: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  setupGuide: string;
  oauthUrl?: string;
};

const PLATFORMS: Platform[] = [
  {
    key: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "from-[#0a66c2] to-[#0077b5]",
    setupGuide: "Create a LinkedIn Developer app → enable 'Share on LinkedIn' product (needs approval) → store access token. OR use Ayrshare unified API ($24/mo) — paste single key, posts to all platforms.",
    oauthUrl: "https://www.linkedin.com/developers/apps",
  },
  {
    key: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "from-[#1877f2] to-[#0a5cd9]",
    setupGuide: "Create a Meta app at developers.facebook.com → add Facebook Login + Pages API → get Page access token. Page must be a Business Page. Easier path: Ayrshare or Buffer API.",
    oauthUrl: "https://developers.facebook.com/apps/",
  },
  {
    key: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "from-[#fd1d1d] via-[#e1306c] to-[#833ab4]",
    setupGuide: "Requires Instagram Business or Creator account linked to a Facebook Page. Get IG Graph API token via Meta Business. Ayrshare handles this without app approval.",
    oauthUrl: "https://developers.facebook.com/docs/instagram-api",
  },
  {
    key: "tiktok",
    name: "TikTok",
    icon: Twitter,
    color: "from-[#000000] to-[#25f4ee]",
    setupGuide: "TikTok Business API (Direct Posting). App review required. Ayrshare or social.dev for unified posting.",
    oauthUrl: "https://developers.tiktok.com/",
  },
  {
    key: "twitter",
    name: "X (Twitter)",
    icon: Twitter,
    color: "from-[#000000] to-[#1d9bf0]",
    setupGuide: "X API v2 Free/Basic tier. Pricing changed — $100/mo Basic for posting. Skip unless central to strategy.",
    oauthUrl: "https://developer.twitter.com/",
  },
  {
    key: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "from-[#ff0000] to-[#cc0000]",
    setupGuide: "Google Cloud project → YouTube Data API v3 → OAuth consent screen. Quota: 10,000 units/day (free).",
    oauthUrl: "https://console.cloud.google.com/apis/library/youtube.googleapis.com",
  },
  {
    key: "beehiiv",
    name: "Beehiiv",
    icon: Mail,
    color: "from-[#ffd166] to-[#ef476f]",
    setupGuide: "Newsletter platform — API key in Beehiiv settings. Use for the weekly logistics teardown newsletter (Month 2 launch).",
    oauthUrl: "https://app.beehiiv.com/settings/integrations",
  },
  {
    key: "ayrshare",
    name: "Ayrshare (unified)",
    icon: Plug,
    color: "from-[#288672] to-[#36c8a9]",
    setupGuide: "RECOMMENDED for fastest setup. One API key posts to LinkedIn / Facebook / Instagram / TikTok / X / YouTube without per-platform app approval. $24/mo Premium plan. Free tier 20 posts/mo.",
    oauthUrl: "https://www.ayrshare.com/",
  },
];

export default function ConnectionsGrid({ accounts }: { accounts: SocialAccount[] }) {
  const accountByPlatform = Object.fromEntries(accounts.map((a) => [a.platform, a]));
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {PLATFORMS.map((p) => (
        <ConnectionCard
          key={p.key}
          platform={p}
          account={accountByPlatform[p.key]}
        />
      ))}
    </div>
  );
}
