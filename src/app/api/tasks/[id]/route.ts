import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const task = await prisma.countTask.findUnique({
    where: { id: params.id },
    include: { store: true, brand: true, category: true, countRecord: true },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { status } = body;

  if (!status || !["PENDING", "COMPLETED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const task = await prisma.countTask.update({
    where: { id: params.id },
    data: { status },
    include: { store: true, brand: true, category: true, countRecord: true },
  });

  return NextResponse.json(task);
}
