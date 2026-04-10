import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { day: string } }) {
  const dayOfWeek = parseInt(params.day);
  if (isNaN(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
    return NextResponse.json({ error: "Día inválido" }, { status: 400 });
  }
  const { enabled } = await req.json();
  const updated = await prisma.configDia.update({
    where: { dayOfWeek },
    data: { enabled },
  });
  return NextResponse.json(updated);
}
