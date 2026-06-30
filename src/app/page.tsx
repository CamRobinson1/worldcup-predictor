"use client";

import { useState, useRef, useCallback, type MouseEvent as ReactMouseEvent } from "react";
import { groups } from "../lib/teams";

type AnalysisResult = {
  totalTeams: number;
  powerRankings: Array<{
    name: string;
    code: string;
    flag: string;
    fifaRanking: number;
    overallStrength: number;
    tier: string;
    winProbability: number;
  }>;
  darkHorses: Array<{
    name: string;
    flag: string;
    overallStrength: number;
    tier: string;
  }>;
  sampleMatchups: Array<{
    match: string;
    team1: { name: string; winProb: number };
    team2: { name: string; winProb: number };
    predicted: string;
  }>;
  tierDistribution: {
    elite: number;
    strong: number;
    competitive: number;
    underdog: number;
  };
};

type TournamentPrediction = {
  groupStage: {
    groups: Array<{
      groupName: string;
      standings: Array<{
        position: number;
        team: string;
        code: string;
        points: number;
        goalDifference: number;
      }>;
    }>;
    qualifiedTeams: Array<{
      team: string;
      code: string;
      qualifiedAs: string;
    }>;
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
    winner: string;
    winnerCode: string;
    loser: string;
    loserCode: string;
    score: string;
    reasoning: string;
  }>;
};

function MagneticButton({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLButtonElement>) => {
      if (!ref.current || disabled) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      ref.current.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px) scale(1.02)`;
    },
    [disabled]
  );

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0, 0) scale(1)";
  }, []);

  const base =
    "magnetic-btn relative px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40";
  const variants = {
    primary:
      "bg-[#0070f3]/10 text-[#3291ff] border border-[#0070f3]/20 hover:bg-[#0070f3]/15 hover:border-[#0070f3]/30 hover:shadow-[0_0_30px_rgba(0,112,243,0.1)]",
    secondary:
      "bg-white/[0.03] text-white/70 border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 hover:text-white/90",
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${base} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

export default function Home() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [prediction, setPrediction] = useState<TournamentPrediction | null>(
    null
  );
  const [analyzingState, setAnalyzingState] = useState<
    "idle" | "loading" | "done"
  >("idle");
  const [predictingState, setPredictingState] = useState<
    "idle" | "loading" | "done"
  >("idle");
  const [activeTab, setActiveTab] = useState<
    "groups" | "analysis" | "bracket"
  >("groups");
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    setAnalyzingState("loading");
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAnalysis(data);
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
        if (!statusRes.ok) {
          attempts++;
          continue;
        }
        const statusData = await statusRes.json();
        if (statusData.status === "completed" && statusData.output) {
          setPrediction(statusData.output);
          setPredictingState("done");
          setActiveTab("bracket");
          return;
        }
        if (statusData.status === "failed") {
          throw new Error("Prediction workflow failed");
        }
        attempts++;
      }
      throw new Error("Prediction timed out");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Prediction failed");
      setPredictingState("idle");
    }
  }

  return (
    <div className="relative min-h-screen bg-black text-white/90">
      <div className="noise-bg" />
      <div className="grid-bg" />

      <div className="relative z-10">
        <header className="border-b border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gradient">
                  World Cup 2026
                </h1>
                <p className="text-[13px] text-white/30 mt-1 tracking-wide">
                  Tournament predictions — USA · Canada · Mexico
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/20 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                Live
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {error && (
            <div className="mb-6 p-4 glass rounded-xl border-red-500/20 bg-red-500/[0.04] text-red-400/80 text-sm fade-in">
              {error}
            </div>
          )}

          <div className="flex gap-3 mb-8">
            <MagneticButton
              onClick={runAnalysis}
              disabled={analyzingState === "loading"}
              variant="secondary"
            >
              {analyzingState === "loading" ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Analyzing...
                </span>
              ) : (
                "Run Analysis"
              )}
            </MagneticButton>
            <MagneticButton
              onClick={runPrediction}
              disabled={predictingState === "loading"}
            >
              {predictingState === "loading" ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Predicting...
                </span>
              ) : (
                "Predict Tournament"
              )}
            </MagneticButton>
          </div>

          <div className="flex gap-0 mb-8">
            {(["groups", "analysis", "bracket"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-[13px] font-medium capitalize transition-all duration-200 cursor-pointer border-b-[1.5px] ${
                  activeTab === tab
                    ? "text-white/90 border-white/40"
                    : "text-white/25 border-transparent hover:text-white/50"
                }`}
              >
                {tab === "bracket" ? "Bracket" : tab}
              </button>
            ))}
          </div>

          <div className="fade-in">
            {activeTab === "groups" && <GroupsView />}
            {activeTab === "analysis" && (
              <AnalysisView
                analysis={analysis}
                loading={analyzingState === "loading"}
              />
            )}
            {activeTab === "bracket" && (
              <BracketView
                prediction={prediction}
                loading={predictingState === "loading"}
              />
            )}
          </div>
        </div>

        <footer className="border-t border-white/[0.04] mt-20">
          <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
            <span className="text-[11px] text-white/15 font-mono">
              vercel / ai-gateway · workflows · sandbox
            </span>
            <span className="text-[11px] text-white/15">2026</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none">
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="2"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GroupsView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {groups.map((group) => (
        <div key={group.name} className="glass rounded-xl p-4 hover:bg-white/[0.04] transition-colors duration-200">
          <h3 className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-3">
            {group.name}
          </h3>
          <div className="space-y-2.5">
            {group.teams.map((team) => (
              <div
                key={team.code}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{team.flag}</span>
                  <span className="text-white/70">{team.name}</span>
                </div>
                <span className="text-[11px] font-mono text-white/20">
                  {team.fifaRanking}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalysisView({
  analysis,
  loading,
}: {
  analysis: AnalysisResult | null;
  loading: boolean;
}) {
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Spinner />
        <p className="text-sm text-white/30">Running analysis in sandbox...</p>
      </div>
    );
  if (!analysis)
    return (
      <div className="text-center py-24 text-white/20 text-sm">
        Run analysis to compute team power rankings.
      </div>
    );

  return (
    <div className="space-y-6 fade-in">
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(analysis.tierDistribution).map(([tier, count]) => (
          <div key={tier} className="glass rounded-xl p-5 text-center">
            <div className="text-2xl font-light text-white/90 tabular-nums">
              {count}
            </div>
            <div className="text-[11px] font-mono text-white/25 uppercase tracking-wider mt-1">
              {tier}
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-5">
          Power Rankings
        </h3>
        <div className="space-y-3">
          {analysis.powerRankings.map((team, i) => (
            <div key={team.code} className="flex items-center gap-4 text-sm group">
              <span className="text-white/15 font-mono text-[11px] w-5 text-right tabular-nums">
                {i + 1}
              </span>
              <span className="text-base">{team.flag}</span>
              <span className="flex-1 text-white/60 group-hover:text-white/80 transition-colors">
                {team.name}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono tracking-wide ${
                  team.tier === "Elite"
                    ? "bg-[#0070f3]/10 text-[#3291ff]/70"
                    : "bg-white/[0.04] text-white/30"
                }`}
              >
                {team.tier}
              </span>
              <div className="w-28 h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0070f3]/40 to-[#0070f3]/20"
                  style={{ width: `${team.winProbability * 100}%` }}
                />
              </div>
              <span className="text-white/20 font-mono text-[11px] w-10 text-right tabular-nums">
                {Math.round(team.winProbability * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-5">
          Dark Horses
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {analysis.darkHorses.map((team) => (
            <div
              key={team.name}
              className="glass rounded-lg p-4 text-center hover:bg-white/[0.04] transition-colors"
            >
              <span className="text-2xl">{team.flag}</span>
              <div className="text-sm text-white/60 mt-2">{team.name}</div>
              <div className="text-[10px] font-mono text-white/20 mt-1">
                {team.overallStrength}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BracketView({
  prediction,
  loading,
}: {
  prediction: TournamentPrediction | null;
  loading: boolean;
}) {
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Spinner />
        <div className="text-center">
          <p className="text-sm text-white/30">Predicting tournament...</p>
          <p className="text-[11px] text-white/15 mt-1">
            Each round runs as a durable workflow step
          </p>
        </div>
      </div>
    );
  if (!prediction)
    return (
      <div className="text-center py-24 text-white/20 text-sm">
        Run prediction to simulate the full tournament.
      </div>
    );

  const rounds: { name: string; data: RoundResult }[] = [
    { name: "Round of 32", data: prediction.roundOf32 },
    { name: "Round of 16", data: prediction.roundOf16 },
    { name: "Quarter-Finals", data: prediction.quarterFinals },
    { name: "Semi-Finals", data: prediction.semiFinals },
    { name: "Final", data: prediction.final },
  ];

  return (
    <div className="space-y-8 fade-in">
      <div className="glass-strong rounded-2xl p-8 text-center glow-accent">
        <div className="text-[11px] font-mono text-white/25 uppercase tracking-widest mb-3">
          Predicted Champion
        </div>
        <div className="text-3xl font-semibold text-gradient">
          {prediction.champion}
        </div>
      </div>

      {rounds
        .slice()
        .reverse()
        .map((round) => (
          <div key={round.name}>
            <h3 className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-3">
              {round.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {round.data.matches.map((match, i) => (
                <div
                  key={i}
                  className="glass rounded-xl p-4 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white/80">
                      {match.winner}
                    </span>
                    <span className="text-[11px] font-mono text-[#3291ff]/60 px-2 py-0.5 bg-[#0070f3]/5 rounded">
                      {match.score}
                    </span>
                    <span className="text-sm text-white/25">
                      {match.loser}
                    </span>
                  </div>
                  <p className="text-[12px] text-white/20 leading-relaxed">
                    {match.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

      <div>
        <h3 className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-3">
          Group Stage
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {prediction.groupStage.groups.map((group) => (
            <div key={group.groupName} className="glass rounded-xl p-4">
              <h4 className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-2">
                {group.groupName}
              </h4>
              {group.standings.map((team, i) => (
                <div
                  key={team.code}
                  className={`flex items-center justify-between text-[12px] py-1.5 ${
                    i < 2
                      ? "text-white/60"
                      : i === 2
                        ? "text-white/30"
                        : "text-white/15"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-white/15 font-mono text-[10px] w-3">
                      {i + 1}
                    </span>
                    {team.team}
                  </span>
                  <span className="font-mono text-[10px]">
                    {team.points}pts
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
