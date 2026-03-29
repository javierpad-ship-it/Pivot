import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const storeId = searchParams.get("storeId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const brandId = searchParams.get("brandId") ?? undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;

  const tasks = await prisma.countTask.findMany({
    where: {
      ...(storeId ? { storeId } : {}),
      ...(status ? { status } : {}),
      ...(brandId ? { brandId } : {}),
      ...(categoryId ? { categoryId } : {}),
    },
    include: {
      store: true,
      brand: true,
      category: true,
      countRecord: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { storeId, brandId, categoryId } = body;

  if (!storeId || !brandId || !categoryId) {
    return NextResponse.json(
      { error: "storeId, brandId, and categoryId are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.countTask.findFirst({
    where: { storeId, brandId, categoryId },
  });

  if (existing) {
    return NextResponse.json(
      { error: "A task for this store, brand, and category combination already exists" },
      { status: 409 }
    );
  }

  const task = await prisma.countTask.create({
    data: { storeId, brandId, categoryId, status: "PENDING" },
    include: { store: true, brand: true, category: true, countRecord: true },
  });

  return NextResponse.json(task, { status: 201 });
}
