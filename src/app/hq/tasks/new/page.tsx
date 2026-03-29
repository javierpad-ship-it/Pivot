import { prisma } from "@/lib/prisma";
import { NewTaskForm } from "@/components/hq/NewTaskForm";

export const dynamic = "force-dynamic";

export default async function NewTaskPage() {
  const [stores, brands, categories] = await Promise.all([
    prisma.store.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.itemCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Count Task</h1>
        <p className="text-sm text-gray-500 mt-1">Assign a cycle count task to a store</p>
      </div>
      <NewTaskForm stores={stores} brands={brands} categories={categories} />
    </div>
  );
}
