"use client";

export default function HQError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-xl border border-red-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-red-700 mb-2">Error en la página</h2>
        <p className="text-sm text-gray-600 mb-4 font-mono bg-gray-50 p-3 rounded border break-all">
          {error.message || "Error desconocido"}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4">ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
