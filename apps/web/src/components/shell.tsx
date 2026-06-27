import Link from "next/link";
import type { ReactNode } from "react";

type ShellProps = {
  children: ReactNode;
};

export function Shell({ children }: ShellProps) {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur xl:flex-row xl:items-center xl:justify-between">
          <div>
            <Link href="/" className="text-2xl font-semibold tracking-tight">
              Lua Script Hub
            </Link>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              พื้นที่จัดเก็บ ดูเวอร์ชัน และเสิร์ฟ Lua script ที่คุณมีสิทธิ์ใช้งานอย่างถูกต้อง
            </p>
          </div>
          <nav className="flex flex-wrap gap-3 text-sm text-slate-200">
            <Link href="/" className="rounded-full border border-white/10 px-4 py-2 hover:bg-white/10">
              Landing
            </Link>
            <Link href="/dashboard" className="rounded-full border border-white/10 px-4 py-2 hover:bg-white/10">
              Dashboard
            </Link>
            <Link href="/login" className="rounded-full border border-white/10 px-4 py-2 hover:bg-white/10">
              Login
            </Link>
            <Link href="/register" className="rounded-full bg-accent px-4 py-2 text-white shadow-glow">
              Register
            </Link>
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
