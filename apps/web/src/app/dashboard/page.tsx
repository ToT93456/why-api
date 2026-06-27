import Link from "next/link";

import { Shell } from "@/components/shell";
import { UploadForm } from "@/components/upload-form";
import { fetchJson } from "@/lib/api";

type ScriptListItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  downloadCount: number;
  favoriteCount: number;
};

async function getScripts() {
  try {
    return await fetchJson<ScriptListItem[]>("/api/v1/scripts");
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const scripts = await getScripts();

  return (
    <Shell>
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="mt-2 text-sm text-slate-300">
              หน้าเดียวสำหรับดูสคริปต์ที่มีอยู่และเพิ่มสคริปต์ใหม่ผ่าน API โดยตรง
            </p>
          </div>

          <div className="grid gap-4">
            {scripts.length > 0 ? (
              scripts.map((script) => (
                <Link
                  key={script.id}
                  href={`/scripts/${script.slug}`}
                  className="rounded-[2rem] border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold">{script.title}</h2>
                    <span className="text-xs text-slate-400">/{script.slug}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{script.summary}</p>
                  <div className="mt-4 flex gap-4 text-xs text-slate-400">
                    <span>downloads: {script.downloadCount}</span>
                    <span>favorites: {script.favoriteCount}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-300">
                ยังไม่มีข้อมูลจาก API หรือยังไม่ได้ seed ฐานข้อมูล
              </div>
            )}
          </div>
        </div>

        <UploadForm />
      </section>
    </Shell>
  );
}
