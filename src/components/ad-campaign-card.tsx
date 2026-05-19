"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateAdCampaignStatus, updateAdCampaignBudget, updateCreativeStatus, createAdCreative } from "@/lib/actions";
import { cn, fmtMoney } from "@/lib/utils";
import { Play, Pause, XCircle, Plus, ExternalLink, ChevronDown, ChevronRight, AlertTriangle, CheckCircle } from "lucide-react";
import AdMetricForm from "./ad-metric-form";
import type { AdCampaign, AdCreative, AdMetric } from "@prisma/client";

type CampaignWithRel = AdCampaign & { creatives: AdCreative[]; metrics: AdMetric[] };

const STATUS = [
  { key: "planned", label: "Planned", tone: "pill", icon: ChevronRight },
  { key: "active", label: "Active", tone: "pill-success", icon: Play },
  { key: "paused", label: "Paused", tone: "pill-warn", icon: Pause },
  { key: "killed", label: "Killed", tone: "pill-danger", icon: XCircle },
];

export default function AdCampaignCard({ campaign }: { campaign: CampaignWithRel }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(campaign.status);
  const [budget, setBudget] = useState(String(campaign.dailyBudget));
  const [, startTransition] = useTransition();

  const onStatus = (s: string) => {
    setStatus(s);
    startTransition(() => updateAdCampaignStatus(campaign.id, s));
  };
  const onBudget = (v: string) => {
    setBudget(v);
    const n = parseFloat(v);
    if (!isNaN(n)) startTransition(() => updateAdCampaignBudget(campaign.id, n));
  };

  // Compute summary metrics
  const totalSpend = campaign.metrics.reduce((s, m) => s + m.spend, 0);
  const totalImpr = campaign.metrics.reduce((s, m) => s + m.impressions, 0);
  const totalClicks = campaign.metrics.reduce((s, m) => s + m.clicks, 0);
  const totalLeads = campaign.metrics.reduce((s, m) => s + m.leads, 0);
  const totalBooked = campaign.metrics.reduce((s, m) => s + m.bookedCalls, 0);
  const ctr = totalImpr > 0 ? (totalClicks / totalImpr) * 100 : 0;
  const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const daysLive = campaign.startDate ? Math.max(1, Math.floor((Date.now() - new Date(campaign.startDate).getTime()) / 86400000)) : 0;

  // Surface Day-3 + Day-5 decision rules
  const showDay3Alert = daysLive >= 3 && (ctr < 0.5 || (cpl > 0 && cpl > 75));
  const showDay5Alert = daysLive >= 5 && cpl > 0 && cpl > 75;
  const showWin = daysLive >= 10 && cpl > 0 && cpl < 25;

  return (
    <div className={cn("card", status === "killed" && "opacity-50", status === "paused" && "opacity-80")}>
      <div className="p-4 cursor-pointer" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="pill-brand text-[10px]">{campaign.platform}</span>
              <span className="pill text-[10px]">{campaign.campaignType.replace("_", " ")}</span>
              <span className="pill text-[10px]">M{campaign.monthNumber}</span>
              {showDay3Alert && <span className="pill-danger text-[10px]"><AlertTriangle className="w-2.5 h-2.5" /> day-3 pause rule hit</span>}
              {showWin && <span className="pill-success text-[10px]"><CheckCircle className="w-2.5 h-2.5" /> winner — scale +20%</span>}
            </div>
            <h3 className="text-base font-semibold leading-tight">{campaign.name}</h3>
            {campaign.objective && (
              <div className="text-[11px] text-fg-muted mt-1 line-clamp-2 leading-snug">{campaign.objective}</div>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-fg-muted">${campaign.dailyBudget.toFixed(0)}/day</div>
            <div className="text-base font-bold">${campaign.monthlyBudget.toFixed(0)}<span className="text-xs text-fg-muted">/mo</span></div>
          </div>
        </div>

        {/* Status pills row */}
        <div className="flex items-center gap-1 mt-3" onClick={(e) => e.stopPropagation()}>
          {STATUS.map((s) => {
            const Icon = s.icon;
            const active = status === s.key;
            return (
              <button
                key={s.key}
                onClick={() => onStatus(s.key)}
                className={cn("pill text-[10px] py-1 px-2 transition", active ? s.tone : "opacity-30 hover:opacity-100")}
              >
                <Icon className="w-2.5 h-2.5" /> {s.label}
              </button>
            );
          })}
          <span className="ml-auto text-[11px] text-fg-subtle">
            {open ? <ChevronDown className="w-3.5 h-3.5 inline" /> : <ChevronRight className="w-3.5 h-3.5 inline" />}
            {daysLive > 0 && ` · Day ${daysLive}`}
          </span>
        </div>

        {/* Summary metrics — always visible */}
        {campaign.metrics.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t border-border">
            <Stat label="Spend" v={fmtMoney(totalSpend)} />
            <Stat label="CTR" v={`${ctr.toFixed(2)}%`} tone={ctr >= 0.6 ? "success" : ctr >= 0.5 ? "warn" : "danger"} />
            <Stat label="CPC" v={cpc > 0 ? `$${cpc.toFixed(2)}` : "—"} />
            <Stat label="CPL" v={cpl > 0 ? `$${cpl.toFixed(0)}` : "—"} tone={cpl > 0 && cpl <= 25 ? "success" : cpl > 0 && cpl <= 75 ? "warn" : cpl > 75 ? "danger" : undefined} />
            <Stat label="Booked" v={String(totalBooked)} />
          </div>
        )}
      </div>

      {open && (
        <div className="border-t border-border p-4 space-y-3 bg-bg-sub" onClick={(e) => e.stopPropagation()}>
          {/* Budget edit */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-fg-muted">Daily budget $:</span>
            <input
              type="number"
              step="1"
              value={budget}
              onChange={(e) => onBudget(e.target.value)}
              className="input text-xs py-1 w-20"
            />
            <span className="text-fg-muted">= ${(parseFloat(budget) || 0) * 30}/mo</span>
          </div>

          {/* Audience */}
          {campaign.audience && (
            <div className="text-[11px] text-fg-muted">
              <span className="font-semibold text-fg">Audience:</span> {campaign.audience}
            </div>
          )}

          {/* Notes */}
          {campaign.notes && (
            <div className="text-[11px] text-warn bg-warn/5 border border-warn/20 rounded-md p-2">
              {campaign.notes}
            </div>
          )}

          {/* Creatives */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-fg-muted mb-2">Creatives ({campaign.creatives.length})</div>
            <div className="space-y-1.5">
              {campaign.creatives.map((cr) => <CreativeRow key={cr.id} creative={cr} />)}
            </div>
          </div>

          {/* Metric log */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <AdMetricForm campaignId={campaign.id} />
            <span className="text-[11px] text-fg-subtle">{campaign.metrics.length} day{campaign.metrics.length === 1 ? "" : "s"} logged</span>
          </div>

          {/* Last 5 metric rows */}
          {campaign.metrics.length > 0 && (
            <div className="text-xs">
              <table className="w-full">
                <thead>
                  <tr className="text-fg-muted border-b border-border">
                    <th className="text-left font-medium py-1">Date</th>
                    <th className="text-right font-medium py-1">Spend</th>
                    <th className="text-right font-medium py-1">Impr</th>
                    <th className="text-right font-medium py-1">Clicks</th>
                    <th className="text-right font-medium py-1">Leads</th>
                    <th className="text-right font-medium py-1">Booked</th>
                  </tr>
                </thead>
                <tbody>
                  {campaign.metrics.slice(-5).reverse().map((m) => (
                    <tr key={m.id} className="border-b border-border/50 hover:bg-bg-card">
                      <td className="py-1 text-fg-muted">{new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                      <td className="text-right py-1">${m.spend.toFixed(0)}</td>
                      <td className="text-right py-1">{m.impressions.toLocaleString()}</td>
                      <td className="text-right py-1">{m.clicks}</td>
                      <td className="text-right py-1">{m.leads}</td>
                      <td className="text-right py-1 font-semibold text-success">{m.bookedCalls}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Decision rule alerts */}
          {showDay3Alert && (
            <div className="text-[11px] bg-danger/10 border border-danger/30 rounded-md p-2 leading-snug text-danger">
              <strong>Day-3 rule triggered:</strong> CTR &lt;0.5% or CPL &gt;3× target. Pause underperforming creative; promote runner-up. (PLAN §9.2)
            </div>
          )}
          {showDay5Alert && (
            <div className="text-[11px] bg-warn/10 border border-warn/30 rounded-md p-2 leading-snug text-warn">
              <strong>Day-5 rule:</strong> CPL still high. Refresh creative, test new hook, consider audience swap (carrier → broker).
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, v, tone }: { label: string; v: string; tone?: "success" | "warn" | "danger" }) {
  const c = tone === "success" ? "text-success" : tone === "warn" ? "text-warn" : tone === "danger" ? "text-danger" : "";
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider text-fg-subtle">{label}</div>
      <div className={cn("text-sm font-bold", c)}>{v}</div>
    </div>
  );
}

function CreativeRow({ creative }: { creative: AdCreative }) {
  const [status, setStatus] = useState(creative.status);
  const [, startTransition] = useTransition();
  const onChange = (s: string) => {
    setStatus(s);
    startTransition(() => updateCreativeStatus(creative.id, s));
  };

  const pill =
    status === "live" ? "pill-success" :
    status === "ready" ? "pill-info" :
    status === "paused" ? "pill-warn" :
    status === "killed" ? "pill-danger" : "pill";

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="pill text-[9px]">{creative.format}</span>
      <span className="flex-1 truncate">{creative.name}</span>
      {creative.scriptKeyRef && (
        <Link href={`/scripts#${creative.scriptKeyRef}`} className="pill-info text-[9px]">
          <ExternalLink className="w-2.5 h-2.5" /> script
        </Link>
      )}
      <select className="input text-[10px] py-0.5 px-1.5 w-24" value={status} onChange={(e) => onChange(e.target.value)}>
        <option value="draft">Draft</option>
        <option value="ready">Ready</option>
        <option value="live">Live</option>
        <option value="paused">Paused</option>
        <option value="killed">Killed</option>
      </select>
    </div>
  );
}
