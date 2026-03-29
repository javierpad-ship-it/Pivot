import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { storeId?: string; status?: string; brandId?: string; categoryId?: string };
}

export default async function TasksPage({ searchParams }: Props) {
  const [tasks, stores, brands, categories] = await Promise.all([
    prisma.countTask.findMany({
      where: {
        ...(searchParams.storeId ? { storeId: searchParams.storeId } : {}),
        ...(searchParams.status ? { status: searchParams.status } : {}),
        ...(searchParams.brandId ? { brandId: searchParams.brandId } : {}),
        ...(searchParams.categoryId ? { categoryId: searchParams.categoryId } : {}),
      },
      include: { store: true, brand: true, category: true, countRecord: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.store.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.itemCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Count Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">{tasks.length} tasks found</p>
        </div>
        <Link href="/hq/tasks/new">
          <Button size="md">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <select
          name="storeId"
          defaultValue={searchParams.storeId ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Stores</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          name="brandId"
          defaultValue={searchParams.brandId ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select
          name="categoryId"
          defaultValue={searchParams.categoryId ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          name="status"
          defaultValue={searchParams.status ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Filter
        </button>

        {(searchParams.storeId || searchParams.status || searchParams.brandId || searchParams.categoryId) && (
          <Link href="/hq/tasks" className="px-4 py-2 text-gray-600 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            Clear
          </Link>
        )}
      </form>

      {/* Task table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Store</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Brand</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Count</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Employee</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No tasks found. <Link href="/hq/tasks/new" className="text-blue-600 hover:underline">Create one.</Link>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900">{task.store.name}</p>
                      <p className="text-xs text-gray-400">{task.store.location}</p>
                    </td>
                    <td className="px-6 py-3 text-gray-700">{task.brand.name}</td>
                    <td className="px-6 py-3 text-gray-700">{task.category.name}</td>
                    <td className="px-6 py-3">
                      <Badge variant={task.status === "COMPLETED" ? "green" : "yellow"}>
                        {task.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      {task.countRecord ? task.countRecord.quantity : "—"}
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      {task.countRecord ? task.countRecord.employeeName : "—"}
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
