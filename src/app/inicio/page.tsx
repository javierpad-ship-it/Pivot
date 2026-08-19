import { LogoutButton } from "@/components/store/LogoutButton";

export default function InicioPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex items-center gap-4 text-gray-300">
        <span className="text-sm font-medium tracking-wide">Source Manager</span>
        <span className="text-gray-200">·</span>
        <LogoutButton className="text-sm text-gray-400 hover:text-gray-600 transition-colors" />
      </div>
    </div>
  );
}
