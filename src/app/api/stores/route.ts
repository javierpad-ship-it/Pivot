export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const stores = await prisma.store.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(stores);
}

export async function POST(req: NextRequest) {
  const { name, location } = await req.json();
  if (!name?.trim() || !location?.trim()) {
    return NextResponse.json({ error: "Nombre y ubicación son requeridos" }, { status: 400 });
  }
  const store = await prisma.store.create({ data: { name: name.trim(), location: location.trim() } });
  return NextResponse.json(store, { status: 201 });
}
