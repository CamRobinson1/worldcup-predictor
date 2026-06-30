import { Sandbox } from "@vercel/sandbox";
import { NextResponse } from "next/server";
import { groups } from "../../../lib/teams";

export async function POST(req: Request) {
  const { teamCodes } = await req.json();

  const teamData = groups
    .flatMap((g) => g.teams)
    .filter((t) => !teamCodes || teamCodes.includes(t.code));

  const analysisCode = `
const teams = ${JSON.stringify(teamData)};

function calculateStrength(team) {
  const rankingScore = Math.max(0, 100 - team.fifaRanking);
  const confBonus = {
    UEFA: 12, CONMEBOL: 10, CONCACAF: 5, CAF: 5, AFC: 4, OFC: 2
  }[team.confederation] || 0;

  const historicalBonus = {
    BRA: 15, GER: 14, ARG: 14, FRA: 13, ESP: 12, ENG: 10,
    NED: 10, POR: 9, URU: 9, ITA: 8, BEL: 7, CRO: 7,
    JPN: 5, KOR: 5, MEX: 5, USA: 5, MAR: 6, COL: 5,
  }[team.code] || 0;

  return {
    name: team.name,
    code: team.code,
    flag: team.flag,
    fifaRanking: team.fifaRanking,
    rankingScore,
    confederationBonus: confBonus,
    historicalBonus,
    overallStrength: rankingScore + confBonus + historicalBonus,
    tier: rankingScore + confBonus + historicalBonus > 100 ? 'Elite'
        : rankingScore + confBonus + historicalBonus > 80 ? 'Strong'
        : rankingScore + confBonus + historicalBonus > 60 ? 'Competitive'
        : 'Underdog',
    winProbability: Math.round(
      (rankingScore + confBonus + historicalBonus) / 1.3
    ) / 100,
  };
}

function predictHeadToHead(teamA, teamB) {
  const strA = calculateStrength(teamA);
  const strB = calculateStrength(teamB);
  const total = strA.overallStrength + strB.overallStrength;
  return {
    match: teamA.name + ' vs ' + teamB.name,
    team1: { name: teamA.name, winProb: Math.round(strA.overallStrength / total * 100) },
    team2: { name: teamB.name, winProb: Math.round(strB.overallStrength / total * 100) },
    predicted: strA.overallStrength > strB.overallStrength ? teamA.name : teamB.name,
  };
}

const rankings = teams
  .map(calculateStrength)
  .sort((a, b) => b.overallStrength - a.overallStrength);

const topContenders = rankings.slice(0, 10);
const darkHorses = rankings.filter(t => t.tier === 'Competitive').slice(0, 5);

const sampleMatchups = [];
for (let i = 0; i < Math.min(5, Math.floor(teams.length / 2)); i++) {
  const a = teams[i * 2];
  const b = teams[i * 2 + 1];
  if (a && b) sampleMatchups.push(predictHeadToHead(a, b));
}

console.log(JSON.stringify({
  totalTeams: teams.length,
  powerRankings: topContenders,
  darkHorses,
  sampleMatchups,
  tierDistribution: {
    elite: rankings.filter(t => t.tier === 'Elite').length,
    strong: rankings.filter(t => t.tier === 'Strong').length,
    competitive: rankings.filter(t => t.tier === 'Competitive').length,
    underdog: rankings.filter(t => t.tier === 'Underdog').length,
  },
}));
`;

  const sandbox = await Sandbox.create({
    runtime: "node24",
    timeout: 30_000,
  });

  try {
    await sandbox.writeFiles([
      { path: "analysis.js", content: Buffer.from(analysisCode) },
    ]);

    const result = await sandbox.runCommand("node", ["analysis.js"]);
    const stdout = await result.stdout();
    const stderr = await result.stderr();

    if (result.exitCode !== 0) {
      return NextResponse.json(
        { error: "Analysis failed", stderr },
        { status: 500 }
      );
    }

    const analysis = JSON.parse(stdout);
    return NextResponse.json(analysis);
  } finally {
    await sandbox.stop();
  }
}
