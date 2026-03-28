"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

const TOAST_MESSAGES: Record<string, { type: "success" | "error"; text: string }> = {
  account_created: {
    type: "success",
    text: "Account created.",
  },
  signed_in: {
    type: "success",
    text: "Signed in.",
  },
  signed_out: {
    type: "success",
    text: "Signed out.",
  },
  invalid_credentials: {
    type: "error",
    text: "Email or password is incorrect.",
  },
  missing_fields: {
    type: "error",
    text: "Required fields are missing.",
  },
  session_expired: {
    type: "error",
    text: "Session expired. Sign in again.",
  },
  sign_up_failed: {
    type: "error",
    text: "Sign-up failed. Try another email.",
  },
  settings_saved: {
    type: "success",
    text: "Settings saved.",
  },
  member_saved: {
    type: "success",
    text: "Household profile saved.",
  },
  settings_save_failed: {
    type: "error",
    text: "Failed to save settings.",
  },
  member_save_failed: {
    type: "error",
    text: "Failed to save household profile.",
  },
  workspace_missing: {
    type: "error",
    text: "Workspace is missing.",
  },
} as const;

export function UrlToastBridge() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const toastKey = searchParams.get("toast");
    const errorKey = searchParams.get("error");
    const key = toastKey ?? errorKey;

    if (!key) {
      return;
    }

    const message = TOAST_MESSAGES[key];

    if (!message) {
      return;
    }

    if (message.type === "success") {
      toast.success(message.text);
    } else {
      toast.error(message.text);
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("toast");
    nextParams.delete("error");
    const nextQuery = nextParams.toString();

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  return null;
}
