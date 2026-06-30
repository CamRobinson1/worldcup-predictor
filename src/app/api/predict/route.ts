import { start } from "workflow/api";
import { predictTournament } from "../../../../workflows/predict-tournament";
import { NextResponse } from "next/server";

export async function POST() {
  const run = await start(predictTournament, []);
  return NextResponse.json({ runId: run.runId, status: "started" });
}
