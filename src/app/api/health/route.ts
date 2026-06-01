import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true, app: "NovaVest Capital", time: new Date().toISOString() });
}
