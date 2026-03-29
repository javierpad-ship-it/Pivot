"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

interface Store { id: string; name: string; location: string }
interface Brand { id: string; name: string }
interface Category { id: string; name: string }

interface Props {
  stores: Store[];
  brands: Brand[];
  categories: Category[];
}

export function NewTaskForm({ stores, brands, categories }: Props) {
  const router = useRouter();
  const [storeId, setStoreId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!storeId || !brandId || !categoryId) {
      setError("Please select a store, brand, and category.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, brandId, categoryId }),
      });

      if (res.status === 409) {
        setError("A task for this store, brand, and category combination already exists.");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/hq/tasks"), 1500);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardBody className="py-10 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-semibold text-gray-900">Task Created</p>
          <p className="text-sm text-gray-500 mt-1">Redirecting to task list…</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Select
            id="store"
            label="Store Location"
            placeholder="Select a store…"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            options={stores.map((s) => ({ value: s.id, label: `${s.name} — ${s.location}` }))}
          />

          <Select
            id="brand"
            label="Brand"
            placeholder="Select a brand…"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            options={brands.map((b) => ({ value: b.id, label: b.name }))}
          />

          <Select
            id="category"
            label="Item Category"
            placeholder="Select a category…"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">
              Create Task
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/hq/tasks")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
