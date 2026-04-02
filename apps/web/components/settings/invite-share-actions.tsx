"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { AppButton } from "@/components/ui/app-button";

function getInviteUrl(invitePath: string) {
  return new URL(invitePath, window.location.origin).toString();
}

async function copyInviteUrl(invitePath: string) {
  const inviteUrl = getInviteUrl(invitePath);

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(inviteUrl);
    return inviteUrl;
  }

  const textarea = document.createElement("textarea");
  textarea.value = inviteUrl;
  textarea.readOnly = true;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("Unable to copy invite link.");
  }

  return inviteUrl;
}

export function InviteShareActions({
  invitePath,
  workspaceName,
}: {
  invitePath: string;
  workspaceName: string;
}) {
  const [isSharing, setIsSharing] = useState(false);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  async function handleCopy() {
    try {
      await copyInviteUrl(invitePath);
      toast.success("Invite link copied.");
    } catch {
      toast.error("Failed to copy invite link.");
    }
  }

  async function handleShare() {
    if (!canShare || !navigator.share) {
      await handleCopy();
      return;
    }

    setIsSharing(true);

    try {
      const inviteUrl = getInviteUrl(invitePath);
      await navigator.share({
        title: `${workspaceName} invite`,
        text: `Join ${workspaceName} on BudgetFlow.`,
        url: inviteUrl,
      });
      toast.success("Invite shared.");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        await handleCopy();
      }
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <AppButton
        type="button"
        tone="secondary"
        size="sm"
        onClick={handleCopy}
      >
        Copy link
      </AppButton>
      {canShare ? (
        <AppButton
          type="button"
          tone="primary"
          size="sm"
          onClick={handleShare}
          disabled={isSharing}
        >
          {isSharing ? "Sharing..." : "Share"}
        </AppButton>
      ) : null}
    </div>
  );
}
