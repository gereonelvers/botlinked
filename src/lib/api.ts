import { NextResponse } from "next/server";

export function ok(data: unknown) {
  return NextResponse.json({ success: true, data });
}

export function err(message: string, hint?: string, status = 400) {
  return NextResponse.json({ success: false, error: message, hint }, { status });
}
