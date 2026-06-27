"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getApiUrl } from "@/lib/api";

const uploadSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(10),
  version: z.string().min(1),
  tags: z.string().min(1),
  visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]),
  isObfuscated: z.boolean(),
  content: z.string().min(1),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export function UploadForm() {
  const [message, setMessage] = useState<string>("");
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      summary: "",
      version: "1.0.0",
      tags: "lua, hosted",
      visibility: "PUBLIC",
      isObfuscated: true,
      content: "-- Paste your Lua script here",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setMessage("");
    const token = window.localStorage.getItem("lua_script_token");

    const response = await fetch(getApiUrl("/api/v1/scripts"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        ...values,
        tags: values.tags.split(",").map((value) => value.trim()).filter(Boolean),
      }),
    });

    const payload = (await response.json()) as { error?: string; slug?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "Upload failed");
      return;
    }

    setMessage(`อัปโหลดสำเร็จ: ${payload.slug ?? "created"}`);
    form.reset();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div>
        <h2 className="text-xl font-semibold">อัปโหลดสคริปต์</h2>
        <p className="mt-2 text-sm text-slate-300">รองรับการส่งสคริปต์ Lua ที่คุณเตรียมไว้แล้ว และระบบจะสร้าง raw endpoint ให้อัตโนมัติ</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input {...form.register("title")} placeholder="Title" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none" />
        <input {...form.register("version")} placeholder="Version" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none" />
      </div>

      <input {...form.register("summary")} placeholder="Summary" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none" />
      <input {...form.register("tags")} placeholder="lua, utility" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none" />

      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <select {...form.register("visibility")} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none">
          <option value="PUBLIC">PUBLIC</option>
          <option value="UNLISTED">UNLISTED</option>
          <option value="PRIVATE">PRIVATE</option>
        </select>

        <label className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-200">
          <input type="checkbox" {...form.register("isObfuscated")} />
          Already obfuscated
        </label>
      </div>

      <textarea {...form.register("content")} rows={14} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 font-mono text-sm outline-none" />

      {message ? <p className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">{message}</p> : null}

      <button type="submit" disabled={form.formState.isSubmitting} className="rounded-2xl bg-accent px-5 py-3 font-medium shadow-glow disabled:opacity-60">
        {form.formState.isSubmitting ? "Uploading..." : "Create Script"}
      </button>
    </form>
  );
}
