"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { AppButton } from "@/components/ui/app-button";

type SettlementBalance = {
  name: string;
  netAmount: string;
};

type SettlementTransfer = {
  fromName: string;
  toName: string;
  amount: string;
};

function formatCurrency(amount: string, currency: string, locale: string) {
  const value = Number(amount);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function buildSettlementSummary(input: {
  balances: SettlementBalance[];
  currency: string;
  locale: string;
  monthLabel: string;
  totalSharedExpense: string;
  transfers: SettlementTransfer[];
  workspaceName: string;
}) {
  const balanceLines = input.balances.map((balance) => {
    const amount = Number(balance.netAmount);
    const direction =
      amount > 0 ? "gets back" : amount < 0 ? "owes" : "is settled";

    return `- ${balance.name} ${direction} ${
      amount === 0
        ? ""
        : formatCurrency(balance.netAmount, input.currency, input.locale)
    }`.trim();
  });

  const transferLines =
    input.transfers.length > 0
      ? input.transfers.map(
          (transfer) =>
            `- ${transfer.fromName} -> ${transfer.toName} ${formatCurrency(
              transfer.amount,
              input.currency,
              input.locale,
            )}`,
        )
      : ["- Everyone is settled."];

  return [
    `${input.workspaceName} settlement`,
    input.monthLabel,
    "",
    `Shared expense: ${formatCurrency(
      input.totalSharedExpense,
      input.currency,
      input.locale,
    )}`,
    "",
    "Balances",
    ...balanceLines,
    "",
    "Suggested transfers",
    ...transferLines,
  ].join("\n");
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.readOnly = true;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("Unable to copy settlement summary.");
  }
}

export function SettlementShareActions(props: {
  balances: SettlementBalance[];
  currency: string;
  locale: string;
  monthLabel: string;
  totalSharedExpense: string;
  transfers: SettlementTransfer[];
  workspaceName: string;
}) {
  const [isSharing, setIsSharing] = useState(false);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  const summary = buildSettlementSummary(props);

  async function handleCopy() {
    try {
      await copyText(summary);
      toast.success("Settlement summary copied.");
    } catch {
      toast.error("Failed to copy settlement summary.");
    }
  }

  async function handleShare() {
    if (!canShare || !navigator.share) {
      await handleCopy();
      return;
    }

    setIsSharing(true);

    try {
      await navigator.share({
        title: `${props.workspaceName} settlement`,
        text: summary,
      });
      toast.success("Settlement shared.");
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
      <AppButton type="button" tone="secondary" size="sm" onClick={handleCopy}>
        Copy summary
      </AppButton>
      {canShare ? (
        <AppButton
          type="button"
          tone="success"
          size="sm"
          disabled={isSharing}
          onClick={handleShare}
        >
          {isSharing ? "Sharing..." : "Share"}
        </AppButton>
      ) : null}
    </div>
  );
}
