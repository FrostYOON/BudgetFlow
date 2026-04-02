"use client";

import { FormEvent } from "react";
import { toast } from "react-hot-toast";
import { AppButton } from "@/components/ui/app-button";

export function SignInForm({
  draftEmail,
  next,
}: {
  draftEmail: string;
  next: string;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email && !password) {
      event.preventDefault();
      toast.error("Enter your email and password.");
      return;
    }

    if (!email) {
      event.preventDefault();
      toast.error("Enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      event.preventDefault();
      toast.error("Use a valid email address.");
      return;
    }

    if (!password) {
      event.preventDefault();
      toast.error("Enter your password.");
      return;
    }
  }

  return (
    <form
      action="/auth/sign-in"
      method="post"
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="redirectTo" value={next} />

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-200">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={draftEmail}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          placeholder="minji@example.com"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-200">
          Password
        </span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          placeholder="StrongPassword123!"
        />
      </label>

      <AppButton
        type="submit"
        tone="success"
        className="mt-2 w-full px-5 py-3"
      >
        Sign in
      </AppButton>
    </form>
  );
}
