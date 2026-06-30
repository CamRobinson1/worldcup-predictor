import { getRun } from "workflow/api";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const runId = searchParams.get("runId");

  if (!runId) {
    return NextResponse.json({ error: "Missing runId" }, { status: 400 });
  }

  const run = getRun(runId);
  const status = await run.status;

  if (status === "completed") {
    const output = await run.returnValue;
    return NextResponse.json({ status: "completed", output });
  }

  return NextResponse.json({ status });
}
