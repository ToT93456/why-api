import { Shell } from "@/components/shell";
import { fetchJson } from "@/lib/api";

type AdminDashboard = {
  users: number;
  scripts: number;
  versions: number;
  logs: Array<{
    id: string;
    action: string;
    createdAt: string;
  }>;
};

async function getAdminDashboard() {
  try {
    return await fetchJson<AdminDashboard>("/api/v1/admin/dashboard");
  } catch {
    return null;
  }
}

export default async function AdminPage() {
  const dashboard = await getAdminDashboard();

  return (
    <Shell>
      <section className="grid gap-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h1 className="text-3xl font-semibold">Admin Panel</h1>
          <p className="mt-2 text-sm text-slate-300">
            หน้านี้จะแสดงสถิติและ audit logs เมื่อเรียกด้วย token ของ admin หรือ moderator
          </p>
        </div>

        {dashboard ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">Users: {dashboard.users}</div>
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">Scripts: {dashboard.scripts}</div>
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">Versions: {dashboard.versions}</div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Recent Logs</h2>
              <div className="mt-4 space-y-3">
                {dashboard.logs.map((log) => (
                  <div key={log.id} className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-200">
                    <div>{log.action}</div>
                    <div className="mt-1 text-xs text-slate-400">{log.createdAt}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-300">
            ยังโหลดข้อมูล admin ไม่ได้ ต้องเรียก API ด้วยสิทธิ์ที่เหมาะสม
          </div>
        )}
      </section>
    </Shell>
  );
}
