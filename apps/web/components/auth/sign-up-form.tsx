"use client";

import { FormEvent } from "react";
import { toast } from "react-hot-toast";
import { SignUpContextFields } from "@/components/auth/sign-up-context-fields";
import { AppButton, AppButtonLink } from "@/components/ui/app-button";

export function SignUpForm({
  draftEmail,
  draftName,
  next,
}: {
  draftEmail: string;
  draftName: string;
  next: string;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!name && !email && !password && !confirmPassword) {
      event.preventDefault();
      toast.error("Fill in your name, email, password, and confirmation.");
      return;
    }

    if (!name) {
      event.preventDefault();
      toast.error("Enter your profile name.");
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

    if (name.length < 2) {
      event.preventDefault();
      toast.error("Enter a name with at least 2 characters.");
      return;
    }

    if (!password) {
      event.preventDefault();
      toast.error("Enter a password.");
      return;
    }

    if (!confirmPassword) {
      event.preventDefault();
      toast.error("Confirm your password.");
      return;
    }

    if (password.length < 8) {
      event.preventDefault();
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      event.preventDefault();
      toast.error("Password needs at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      event.preventDefault();
      toast.error("Password needs at least one lowercase letter.");
      return;
    }

    if (!/\d/.test(password)) {
      event.preventDefault();
      toast.error("Password needs at least one number.");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      event.preventDefault();
      toast.error("Password needs at least one special character.");
      return;
    }

    if (password !== confirmPassword) {
      event.preventDefault();
      toast.error("Password confirmation does not match.");
    }
  }

  return (
    <form
      action="/auth/sign-up"
      method="post"
      noValidate
      className="mt-10 space-y-4"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="redirectTo" value={next} />
      <SignUpContextFields />
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Name
        </span>
        <input
          name="name"
          type="text"
          required
          minLength={2}
          autoComplete="name"
          defaultValue={draftName}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f6f2]"
          placeholder="Minji"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={draftEmail}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f6f2]"
          placeholder="minji@example.com"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Password
        </span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}"
          autoComplete="new-password"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f6f2]"
          placeholder="StrongPassword123!"
        />
        <span className="mt-2 block text-xs leading-5 text-slate-500">
          8+ characters, with uppercase, lowercase, a number, and a special
          character.
        </span>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Confirm password
        </span>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f6f2]"
          placeholder="Repeat your password"
        />
      </label>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <AppButton type="submit" className="px-6 py-3">
          Create account
        </AppButton>
        <AppButtonLink
          href={`/sign-in?next=${encodeURIComponent(next)}`}
          className="px-6 py-3"
        >
          Back to sign in
        </AppButtonLink>
      </div>
    </form>
  );
}
