export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const dias = await prisma.configDia.findMany({ orderBy: { dayOfWeek: "asc" } });
  return NextResponse.json(dias);
}
