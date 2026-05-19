import type { PrismaClient } from "@prisma/client";

// If/then decision rules from PLAN §15.3 + §16 + RESEARCH playbooks.
// severity: auto-execute | alert | log

export const decisions = [
  { trigger: "Cold email reply rate <5% over 7 days", action: "Personalize harder (60-90 sec/prospect). Rewrite subject line. Swap to different sequence (carrier/broker/mover).", sourceModule: "KPI", severity: "alert", notes: "Health-check ratio #1" },
  { trigger: "Cold call connect rate <18%", action: "Numbers are wrong. Switch list source to FMCSA SAFER direct-dial.", sourceModule: "KPI", severity: "alert", notes: "Health-check ratio #2" },
  { trigger: "LinkedIn acceptance rate <30%", action: "LinkedIn is throttling. Soften connection-request copy. Reduce daily volume to <25/day.", sourceModule: "KPI", severity: "alert", notes: "Health-check ratio #3" },
  { trigger: "Discovery show rate <70%", action: "Add 1-hour SMS reminder before call (GHL automation #3). Check time-zone misalignment.", sourceModule: "KPI", severity: "alert", notes: "Health-check ratio #4" },
  { trigger: "Discovery close rate <25%", action: "Pitch needs work. Show case study EARLIER in call. Refine objection handling — pull last 5 call recordings via Fathom.", sourceModule: "KPI", severity: "log", notes: "Health-check ratio #5" },
  { trigger: "LP visitor → call booked <6%", action: "Test new hero copy variant (V2-V5 from Scripts). Check form friction. Validate CTA placement.", sourceModule: "KPI", severity: "alert", notes: "Health-check ratio #6" },
  { trigger: "Loom delivered >24h after request", action: "Block 1 hour/day in daily routine for Loom recording. Audit Loom Queue in Notion.", sourceModule: "KPI", severity: "alert", notes: "Health-check ratio #7 — SLA breach" },
  { trigger: "Ad CTR <0.5% OR CPL >3× target by Day 3", action: "Pause underperforming creative immediately. Promote 2nd-place creative to lead position.", sourceModule: "Channels", severity: "auto-execute", notes: "Ad management rule" },
  { trigger: "Ad CPL still high by Day 5", action: "Refresh creative. Test new hook. Consider audience swap (carrier → broker).", sourceModule: "Channels", severity: "log", notes: "Ad management rule" },
  { trigger: "Winning ad identified by Day 10", action: "Scale +20% per 48hr. Maintain audience. Monitor frequency cap.", sourceModule: "Channels", severity: "auto-execute", notes: "Don't break Learning Phase by scaling >20%/48h" },
  { trigger: "Opportunity stuck in same pipeline stage 14+ days no activity", action: "Trigger GHL revival automation. Yasir task: send 'still on roadmap?' email + alt offer.", sourceModule: "Pipeline", severity: "auto-execute", notes: "Automation #7 in GHL" },
  { trigger: "Discovery call no-show", action: "SMS 5 min later. Email 24h later. Re-engage 7 days later via revival sequence.", sourceModule: "Pipeline", severity: "auto-execute", notes: "GHL automation #4" },
  { trigger: "Proposal sent + opened 3+ times, no reply 7 days", action: "Send walkthrough Loom + soft reframe ('Still on roadmap?').", sourceModule: "Pipeline", severity: "alert", notes: "" },
  { trigger: "Proposal stage 14+ days no close", action: "Move to Nurture. Add to quarterly value-drop list.", sourceModule: "Pipeline", severity: "auto-execute", notes: "Stop the over-chase. Free up brain cycles." },
  { trigger: "Won deal → Stage moved to 'Proposal Won'", action: "Auto-fire: invoice via Stripe + onboarding form + Notion project + book kickoff call. (GHL automation #6)", sourceModule: "Pipeline", severity: "auto-execute", notes: "Onboarding automation" },
  { trigger: "90 days since last contact with past client / nurture lead", action: "Send 1-paragraph value-drop email (industry insight + soft offer).", sourceModule: "Pipeline", severity: "auto-execute", notes: "Quarterly cadence" },
  { trigger: "Weekly booked calls < target (5/wk by W4)", action: "Stop ad spend. Pause cold email. Focus on past clients + warm pipeline + LinkedIn DMs only.", sourceModule: "KPI", severity: "alert", notes: "PLAN §15.1 fallback" },
  { trigger: "$300/mo ad budget does not close in M1", action: "Scale to $600 in M2. Then $1,200 in M3. Don't scale >20% per 48h.", sourceModule: "Channels", severity: "log", notes: "Expected — M1 ads buy retargeting pool + pixel training, not closes" },
];

export async function seedDecisions(db: PrismaClient) {
  for (const d of decisions) {
    await db.decisionRule.create({ data: d });
  }
  console.log(`  ✓ Seeded ${decisions.length} decision rules`);
}
