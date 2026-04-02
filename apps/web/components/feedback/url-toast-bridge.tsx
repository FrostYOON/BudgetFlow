"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

const TOAST_MESSAGES: Record<string, { type: "success" | "error"; text: string }> = {
  account_created: {
    type: "success",
    text: "Account created.",
  },
  account_saved: {
    type: "success",
    text: "Account created.",
  },
  account_archived: {
    type: "success",
    text: "Account archived.",
  },
  signed_in: {
    type: "success",
    text: "Signed in.",
  },
  social_auth_failed: {
    type: "error",
    text: "Google sign-in failed.",
  },
  social_auth_invalid_state: {
    type: "error",
    text: "Google sign-in session expired. Start again.",
  },
  social_auth_missing_code: {
    type: "error",
    text: "Google did not return a sign-in code.",
  },
  social_auth_unavailable: {
    type: "error",
    text: "Google sign-in is not configured yet.",
  },
  social_auth_email_unverified: {
    type: "error",
    text: "Your Google account email must be verified first.",
  },
  social_auth_invalid_grant: {
    type: "error",
    text: "That Google sign-in attempt expired. Try again.",
  },
  social_auth_exchange_failed: {
    type: "error",
    text: "Google sign-in could not be completed.",
  },
  signed_out: {
    type: "success",
    text: "Signed out.",
  },
  sign_in_missing_email_and_password: {
    type: "error",
    text: "Enter your email and password.",
  },
  sign_in_missing_email: {
    type: "error",
    text: "Enter your email address.",
  },
  sign_in_missing_password: {
    type: "error",
    text: "Enter your password.",
  },
  invalid_credentials: {
    type: "error",
    text: "Email or password is incorrect.",
  },
  invalid_email: {
    type: "error",
    text: "Use a valid email address.",
  },
  invalid_name: {
    type: "error",
    text: "Enter a name with at least 2 characters.",
  },
  name_in_use: {
    type: "error",
    text: "That name is already in use.",
  },
  missing_fields: {
    type: "error",
    text: "Required fields are missing.",
  },
  sign_up_missing_all_fields: {
    type: "error",
    text: "Fill in your name, email, password, and confirmation.",
  },
  sign_up_missing_name: {
    type: "error",
    text: "Enter your profile name.",
  },
  sign_up_missing_email: {
    type: "error",
    text: "Enter your email address.",
  },
  sign_up_missing_password: {
    type: "error",
    text: "Enter a password.",
  },
  sign_up_missing_password_confirmation: {
    type: "error",
    text: "Confirm your password.",
  },
  email_in_use: {
    type: "error",
    text: "That email is already in use.",
  },
  session_expired: {
    type: "error",
    text: "Session expired. Sign in again.",
  },
  sign_up_failed: {
    type: "error",
    text: "Sign-up failed. Try another email.",
  },
  weak_password: {
    type: "error",
    text: "Use 8+ characters with uppercase, lowercase, a number, and a special character.",
  },
  password_too_short: {
    type: "error",
    text: "Password must be at least 8 characters long.",
  },
  password_missing_uppercase: {
    type: "error",
    text: "Password needs at least one uppercase letter.",
  },
  password_missing_lowercase: {
    type: "error",
    text: "Password needs at least one lowercase letter.",
  },
  password_missing_number: {
    type: "error",
    text: "Password needs at least one number.",
  },
  password_missing_special: {
    type: "error",
    text: "Password needs at least one special character.",
  },
  settings_saved: {
    type: "success",
    text: "Settings saved.",
  },
  member_saved: {
    type: "success",
    text: "Workspace profile saved.",
  },
  member_removed: {
    type: "success",
    text: "Member removed from shared space.",
  },
  settings_save_failed: {
    type: "error",
    text: "Failed to save settings.",
  },
  member_save_failed: {
    type: "error",
    text: "Failed to save workspace profile.",
  },
  member_remove_failed: {
    type: "error",
    text: "Failed to remove member.",
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
  budget_copied: {
    type: "success",
    text: "Previous month copied.",
  },
  budget_copy_failed: {
    type: "error",
    text: "Failed to copy previous month.",
  },
  budget_template_saved: {
    type: "success",
    text: "Budget template saved.",
  },
  budget_template_applied: {
    type: "success",
    text: "Budget template applied.",
  },
  budget_template_failed: {
    type: "error",
    text: "Failed to use budget template.",
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
  transactions_imported: {
    type: "success",
    text: "Transactions imported.",
  },
  csv_import_empty: {
    type: "error",
    text: "No importable CSV rows found.",
  },
  csv_import_failed: {
    type: "error",
    text: "Failed to import CSV.",
  },
  settlement_recorded: {
    type: "success",
    text: "Settlement recorded.",
  },
  settlement_record_failed: {
    type: "error",
    text: "Failed to record settlement.",
  },
  notification_read: {
    type: "success",
    text: "Notification marked read.",
  },
  notifications_read: {
    type: "success",
    text: "Notifications marked read.",
  },
  notification_read_failed: {
    type: "error",
    text: "Failed to update notifications.",
  },
  account_save_failed: {
    type: "error",
    text: "Failed to save account.",
  },
  account_archive_failed: {
    type: "error",
    text: "Failed to archive account.",
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
