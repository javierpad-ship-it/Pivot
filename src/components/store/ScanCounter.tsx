"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Props {
  count: number;
  onChange: (count: number) => void;
}

export function ScanCounter({ count, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanBuffer, setScanBuffer] = useState("");
  const [recentScans, setRecentScans] = useState<string[]>([]);
  const [flash, setFlash] = useState(false);
  const [focused, setFocused] = useState(true);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
    setFocused(true);
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const barcode = scanBuffer.trim();
      if (!barcode) return;
      onChange(count + 1);
      setRecentScans((prev) => [barcode, ...prev].slice(0, 8));
      setScanBuffer("");
      setFlash(true);
      setTimeout(() => setFlash(false), 300);
    }
  }

  function handleUndo() {
    if (count > 0) {
      onChange(count - 1);
      setRecentScans((prev) => prev.slice(1));
    }
  }

  function handleReset() {
    onChange(0);
    setRecentScans([]);
    setScanBuffer("");
    focusInput();
  }

  return (
    <div className="space-y-4">
      {/* Hidden input that captures scanner HID output */}
      <input
        ref={inputRef}
        type="text"
        inputMode="none"
        value={scanBuffer}
        onChange={(e) => setScanBuffer(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          // Auto-refocus after brief delay to handle tap-to-focus elsewhere
          setTimeout(() => {
            inputRef.current?.focus();
          }, 200);
        }}
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px" }}
      />

      {/* Counter display */}
      <div
        onClick={focusInput}
        className={`rounded-2xl p-8 text-center border-2 transition-all cursor-pointer select-none ${
          flash
            ? "bg-green-50 border-green-400"
            : "bg-blue-50 border-blue-200"
        }`}
      >
        <p className={`text-7xl font-bold tabular-nums transition-colors ${flash ? "text-green-600" : "text-blue-700"}`}>
          {count}
        </p>
        <p className={`text-sm mt-2 transition-colors ${flash ? "text-green-500" : "text-blue-500"}`}>
          {count === 1 ? "unidad escaneada" : "unidades escaneadas"}
        </p>
      </div>

      {/* Scan zone */}
      <div
        onClick={focusInput}
        className="relative bg-white border-2 border-dashed border-gray-300 rounded-xl px-4 py-5 text-center cursor-pointer hover:border-blue-400 transition-colors"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          {focused ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <p className="text-sm font-semibold text-gray-800">Listo para escanear</p>
            </>
          ) : (
            <>
              <span className="relative flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-400" />
              </span>
              <p className="text-sm font-semibold text-orange-700">Toca aquí para activar</p>
            </>
          )}
        </div>
        <p className="text-xs text-gray-400">
          {focused
            ? "Apunta el escáner a cada unidad — cada escaneo suma 1"
            : "El área de escaneo perdió el foco"}
        </p>
        {scanBuffer && (
          <p className="text-xs text-blue-600 mt-2 font-mono">Leyendo: {scanBuffer}</p>
        )}
      </div>

      {/* Action buttons */}
      {count > 0 && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUndo}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Deshacer último
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="py-2.5 px-4 bg-gray-100 text-gray-600 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-200 active:scale-95 transition-all"
          >
            Limpiar
          </button>
        </div>
      )}

      {/* Recent scans */}
      {recentScans.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Últimos escaneos</p>
          <div className="space-y-1.5">
            {recentScans.map((code, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 ${
                    i === 0 ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  {i === 0 ? "✓" : i + 1}
                </span>
                <span className="text-xs font-mono text-gray-600 truncate">{code}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
