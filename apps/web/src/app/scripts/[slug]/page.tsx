import Link from "next/link";
import { notFound } from "next/navigation";

import { Shell } from "@/components/shell";
import { fetchJson, getApiUrl } from "@/lib/api";

type ScriptDetails = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  visibility: "PUBLIC" | "UNLISTED" | "PRIVATE";
  isObfuscated: boolean;
  tags: string[];
  owner: { username: string };
  versions: Array<{
    id: string;
    version: string;
    changelog: string | null;
    createdAt: string;
    content: string;
  }>;
};

async function getScript(slug: string) {
  try {
    return await fetchJson<ScriptDetails>(`/api/v1/scripts/${slug}`);
  } catch {
    return null;
  }
}

export default async function ScriptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const script = await getScript(slug);

  if (!script) {
    notFound();
  }

  const latest = script.versions[0];

  return (
    <Shell>
      <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <aside className="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{script.visibility}</p>
            <h1 className="mt-3 text-3xl font-semibold">{script.title}</h1>
            <p className="mt-3 text-sm text-slate-300">{script.summary}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {script.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                {tag}
              </span>
            ))}
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
            raw endpoint: {getApiUrl(`/api/v1/scripts/${script.slug}/raw`)}
          </div>

          <a
            href={getApiUrl(`/api/v1/scripts/${script.slug}/raw`)}
            className="inline-flex rounded-full bg-accent px-5 py-3 font-medium text-white shadow-glow"
          >
            เปิด raw script
          </a>

          <p className="text-sm text-slate-400">owner: {script.owner.username}</p>
          <p className="text-sm text-slate-400">
            status: {script.isObfuscated ? "pre-obfuscated upload" : "plain script"}
          </p>
          <Link href="/dashboard" className="inline-flex text-sm text-cyan-200">
            กลับไป dashboard
          </Link>
        </aside>

        <div className="space-y-4">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Latest Version: {latest?.version ?? "-"}</h2>
              <span className="text-xs text-slate-400">{latest?.createdAt ?? ""}</span>
            </div>
            <pre className="mt-4 overflow-x-auto rounded-3xl border border-white/10 bg-black/40 p-5 text-sm text-slate-100">
              <code>{latest?.content ?? "No content"}</code>
            </pre>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="text-lg font-semibold">Version History</h3>
            <div className="mt-4 space-y-3">
              {script.versions.map((version) => (
                <div key={version.id} className="rounded-2xl border border-white/10 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium">{version.version}</span>
                    <span className="text-xs text-slate-400">{version.createdAt}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{version.changelog ?? "No changelog"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
