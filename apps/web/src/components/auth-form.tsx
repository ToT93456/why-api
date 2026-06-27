"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getApiUrl } from "@/lib/api";

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type AuthFormValues = {
  email: string;
  password: string;
  username: string;
};

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<string>("");
  const schema = mode === "register" ? registerSchema : loginSchema;
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerMessage("");

    const response = await fetch(getApiUrl(`/api/v1/auth/${mode}`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mode === "register" ? values : { email: values.email, password: values.password }),
    });

    const payload = (await response.json()) as {
      accessToken?: string;
      verificationToken?: string;
      error?: string;
    };

    if (!response.ok) {
      setServerMessage(payload.error ?? "Request failed");
      return;
    }

    if (payload.accessToken) {
      window.localStorage.setItem("lua_script_token", payload.accessToken);
    }

    if (payload.verificationToken) {
      setServerMessage(`สมัครสำเร็จ: verification token = ${payload.verificationToken}`);
      return;
    }

    router.push("/dashboard");
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div>
        <h1 className="text-3xl font-semibold">{mode === "login" ? "เข้าสู่ระบบ" : "สร้างบัญชี"}</h1>
        <p className="mt-2 text-sm text-slate-300">เชื่อมต่อกับ API โดยตรง และเก็บ access token ในเครื่องสำหรับใช้งาน dashboard</p>
      </div>

      {mode === "register" ? (
        <label className="block space-y-2">
          <span className="text-sm text-slate-200">Username</span>
          <input {...form.register("username")} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none" />
          <p className="text-xs text-rose-300">{form.formState.errors.username?.message}</p>
        </label>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm text-slate-200">Email</span>
        <input {...form.register("email")} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none" />
        <p className="text-xs text-rose-300">{form.formState.errors.email?.message}</p>
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-slate-200">Password</span>
        <input type="password" {...form.register("password")} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none" />
        <p className="text-xs text-rose-300">{form.formState.errors.password?.message}</p>
      </label>

      {serverMessage ? <p className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">{serverMessage}</p> : null}

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full rounded-2xl bg-accent px-4 py-3 font-medium text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
      >
        {form.formState.isSubmitting ? "กำลังส่ง..." : mode === "login" ? "Login" : "Register"}
      </button>
    </form>
  );
}
