import { generateObject } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { z } from "zod";
import { groups } from "../src/lib/teams";

const matchResultSchema = z.object({
  winner: z.string(),
  winnerCode: z.string(),
  loser: z.string(),
  loserCode: z.string(),
  score: z.string(),
  reasoning: z.string(),
});

const roundSchema = z.object({
  matches: z.array(matchResultSchema),
});

const groupResultSchema = z.object({
  standings: z.array(
    z.object({
      position: z.number(),
      team: z.string(),
      code: z.string(),
      points: z.number(),
      goalDifference: z.number(),
    })
  ),
});

const allGroupsSchema = z.object({
  groups: z.array(
    z.object({
      groupName: z.string(),
      standings: groupResultSchema.shape.standings,
    })
  ),
  qualifiedTeams: z.array(
    z.object({
      team: z.string(),
      code: z.string(),
      qualifiedAs: z.string(),
    })
  ),
});

export async function predictTournament() {
  "use workflow";

  const groupResults = await predictGroupStage();
  const ro32Results = await predictRound(
    "Round of 32",
    groupResults.qualifiedTeams.map((t) => t.team),
    groupResults
  );
  const ro16Results = await predictRound(
    "Round of 16",
    ro32Results.matches.map((m) => m.winner),
    groupResults
  );
  const quarterResults = await predictRound(
    "Quarter-Finals",
    ro16Results.matches.map((m) => m.winner),
    groupResults
  );
  const semiResults = await predictRound(
    "Semi-Finals",
    quarterResults.matches.map((m) => m.winner),
    groupResults
  );
  const finalResult = await predictRound(
    "Final",
    semiResults.matches.map((m) => m.winner),
    groupResults
  );

  return {
    groupStage: groupResults,
    roundOf32: ro32Results,
    roundOf16: ro16Results,
    quarterFinals: quarterResults,
    semiFinals: semiResults,
    final: finalResult,
    champion: finalResult.matches[0]?.winner ?? "Unknown",
  };
}

async function predictGroupStage() {
  "use step";

  const groupsDescription = groups
    .map(
      (g) =>
        `${g.name}: ${g.teams.map((t) => `${t.name} (FIFA #${t.fifaRanking})`).join(", ")}`
    )
    .join("\n");

  const { object } = await generateObject({
    model: gateway("openai/gpt-4o"),
    schema: allGroupsSchema,
    prompt: `You are a football/soccer analytics expert. Predict the 2026 FIFA World Cup group stage results.

Here are the groups:
${groupsDescription}

For each group, predict the final standings (1st through 4th) with points and goal difference.
Then determine the 32 teams that qualify: top 2 from each group (24 teams) + 8 best third-place teams.
For qualifiedAs, use "1st in Group X", "2nd in Group X", or "3rd in Group X (best third)".

Base your predictions on:
- Current FIFA rankings
- Recent tournament performance (2022 World Cup, continental championships)
- Squad quality and key players
- Historical World Cup performance`,
  });

  return object;
}

async function predictRound(
  roundName: string,
  teams: string[],
  groupResults: z.infer<typeof allGroupsSchema>
) {
  "use step";

  const pairings: string[] = [];
  for (let i = 0; i < teams.length; i += 2) {
    if (teams[i + 1]) {
      pairings.push(`${teams[i]} vs ${teams[i + 1]}`);
    }
  }

  const { object } = await generateObject({
    model: gateway("openai/gpt-4o"),
    schema: roundSchema,
    prompt: `You are a football/soccer analytics expert predicting the 2026 FIFA World Cup.

This is the ${roundName}. Predict the winner of each match:

${pairings.map((p, i) => `Match ${i + 1}: ${p}`).join("\n")}

Group stage context: ${JSON.stringify(groupResults.groups.map((g) => ({ group: g.groupName, top: g.standings.slice(0, 2).map((s) => s.team) })))}

For each match, predict:
- The winner (no draws in knockout rounds)
- A realistic score
- Brief reasoning based on team quality, form, and matchup dynamics`,
  });

  return object;
}
