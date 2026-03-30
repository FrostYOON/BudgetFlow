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
    text: "Workspace profile saved.",
  },
  settings_save_failed: {
    type: "error",
    text: "Failed to save settings.",
  },
  member_save_failed: {
    type: "error",
    text: "Failed to save workspace profile.",
  },
  password_changed: {
    type: "success",
    text: "Password changed.",
  },
  password_change_failed: {
    type: "error",
    text: "Failed to change password.",
  },
  password_confirm_mismatch: {
    type: "error",
    text: "New password confirmation does not match.",
  },
  session_revoked: {
    type: "success",
    text: "Session revoked.",
  },
  other_sessions_revoked: {
    type: "success",
    text: "Other sessions revoked.",
  },
  session_revoke_failed: {
    type: "error",
    text: "Failed to revoke session.",
  },
  invite_created: {
    type: "success",
    text: "Invite created.",
  },
  invite_resent: {
    type: "success",
    text: "Invite link refreshed.",
  },
  invite_revoked: {
    type: "success",
    text: "Invite revoked.",
  },
  invite_create_failed: {
    type: "error",
    text: "Failed to create invite.",
  },
  invite_resend_failed: {
    type: "error",
    text: "Failed to resend invite.",
  },
  invite_revoke_failed: {
    type: "error",
    text: "Failed to revoke invite.",
  },
  invite_accepted: {
    type: "success",
    text: "Shared space joined.",
  },
  invite_accept_failed: {
    type: "error",
    text: "Failed to accept invite.",
  },
  category_created: {
    type: "success",
    text: "Category created.",
  },
  category_updated: {
    type: "success",
    text: "Category updated.",
  },
  category_archived: {
    type: "success",
    text: "Category archived.",
  },
  category_restored: {
    type: "success",
    text: "Category restored.",
  },
  category_create_failed: {
    type: "error",
    text: "Failed to create category.",
  },
  category_update_failed: {
    type: "error",
    text: "Failed to update category.",
  },
  category_archive_failed: {
    type: "error",
    text: "Failed to archive category.",
  },
  category_restore_failed: {
    type: "error",
    text: "Failed to restore category.",
  },
  budget_saved: {
    type: "success",
    text: "Budget saved.",
  },
  allocations_saved: {
    type: "success",
    text: "Category plan saved.",
  },
  budget_save_failed: {
    type: "error",
    text: "Failed to save budget.",
  },
  allocations_save_failed: {
    type: "error",
    text: "Failed to save category plan.",
  },
  allocations_over_budget: {
    type: "error",
    text: "Category plan is over the monthly total.",
  },
  workspace_created: {
    type: "success",
    text: "Workspace created.",
  },
  workspace_create_failed: {
    type: "error",
    text: "Failed to create workspace.",
  },
  transaction_created: {
    type: "success",
    text: "Transaction added.",
  },
  transaction_updated: {
    type: "success",
    text: "Transaction updated.",
  },
  transaction_deleted: {
    type: "success",
    text: "Transaction deleted.",
  },
  transaction_restored: {
    type: "success",
    text: "Transaction restored.",
  },
  transaction_save_failed: {
    type: "error",
    text: "Failed to save transaction.",
  },
  transaction_update_failed: {
    type: "error",
    text: "Failed to update transaction.",
  },
  transaction_delete_failed: {
    type: "error",
    text: "Failed to delete transaction.",
  },
  transaction_restore_failed: {
    type: "error",
    text: "Failed to restore transaction.",
  },
  recurring_saved: {
    type: "success",
    text: "Recurring rule saved.",
  },
  recurring_updated: {
    type: "success",
    text: "Recurring rule updated.",
  },
  recurring_deactivated: {
    type: "success",
    text: "Recurring rule paused.",
  },
  recurring_save_failed: {
    type: "error",
    text: "Failed to save recurring rule.",
  },
  recurring_update_failed: {
    type: "error",
    text: "Failed to update recurring rule.",
  },
  recurring_deactivate_failed: {
    type: "error",
    text: "Failed to pause recurring rule.",
  },
  recurring_rerun_complete: {
    type: "success",
    text: "Recurring run completed.",
  },
  recurring_dry_run_complete: {
    type: "success",
    text: "Recurring dry run completed.",
  },
  recurring_rerun_failed: {
    type: "error",
    text: "Failed to run recurring execution.",
  },
  workspace_settings_saved: {
    type: "success",
    text: "Workspace settings saved.",
  },
  workspace_settings_failed: {
    type: "error",
    text: "Failed to save workspace settings.",
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
