"use client";

interface Props {
  url: string;
  disabled?: boolean;
}

export function ExportButton({ url, disabled }: Props) {
  return (
    <a
      href={disabled ? undefined : url}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
        ${disabled
          ? "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
          : "bg-green-600 text-white hover:bg-green-700"
        }`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export CSV
    </a>
  );
}
