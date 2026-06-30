"use client";

import { useState } from "react";
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
    <div className="min-h-screen bg-[#0a0f1a]">
      <header className="border-b border-white/10 bg-gradient-to-r from-[#1a0a2e] via-[#0a1628] to-[#1a0a2e]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <span className="text-4xl">⚽</span>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                World Cup 2026 Predictor
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                AI-powered tournament predictions | USA · Canada · Mexico
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <button
            onClick={runAnalysis}
            disabled={analyzingState === "loading"}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:text-emerald-400 rounded-lg font-medium transition-colors text-sm cursor-pointer"
          >
            {analyzingState === "loading"
              ? "Analyzing..."
              : "Run Statistical Analysis"}
          </button>
          <button
            onClick={runPrediction}
            disabled={predictingState === "loading"}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:text-purple-400 rounded-lg font-medium transition-colors text-sm cursor-pointer"
          >
            {predictingState === "loading"
              ? "Predicting (this takes ~2 min)..."
              : "Predict Full Tournament"}
          </button>
        </div>

        <div className="flex gap-1 mb-6 border-b border-white/10">
          {(["groups", "analysis", "bracket"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors cursor-pointer ${
                activeTab === tab
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab === "bracket" ? "Tournament Bracket" : tab}
            </button>
          ))}
        </div>

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

      <footer className="border-t border-white/10 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500">
          Powered by Vercel AI Gateway · Workflows · Sandbox · Next.js
        </div>
      </footer>
    </div>
  );
}

function GroupsView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {groups.map((group) => (
        <div
          key={group.name}
          className="bg-white/5 border border-white/10 rounded-xl p-4"
        >
          <h3 className="text-sm font-bold text-yellow-400 mb-3">
            {group.name}
          </h3>
          <div className="space-y-2">
            {group.teams.map((team) => (
              <div
                key={team.code}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{team.flag}</span>
                  <span>{team.name}</span>
                </div>
                <span className="text-gray-500 text-xs">
                  #{team.fifaRanking}
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
      <div className="text-center py-20 text-gray-400">
        <div className="text-4xl mb-4 animate-spin">⚽</div>
        <p>Running statistical analysis in Vercel Sandbox...</p>
      </div>
    );
  if (!analysis)
    return (
      <div className="text-center py-20 text-gray-500">
        Click &quot;Run Statistical Analysis&quot; to compute team power
        rankings using Vercel Sandbox.
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(analysis.tierDistribution).map(([tier, count]) => (
          <div
            key={tier}
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
          >
            <div className="text-2xl font-bold text-yellow-400">{count}</div>
            <div className="text-xs text-gray-400 capitalize">{tier}</div>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-lg font-bold text-yellow-400 mb-4">
          Power Rankings
        </h3>
        <div className="space-y-2">
          {analysis.powerRankings.map((team, i) => (
            <div key={team.code} className="flex items-center gap-3 text-sm">
              <span className="text-gray-500 w-6 text-right">{i + 1}</span>
              <span className="text-lg">{team.flag}</span>
              <span className="flex-1">{team.name}</span>
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  team.tier === "Elite"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {team.tier}
              </span>
              <div className="w-32 bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-amber-400 h-2 rounded-full"
                  style={{ width: `${team.winProbability * 100}%` }}
                />
              </div>
              <span className="text-gray-400 text-xs w-12 text-right">
                {Math.round(team.winProbability * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-lg font-bold text-emerald-400 mb-4">
          Dark Horses
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {analysis.darkHorses.map((team) => (
            <div
              key={team.name}
              className="bg-white/5 rounded-lg p-3 text-center"
            >
              <span className="text-2xl">{team.flag}</span>
              <div className="text-sm mt-1">{team.name}</div>
              <div className="text-xs text-gray-500">
                Strength: {team.overallStrength}
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
      <div className="text-center py-20 text-gray-400">
        <div className="text-4xl mb-4 animate-spin">⚽</div>
        <p>AI is predicting the tournament via Vercel Workflow...</p>
        <p className="text-xs mt-2 text-gray-500">
          Each round is a durable workflow step with AI analysis
        </p>
      </div>
    );
  if (!prediction)
    return (
      <div className="text-center py-20 text-gray-500">
        Click &quot;Predict Full Tournament&quot; to run the AI prediction
        workflow.
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
    <div className="space-y-8">
      <div className="text-center py-6 bg-gradient-to-r from-yellow-500/10 via-amber-500/20 to-yellow-500/10 rounded-xl border border-yellow-500/30">
        <div className="text-5xl mb-2">🏆</div>
        <div className="text-2xl font-bold text-yellow-400">
          {prediction.champion}
        </div>
        <div className="text-sm text-gray-400">Predicted Champion</div>
      </div>

      {rounds
        .slice()
        .reverse()
        .map((round) => (
          <div key={round.name}>
            <h3 className="text-lg font-bold text-yellow-400 mb-3">
              {round.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {round.data.matches.map((match, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-emerald-400">
                      {match.winner}
                    </span>
                    <span className="text-xs text-yellow-400 font-mono">
                      {match.score}
                    </span>
                    <span className="text-sm text-gray-500">{match.loser}</span>
                  </div>
                  <p className="text-xs text-gray-500">{match.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

      <div>
        <h3 className="text-lg font-bold text-yellow-400 mb-3">
          Group Stage Predictions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {prediction.groupStage.groups.map((group) => (
            <div
              key={group.groupName}
              className="bg-white/5 border border-white/10 rounded-lg p-3"
            >
              <h4 className="text-xs font-bold text-yellow-400 mb-2">
                {group.groupName}
              </h4>
              {group.standings.map((team, i) => (
                <div
                  key={team.code}
                  className={`flex items-center justify-between text-xs py-1 ${i < 2 ? "text-emerald-400" : i === 2 ? "text-yellow-500" : "text-gray-500"}`}
                >
                  <span>
                    {i + 1}. {team.team}
                  </span>
                  <span>
                    {team.points}pts (GD: {team.goalDifference > 0 ? "+" : ""}
                    {team.goalDifference})
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
