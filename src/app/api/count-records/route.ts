export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { taskId, quantity, employeeName } = body;

  if (!taskId || quantity === undefined || quantity === null || !employeeName) {
    return NextResponse.json(
      { error: "taskId, quantity, and employeeName are required" },
      { status: 400 }
    );
  }

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 0) {
    return NextResponse.json(
      { error: "quantity must be a non-negative integer" },
      { status: 400 }
    );
  }

  const task = await prisma.countTask.findUnique({ where: { id: taskId } });
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const existingRecord = await prisma.countRecord.findUnique({ where: { taskId } });
  if (existingRecord) {
    return NextResponse.json(
      { error: "A count record for this task already exists" },
      { status: 409 }
    );
  }

  const [record] = await prisma.$transaction([
    prisma.countRecord.create({
      data: {
        taskId,
        quantity: qty,
        employeeName: employeeName.trim(),
        countedAt: new Date(),
      },
    }),
    prisma.countTask.update({
      where: { id: taskId },
      data: { status: "COMPLETED" },
    }),
  ]);

  return NextResponse.json(record, { status: 201 });
}
