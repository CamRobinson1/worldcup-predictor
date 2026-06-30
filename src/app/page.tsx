"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { groups, type Team } from "../lib/teams";
import { getFlagUrl, getFlagUrl2x } from "../lib/flags";
import { venues } from "../lib/venues";
import { schedule, phaseColors, phaseLabels } from "../lib/schedule";

// ─── Types ───────────────────────────────────────────────────────────────────

type AnalysisResult = {
  totalTeams: number;
  powerRankings: Array<{
    name: string; code: string; flag: string; fifaRanking: number;
    overallStrength: number; tier: string; winProbability: number;
  }>;
  darkHorses: Array<{ name: string; flag: string; overallStrength: number; tier: string }>;
  sampleMatchups: Array<{
    match: string;
    team1: { name: string; winProb: number };
    team2: { name: string; winProb: number };
    predicted: string;
  }>;
  tierDistribution: { elite: number; strong: number; competitive: number; underdog: number };
};

type TournamentPrediction = {
  groupStage: {
    groups: Array<{
      groupName: string;
      standings: Array<{
        position: number; team: string; code: string; points: number; goalDifference: number;
      }>;
    }>;
    qualifiedTeams: Array<{ team: string; code: string; qualifiedAs: string }>;
  };
  roundOf32: RoundResult;
  roundOf16: RoundResult;
  quarterFinals: RoundResult;
  semiFinals: RoundResult;
  final: RoundResult;
  champion: string;
};

type RoundResult = {
  matches: Array<{
    winner: string; winnerCode: string; loser: string; loserCode: string;
    score: string; reasoning: string;
  }>;
};

type TeamDetail = {
  team: Team;
  group: string;
  detail: {
    recentMatches: Array<{
      date: string; opponent: string; score: string; result: "W" | "D" | "L"; competition: string;
    }>;
    topPlayers: Array<{
      name: string; position: string; club: string; age: number;
      caps: number; goals: number; assists: number; rating: number;
    }>;
    teamStrengths: string[];
    teamWeaknesses: string[];
    formRating: number;
    tacticalStyle: string;
  };
  venues: Array<{
    stadium: string; city: string; country: string; capacity: number;
    weather: { tempF: number; humidity: number; rainChance: number; condition: string; impact: string };
  }>;
};

type TabKey = "groups" | "analysis" | "bracket" | "venues";

// ─── Flag Image Component ────────────────────────────────────────────────────

function Flag({ code, size = 20 }: { code: string; size?: number }) {
  const src = getFlagUrl(code, size <= 24 ? 40 : 80);
  const src2x = getFlagUrl2x(code, size <= 24 ? 40 : 80);
  if (!src) return <span className="inline-block" style={{ width: size, height: size * 0.67 }} />;
  return (
    <img
      src={src}
      srcSet={`${src2x} 2x`}
      alt={code}
      width={size}
      height={Math.round(size * 0.67)}
      className="inline-block rounded-[2px] object-cover"
      style={{ width: size, height: size * 0.67 }}
      loading="lazy"
    />
  );
}

// ─── Shared Components ───────────────────────────────────────────────────────

function MagneticButton({
  children, onClick, disabled, variant = "primary", size = "md",
}: {
  children: ReactNode; onClick: () => void; disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost"; size?: "sm" | "md";
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const handleMouseMove = useCallback((e: ReactMouseEvent<HTMLButtonElement>) => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    ref.current.style.transform = `translate(${x * 0.12}px, ${y * 0.2}px) scale(1.02)`;
  }, [disabled]);
  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0, 0) scale(1)";
  }, []);
  const sizes = { sm: "px-3 py-1.5 text-[12px]", md: "px-5 py-2.5 text-sm" };
  const variants = {
    primary: "bg-[#0070f3]/10 text-[#3291ff] border border-[#0070f3]/20 hover:bg-[#0070f3]/15 hover:border-[#0070f3]/30 hover:shadow-[0_0_30px_rgba(0,112,243,0.1)]",
    secondary: "bg-white/[0.03] text-white/70 border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 hover:text-white/90",
    ghost: "bg-transparent text-white/40 border border-transparent hover:text-white/70 hover:bg-white/[0.03]",
  };
  return (
    <button ref={ref} onClick={onClick} disabled={disabled} onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`magnetic-btn relative rounded-xl font-medium cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${sizes[size]} ${variants[variant]}`}>
      {children}
    </button>
  );
}

function Spinner({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-xl bg-white/[0.03] border border-white/[0.04] ${className}`} />;
}

function SkeletonGrid({ count, height = "h-40" }: { count: number; height?: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className={height} />
      ))}
    </div>
  );
}

function TabTransition({ children, activeKey }: { children: ReactNode; activeKey: string }) {
  return (
    <div key={activeKey} className="animate-tab-in">
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="text-center py-24 text-white/20 text-sm">{message}</div>;
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Home() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [prediction, setPrediction] = useState<TournamentPrediction | null>(null);
  const [analyzingState, setAnalyzingState] = useState<"idle" | "loading" | "done">("idle");
  const [predictingState, setPredictingState] = useState<"idle" | "loading" | "done">("idle");
  const [activeTab, setActiveTab] = useState<TabKey>("groups");
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  async function runAnalysis() {
    setAnalyzingState("loading");
    setError(null);
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (!res.ok) throw new Error("Analysis failed");
      setAnalysis(await res.json());
      setAnalyzingState("done");
      setActiveTab("analysis");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
      setAnalyzingState("idle");
    }
  }

  async function runPrediction() {
    setPredictingState("loading");
    setError(null);
    try {
      const res = await fetch("/api/predict", { method: "POST" });
      if (!res.ok) throw new Error("Prediction failed to start");
      const { runId } = await res.json();
      let attempts = 0;
      while (attempts < 60) {
        await new Promise((r) => setTimeout(r, 5000));
        const statusRes = await fetch(`/api/predict/status?runId=${runId}`);
        if (!statusRes.ok) { attempts++; continue; }
        const statusData = await statusRes.json();
        if (statusData.status === "completed" && statusData.output) {
          setPrediction(statusData.output);
          setPredictingState("done");
          setActiveTab("bracket");
          return;
        }
        if (statusData.status === "failed") throw new Error("Prediction workflow failed");
        attempts++;
      }
      throw new Error("Prediction timed out");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Prediction failed");
      setPredictingState("idle");
    }
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "groups", label: "Groups" },
    { key: "analysis", label: "Analysis" },
    { key: "bracket", label: "Bracket" },
    { key: "venues", label: "Venues" },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white/90">
      <div className="noise-bg" />
      <div className="grid-bg" />

      <div className="relative z-10">
        <header className="border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gradient">World Cup 2026</h1>
              <p className="text-[13px] text-white/25 mt-1">AI-powered tournament predictions</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-white/20 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
              48 teams · 16 venues · 104 matches
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {error && (
            <div className="mb-6 p-4 glass rounded-xl border-red-500/20 bg-red-500/[0.04] text-red-400/70 text-sm fade-in flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-400/40 hover:text-red-400/70 cursor-pointer">✕</button>
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-3">
              <MagneticButton onClick={runAnalysis} disabled={analyzingState === "loading"} variant="secondary">
                {analyzingState === "loading" ? <span className="flex items-center gap-2"><Spinner /> Analyzing...</span> : "Run Analysis"}
              </MagneticButton>
              <MagneticButton onClick={runPrediction} disabled={predictingState === "loading"}>
                {predictingState === "loading" ? <span className="flex items-center gap-2"><Spinner /> Predicting...</span> : "Predict Tournament"}
              </MagneticButton>
            </div>
            <div className="flex gap-0">
              {tabs.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-[13px] font-medium transition-all duration-200 cursor-pointer border-b-[1.5px] ${
                    activeTab === tab.key ? "text-white/90 border-white/40" : "text-white/20 border-transparent hover:text-white/40"
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <TabTransition activeKey={activeTab}>
            {activeTab === "groups" && <GroupsView onSelectTeam={setSelectedTeam} />}
            {activeTab === "analysis" && <AnalysisView analysis={analysis} loading={analyzingState === "loading"} onSelectTeam={setSelectedTeam} />}
            {activeTab === "bracket" && <BracketView prediction={prediction} loading={predictingState === "loading"} />}
            {activeTab === "venues" && <VenueMapView />}
          </TabTransition>
        </div>

        <footer className="border-t border-white/[0.04] mt-20">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <span className="text-[11px] text-white/15 font-mono">vercel / ai-gateway · workflows · sandbox</span>
            <span className="text-[11px] text-white/15">FIFA World Cup 2026 · Jun 11 – Jul 19</span>
          </div>
        </footer>
      </div>

      {selectedTeam && <TeamPanel team={selectedTeam} onClose={() => setSelectedTeam(null)} />}
    </div>
  );
}

// ─── Groups View ─────────────────────────────────────────────────────────────

function GroupsView({ onSelectTeam }: { onSelectTeam: (t: Team) => void }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups.filter((g) =>
      g.name.toLowerCase().includes(q) ||
      g.teams.some((t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q))
    );
  }, [search]);

  const groupStrength = (g: typeof groups[0]) =>
    g.teams.reduce((s, t) => s + t.fifaRanking, 0) / g.teams.length;
  const sorted = [...groups].sort((a, b) => groupStrength(a) - groupStrength(b));
  const hardestGroup = sorted[0]?.name;

  return (
    <div>
      <div className="mb-5 relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search teams or groups..."
          className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white/70 placeholder:text-white/15 focus:outline-none focus:border-white/15 focus:bg-white/[0.04] transition-all"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 cursor-pointer text-xs">✕</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No teams or groups match your search." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((group) => (
            <div key={group.name}
              className={`glass rounded-xl p-5 transition-all duration-300 ${
                group.name === hardestGroup ? "ring-1 ring-[#0070f3]/20 bg-[#0070f3]/[0.02]" : "hover:bg-white/[0.03]"
              }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-mono text-white/30 uppercase tracking-widest">{group.name}</h3>
                {group.name === hardestGroup && (
                  <span className="text-[9px] font-mono text-[#3291ff]/50 bg-[#0070f3]/10 px-1.5 py-0.5 rounded">GROUP OF DEATH</span>
                )}
              </div>
              <div className="space-y-1">
                {group.teams.map((team) => {
                  const strength = Math.max(0, 100 - team.fifaRanking);
                  return (
                    <button key={team.code} onClick={() => onSelectTeam(team)}
                      className="w-full flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer group text-left">
                      <Flag code={team.code} size={20} />
                      <span className="flex-1 text-sm text-white/60 group-hover:text-white/80 transition-colors">{team.name}</span>
                      <div className="w-16 h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-white/20 group-hover:bg-[#0070f3]/40 transition-colors" style={{ width: `${strength}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-white/15 w-5 text-right">{team.fifaRanking}</span>
                      <svg className="w-3 h-3 text-white/10 group-hover:text-white/30 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Analysis View ───────────────────────────────────────────────────────────

function AnalysisView({ analysis, loading, onSelectTeam }: {
  analysis: AnalysisResult | null; loading: boolean; onSelectTeam: (t: Team) => void;
}) {
  if (loading) return <SkeletonGrid count={8} height="h-28" />;
  if (!analysis) return <EmptyState message="Run analysis to compute team power rankings." />;

  const allTeams = groups.flatMap((g) => g.teams);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(analysis.tierDistribution).map(([tier, count]) => (
          <div key={tier} className="glass rounded-xl p-5 text-center">
            <div className="text-2xl font-light text-white/90 tabular-nums">{count}</div>
            <div className="text-[11px] font-mono text-white/25 uppercase tracking-wider mt-1">{tier}</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-5">Power Rankings</h3>
        <div className="space-y-1">
          {analysis.powerRankings.map((team, i) => {
            const fullTeam = allTeams.find((t) => t.code === team.code);
            return (
              <button key={team.code} onClick={() => fullTeam && onSelectTeam(fullTeam)}
                className="w-full flex items-center gap-4 text-sm py-2 px-2 -mx-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group text-left">
                <span className="text-white/15 font-mono text-[11px] w-5 text-right tabular-nums">{i + 1}</span>
                <Flag code={team.code} size={20} />
                <span className="flex-1 text-white/60 group-hover:text-white/80 transition-colors">{team.name}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono tracking-wide ${
                  team.tier === "Elite" ? "bg-[#0070f3]/10 text-[#3291ff]/60" : "bg-white/[0.03] text-white/25"
                }`}>{team.tier}</span>
                <div className="w-24 h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#0070f3]/30 to-[#0070f3]/15" style={{ width: `${team.winProbability * 100}%` }} />
                </div>
                <span className="text-white/20 font-mono text-[11px] w-10 text-right tabular-nums">{Math.round(team.winProbability * 100)}%</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-5">Dark Horses</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {analysis.darkHorses.map((team) => {
            const fullTeam = allTeams.find((t) => t.name === team.name);
            return (
              <button key={team.name} onClick={() => fullTeam && onSelectTeam(fullTeam)}
                className="glass rounded-lg p-4 text-center hover:bg-white/[0.04] transition-colors cursor-pointer">
                {fullTeam && <Flag code={fullTeam.code} size={32} />}
                <div className="text-sm text-white/60 mt-2">{team.name}</div>
                <div className="text-[10px] font-mono text-white/20 mt-1">{team.overallStrength}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Bracket View ────────────────────────────────────────────────────────────

function BracketView({ prediction, loading }: { prediction: TournamentPrediction | null; loading: boolean }) {
  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-36 max-w-2xl mx-auto" />
      <div className="grid grid-cols-2 gap-3"><Skeleton className="h-56" /><Skeleton className="h-56" /></div>
      <SkeletonGrid count={12} height="h-32" />
    </div>
  );
  if (!prediction) return <EmptyState message="Run prediction to simulate the full tournament." />;

  return (
    <div className="space-y-10">
      <div className="glass-strong rounded-2xl p-10 text-center glow-accent max-w-2xl mx-auto">
        <div className="text-[11px] font-mono text-white/25 uppercase tracking-[0.2em] mb-3">Predicted Champion</div>
        <div className="text-4xl font-semibold text-gradient">{prediction.champion}</div>
      </div>

      <BracketTree prediction={prediction} />

      {[
        { name: "Round of 16", data: prediction.roundOf16 },
        { name: "Round of 32", data: prediction.roundOf32 },
      ].map((round) => (
        <div key={round.name}>
          <h3 className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-4">{round.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {round.data.matches.map((match, i) => (
              <MatchCard key={i} match={match} />
            ))}
          </div>
        </div>
      ))}

      <div>
        <h3 className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-4">Group Stage Standings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {prediction.groupStage.groups.map((group) => (
            <GroupMiniTable key={group.groupName} group={group} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BracketTree({ prediction }: { prediction: TournamentPrediction }) {
  const qf = prediction.quarterFinals.matches;
  const sf = prediction.semiFinals.matches;
  const final = prediction.final.matches[0];

  if (!final || qf.length < 4 || sf.length < 2) return null;

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[820px] flex items-center justify-center gap-0 py-4">
        <div className="flex flex-col justify-around h-[360px] w-[180px] shrink-0">
          {qf.slice(0, 2).map((m, i) => <BracketMatchBox key={i} match={m} />)}
        </div>
        <div className="w-6 h-[360px] shrink-0 relative">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 360" fill="none">
            <path d="M0 90 H12 V180 H24" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <path d="M0 270 H12 V180 H24" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </svg>
        </div>
        <div className="flex flex-col justify-center h-[360px] w-[180px] shrink-0">
          <BracketMatchBox match={sf[0]} />
        </div>
        <div className="w-6 h-[360px] shrink-0 relative">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 360" fill="none">
            <path d="M0 180 H24" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </svg>
        </div>
        <div className="flex flex-col justify-center h-[360px] w-[200px] shrink-0">
          <div className="glass-strong rounded-xl p-4 glow-accent">
            <div className="text-[9px] font-mono text-white/25 uppercase tracking-widest mb-2 text-center">Final</div>
            <div className="flex items-center gap-2 text-sm font-medium text-white/80 mb-1">
              <Flag code={final.winnerCode} size={16} /> {final.winner}
            </div>
            <div className="text-center my-2">
              <span className="text-[12px] font-mono text-[#3291ff]/60 bg-[#0070f3]/10 px-2 py-0.5 rounded">{final.score}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/30">
              <Flag code={final.loserCode} size={16} /> {final.loser}
            </div>
          </div>
        </div>
        <div className="w-6 h-[360px] shrink-0 relative">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 360" fill="none">
            <path d="M24 180 H0" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </svg>
        </div>
        <div className="flex flex-col justify-center h-[360px] w-[180px] shrink-0">
          <BracketMatchBox match={sf[1]} />
        </div>
        <div className="w-6 h-[360px] shrink-0 relative">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 360" fill="none">
            <path d="M24 90 H12 V180 H0" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <path d="M24 270 H12 V180 H0" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </svg>
        </div>
        <div className="flex flex-col justify-around h-[360px] w-[180px] shrink-0">
          {qf.slice(2, 4).map((m, i) => <BracketMatchBox key={i} match={m} />)}
        </div>
      </div>
    </div>
  );
}

function BracketMatchBox({ match }: { match: RoundResult["matches"][0] }) {
  return (
    <div className="glass rounded-lg p-3">
      <div className="flex items-center gap-2 text-[12px] text-white/70 mb-1">
        <Flag code={match.winnerCode} size={14} />
        <span className="flex-1 font-medium truncate">{match.winner}</span>
      </div>
      <div className="text-center my-1">
        <span className="text-[10px] font-mono text-white/25">{match.score}</span>
      </div>
      <div className="flex items-center gap-2 text-[12px] text-white/25">
        <Flag code={match.loserCode} size={14} />
        <span className="flex-1 truncate">{match.loser}</span>
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: RoundResult["matches"][0] }) {
  return (
    <div className="glass rounded-xl p-4 hover:bg-white/[0.04] transition-colors group">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2 text-sm font-medium text-white/80">
          <Flag code={match.winnerCode} size={18} /> {match.winner}
        </span>
        <span className="text-[11px] font-mono text-[#3291ff]/50 px-2 py-0.5 bg-[#0070f3]/5 rounded">{match.score}</span>
        <span className="flex items-center gap-2 text-sm text-white/25">
          {match.loser} <Flag code={match.loserCode} size={18} />
        </span>
      </div>
      <p className="text-[12px] text-white/15 leading-relaxed group-hover:text-white/25 transition-colors">{match.reasoning}</p>
    </div>
  );
}

function GroupMiniTable({ group }: { group: TournamentPrediction["groupStage"]["groups"][0] }) {
  return (
    <div className="glass rounded-xl p-4">
      <h4 className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-3">{group.groupName}</h4>
      <table className="w-full text-[12px]">
        <thead>
          <tr className="text-white/15 font-mono text-[9px] uppercase">
            <th className="text-left pb-2 font-normal">#</th>
            <th className="text-left pb-2 font-normal pl-1">Team</th>
            <th className="text-center pb-2 font-normal w-8">Pts</th>
            <th className="text-center pb-2 font-normal w-8">GD</th>
          </tr>
        </thead>
        <tbody>
          {group.standings.map((team, i) => (
            <tr key={team.code} className={i < 2 ? "text-white/60" : i === 2 ? "text-white/25" : "text-white/12"}>
              <td className="py-1 font-mono text-[10px] text-white/15 w-4">{i + 1}</td>
              <td className="py-1 pl-1">
                <span className="flex items-center gap-1.5">
                  <Flag code={team.code} size={14} />
                  <span className="truncate">{team.team}</span>
                </span>
              </td>
              <td className="py-1 text-center font-mono text-[10px]">{team.points}</td>
              <td className="py-1 text-center font-mono text-[10px]">{team.goalDifference > 0 ? "+" : ""}{team.goalDifference}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Venue Map View ──────────────────────────────────────────────────────────

function projectToMap(lat: number, lng: number): { x: number; y: number } {
  return { x: (lng + 125) / 55 * 800, y: (50 - lat) / 32 * 500 };
}

type Phase = "group" | "r32" | "r16" | "qf" | "sf" | "final";

function VenueMapView() {
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [phaseFilter, setPhaseFilter] = useState<Phase | null>(null);

  const venueEntries = useMemo(() =>
    Object.entries(venues).map(([key, v]) => ({
      key, ...v,
      pos: projectToMap(v.lat, v.lng),
      matchCount: schedule.filter((s) => s.venue === key).length,
      phases: [...new Set(schedule.filter((s) => s.venue === key).map((s) => s.phase))],
    })),
  []);

  const filteredSchedule = useMemo(() => {
    let s = schedule;
    if (selectedVenue) s = s.filter((e) => e.venue === selectedVenue);
    if (phaseFilter) s = s.filter((e) => e.phase === phaseFilter);
    return s;
  }, [selectedVenue, phaseFilter]);

  const phases: Phase[] = ["group", "r32", "r16", "qf", "sf", "final"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => { setPhaseFilter(null); setSelectedVenue(null); }}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-mono cursor-pointer transition-all ${
            !phaseFilter ? "bg-white/10 text-white/70" : "bg-white/[0.03] text-white/25 hover:text-white/40"
          }`}>All Phases</button>
        {phases.map((p) => (
          <button key={p} onClick={() => { setPhaseFilter(phaseFilter === p ? null : p); setSelectedVenue(null); }}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-mono cursor-pointer transition-all ${
              phaseFilter === p ? "text-white/80" : "text-white/25 hover:text-white/40"
            }`}
            style={phaseFilter === p ? { backgroundColor: `${phaseColors[p]}20`, border: `1px solid ${phaseColors[p]}40` } : { backgroundColor: "rgba(255,255,255,0.03)" }}>
            {phaseLabels[p]}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 overflow-hidden">
        <div className="relative w-full" style={{ paddingBottom: "60%" }}>
          <svg className="absolute inset-0 w-full h-full" viewBox="-20 -20 840 540" xmlns="http://www.w3.org/2000/svg">
            {Array.from({ length: 18 }, (_, i) => (
              <line key={`vg${i}`} x1={i * 50} y1={0} x2={i * 50} y2={500} stroke="rgba(255,255,255,0.015)" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 11 }, (_, i) => (
              <line key={`hg${i}`} x1={0} y1={i * 50} x2={800} y2={i * 50} stroke="rgba(255,255,255,0.015)" strokeWidth="0.5" />
            ))}

            <text x="350" y="220" fill="rgba(255,255,255,0.04)" fontSize="60" fontWeight="700" textAnchor="middle" fontFamily="var(--font-geist-sans)">USA</text>
            <text x="300" y="440" fill="rgba(255,255,255,0.04)" fontSize="36" fontWeight="700" textAnchor="middle" fontFamily="var(--font-geist-sans)">MEXICO</text>
            <text x="200" y="60" fill="rgba(255,255,255,0.04)" fontSize="32" fontWeight="700" textAnchor="middle" fontFamily="var(--font-geist-sans)">CANADA</text>

            {venueEntries.map((v) => {
              const isActive = selectedVenue === v.key;
              const isRelevant = !phaseFilter || v.phases.includes(phaseFilter);
              const opacity = isRelevant ? 1 : 0.2;
              const primaryPhase = v.phases.includes("final") ? "final" : v.phases.includes("sf") ? "sf" : v.phases.includes("qf") ? "qf" : "group";
              const color = phaseColors[phaseFilter ?? primaryPhase] ?? phaseColors.group;

              return (
                <g key={v.key} className="cursor-pointer" onClick={() => setSelectedVenue(isActive ? null : v.key)} opacity={opacity}>
                  {isActive && (
                    <circle cx={v.pos.x} cy={v.pos.y} r="20" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3">
                      <animate attributeName="r" from="8" to="25" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx={v.pos.x} cy={v.pos.y} r={isActive ? 14 : 10} fill={color} opacity={isActive ? 0.12 : 0.06} />
                  <circle cx={v.pos.x} cy={v.pos.y} r={Math.max(3, Math.min(6, v.matchCount / 2))} fill={color} opacity={isActive ? 1 : 0.7}>
                    <title>{v.stadium}</title>
                  </circle>
                  <text x={v.pos.x} y={v.pos.y - 12} fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle" fontFamily="var(--font-geist-mono)">
                    {v.city.split("/")[0].split(" ")[0]}
                  </text>
                  <text x={v.pos.x + 8} y={v.pos.y + 3} fill="rgba(255,255,255,0.15)" fontSize="7" fontFamily="var(--font-geist-mono)">
                    {v.matchCount}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-1">
            {selectedVenue ? "Selected Venue" : "All Venues"}
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {(selectedVenue
              ? venueEntries.filter((v) => v.key === selectedVenue)
              : venueEntries.sort((a, b) => b.matchCount - a.matchCount)
            ).map((v) => (
              <button key={v.key} onClick={() => setSelectedVenue(selectedVenue === v.key ? null : v.key)}
                className={`w-full text-left glass rounded-xl p-4 transition-all cursor-pointer ${
                  selectedVenue === v.key ? "ring-1 ring-[#0070f3]/30 bg-[#0070f3]/[0.03]" : "hover:bg-white/[0.03]"
                }`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm text-white/70 font-medium">{v.stadium}</div>
                    <div className="text-[11px] text-white/25">{v.city}, {v.country}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-white/40">{v.matchCount}</div>
                    <div className="text-[9px] text-white/15">matches</div>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap mt-2">
                  {v.phases.map((p) => (
                    <span key={p} className="text-[8px] font-mono px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${phaseColors[p]}15`, color: `${phaseColors[p]}80` }}>
                      {phaseLabels[p]}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 mt-3 text-[10px] font-mono text-white/20">
                  <span>Cap: {v.capacity.toLocaleString()}</span>
                  <span>{Math.round((v.avgTempJuneF + v.avgTempJulyF) / 2)}°F</span>
                  <span>{v.humidityPct}% hum</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[11px] font-mono text-white/30 uppercase tracking-widest">
              {selectedVenue ? `Schedule — ${venues[selectedVenue]?.stadium}` : "Full Schedule"}
            </h3>
            <span className="text-[10px] font-mono text-white/15">{filteredSchedule.length} matches</span>
          </div>
          <div className="glass rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
            {filteredSchedule.length === 0 ? (
              <div className="p-8 text-center text-white/20 text-sm">No matches for this filter.</div>
            ) : (
              <table className="w-full text-[12px]">
                <thead className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md z-10">
                  <tr className="text-white/20 font-mono text-[9px] uppercase border-b border-white/[0.04]">
                    <th className="text-left py-2.5 px-4 font-normal">Date</th>
                    <th className="text-left py-2.5 px-2 font-normal">Time</th>
                    <th className="text-left py-2.5 px-2 font-normal">Phase</th>
                    <th className="text-left py-2.5 px-2 font-normal">Match</th>
                    {!selectedVenue && <th className="text-left py-2.5 px-2 font-normal">Venue</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedule.map((entry, i) => (
                    <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                      <td className="py-2 px-4 font-mono text-white/40">{entry.date}</td>
                      <td className="py-2 px-2 font-mono text-white/25">{entry.time}</td>
                      <td className="py-2 px-2">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: `${phaseColors[entry.phase]}15`, color: `${phaseColors[entry.phase]}70` }}>
                          {phaseLabels[entry.phase]}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-white/50">{entry.label}</td>
                      {!selectedVenue && (
                        <td className="py-2 px-2 text-white/20 text-[11px]">{venues[entry.venue]?.city.split("/")[0]}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Team Panel ──────────────────────────────────────────────────────────────

function TeamPanel({ team, onClose }: { team: Team; onClose: () => void }) {
  const [detail, setDetail] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setDetail(null);
    fetch(`/api/team?code=${team.code}`)
      .then((r) => r.json())
      .then((d) => { setDetail(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [team.code]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border-l border-white/[0.06] overflow-y-auto"
        style={{ animation: "slideIn 0.25s ease-out" }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        <div className="sticky top-0 z-10 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flag code={team.code} size={32} />
            <div>
              <h2 className="text-lg font-semibold text-white/90">{team.name}</h2>
              <p className="text-[11px] font-mono text-white/25">FIFA #{team.fifaRanking} · {team.confederation}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white/60 transition-colors cursor-pointer p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {loading ? (
            <div className="space-y-4">
              <div className="flex gap-3"><Skeleton className="h-20 flex-1" /><Skeleton className="h-20 flex-1" /></div>
              <Skeleton className="h-32" />
              <Skeleton className="h-48" />
              <Skeleton className="h-40" />
            </div>
          ) : detail ? (
            <>
              <div className="flex gap-3">
                <div className="glass rounded-xl p-4 flex-1 text-center">
                  <div className="text-2xl font-light text-white/90">{detail.detail.formRating}<span className="text-sm text-white/25">/10</span></div>
                  <div className="text-[10px] font-mono text-white/25 mt-1">FORM</div>
                </div>
                <div className="glass rounded-xl p-4 flex-1">
                  <div className="text-[12px] text-white/50 leading-relaxed">{detail.detail.tacticalStyle}</div>
                  <div className="text-[10px] font-mono text-white/25 mt-2">STYLE</div>
                </div>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="text-[10px] font-mono text-emerald-400/40 uppercase tracking-wider mb-2">Strengths</div>
                    {detail.detail.teamStrengths.map((s, i) => (
                      <div key={i} className="text-[12px] text-white/40 py-1 flex items-start gap-2">
                        <span className="text-emerald-400/30 mt-0.5">+</span> {s}
                      </div>
                    ))}
                  </div>
                  <div className="w-px bg-white/[0.06]" />
                  <div className="flex-1">
                    <div className="text-[10px] font-mono text-red-400/40 uppercase tracking-wider mb-2">Weaknesses</div>
                    {detail.detail.teamWeaknesses.map((w, i) => (
                      <div key={i} className="text-[12px] text-white/40 py-1 flex items-start gap-2">
                        <span className="text-red-400/30 mt-0.5">−</span> {w}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-3">Key Players</h3>
                <div className="space-y-2">
                  {detail.detail.topPlayers.map((player) => (
                    <div key={player.name} className="glass rounded-lg p-3 hover:bg-white/[0.03] transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white/70 font-medium">{player.name}</span>
                        <span className="text-[10px] font-mono text-[#3291ff]/50">{player.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-white/25">{player.position} · {player.club}</span>
                        <div className="flex gap-3 text-[10px] font-mono text-white/20">
                          <span>{player.caps} caps</span>
                          <span>{player.goals}G</span>
                          <span>{player.assists}A</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-3">Recent Matches</h3>
                <div className="space-y-1">
                  {detail.detail.recentMatches.map((match, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/[0.02] transition-colors text-[12px]">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium ${
                        match.result === "W" ? "bg-emerald-500/10 text-emerald-400/60" :
                        match.result === "D" ? "bg-yellow-500/10 text-yellow-400/60" :
                        "bg-red-500/10 text-red-400/60"
                      }`}>{match.result}</span>
                      <span className="text-white/50 flex-1">{match.opponent}</span>
                      <span className="font-mono text-white/30">{match.score}</span>
                      <span className="text-white/15 text-[10px]">{match.competition}</span>
                    </div>
                  ))}
                </div>
              </div>

              {detail.venues.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-3">Match Venues & Weather</h3>
                  <div className="space-y-3">
                    {detail.venues.map((venue, i) => (
                      <div key={i} className="glass rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-sm text-white/70 font-medium">{venue.stadium}</div>
                            <div className="text-[11px] text-white/25">{venue.city}, {venue.country}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-mono text-white/50">{venue.weather.tempF}°F</div>
                            <div className="text-[10px] text-white/20">{venue.weather.condition}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="bg-white/[0.02] rounded-lg p-2 text-center">
                            <div className="text-[11px] font-mono text-white/40">{venue.weather.tempF}°F</div>
                            <div className="text-[9px] text-white/15">Temp</div>
                          </div>
                          <div className="bg-white/[0.02] rounded-lg p-2 text-center">
                            <div className="text-[11px] font-mono text-white/40">{venue.weather.humidity}%</div>
                            <div className="text-[9px] text-white/15">Humidity</div>
                          </div>
                          <div className="bg-white/[0.02] rounded-lg p-2 text-center">
                            <div className="text-[11px] font-mono text-white/40">{venue.weather.rainChance}%</div>
                            <div className="text-[9px] text-white/15">Rain</div>
                          </div>
                        </div>
                        <div className="text-[11px] text-white/25 italic">{venue.weather.impact}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-white/20 text-sm">Failed to load team data.</div>
          )}
        </div>
      </div>
    </div>
  );
}
