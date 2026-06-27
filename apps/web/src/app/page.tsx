import Link from "next/link";

import { Shell } from "@/components/shell";
import { fetchJson, getApiUrl } from "@/lib/api";

type ScriptListItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  isObfuscated: boolean;
  tags: string[];
  owner: { username: string };
};

async function getScripts() {
  try {
    return await fetchJson<ScriptListItem[]>("/api/v1/scripts");
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const scripts = await getScripts();

  return (
    <Shell>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur">
          <p className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-200">
            Render Ready Lua Script Hosting
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
            เก็บ Lua script แบบเป็นระบบ พร้อมหน้าเว็บและ raw endpoint สำหรับนำไปใช้ต่อ
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">
            ระบบนี้รองรับการจัดเก็บสคริปต์ที่คุณเตรียมไว้แล้ว, จัดการเวอร์ชัน, เปิดหน้าแสดงรายละเอียด,
            และดึง raw content ผ่าน API ได้โดยตรง เหมาะกับการใช้งานผ่าน GitHub และ Render
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-full bg-accent px-5 py-3 font-medium text-white shadow-glow">
              เปิด Dashboard
            </Link>
            <a href={getApiUrl("/health")} className="rounded-full border border-white/10 px-5 py-3 text-slate-200">
              API Health Check
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">What You Get</p>
          <ul className="mt-6 space-y-4 text-sm text-slate-200">
            <li>JWT auth, roles, rate limit, audit log, Prisma schema และ PostgreSQL-ready</li>
            <li>Next.js dashboard สำหรับดูรายการสคริปต์, รายละเอียด, auth และอัปโหลด</li>
            <li>Endpoint แบบ `GET /api/v1/scripts/:slug/raw` สำหรับดึง script content ตรง</li>
            <li>รองรับ Redis cache ได้เมื่อกำหนด `REDIS_URL` บน Render</li>
          </ul>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {scripts.length > 0 ? (
          scripts.map((script) => (
            <Link
              key={script.id}
              href={`/scripts/${script.slug}`}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">{script.title}</h2>
                {script.isObfuscated ? (
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
                    obfuscated
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-slate-300">{script.summary}</p>
              <p className="mt-4 text-xs text-slate-400">by {script.owner.username}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {script.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-8 text-sm text-slate-300">
            ยังไม่มีสคริปต์จาก API หรือ backend ยังไม่เริ่มทำงาน
          </div>
        )}
      </section>
    </Shell>
  );
}
