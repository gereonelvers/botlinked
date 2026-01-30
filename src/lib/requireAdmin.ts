import { NextRequest, NextResponse } from "next/server";
import { err } from "@/lib/api";

type AdminAuthResult =
  | { authorized: true; response?: undefined }
  | { authorized: false; response: NextResponse };

export function requireAdmin(req: NextRequest): AdminAuthResult {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    return { authorized: false, response: err("Admin API not configured", "Set ADMIN_API_KEY environment variable", 500) };
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return { authorized: false, response: err("Unauthorized", "Provide admin API key as Bearer token", 401) };
  }

  if (token !== adminKey) {
    return { authorized: false, response: err("Forbidden", "Invalid admin API key", 403) };
  }

  return { authorized: true };
}
