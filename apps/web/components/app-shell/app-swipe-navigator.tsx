"use client";

import type { TouchEvent } from "react";
import { useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  APP_MOBILE_NAVIGATION,
  getActiveMobileNavigationIndex,
} from "@/lib/navigation";

function isInteractiveElement(target: HTMLElement | null) {
  return Boolean(
    target?.closest(
      'a, button, input, textarea, select, label, summary, [role="button"], [contenteditable="true"], [data-no-swipe="true"]',
    ),
  );
}

function isInsideHorizontalScrollArea(target: HTMLElement | null, boundary: HTMLElement | null) {
  let current = target;

  while (current && current !== boundary) {
    const styles = window.getComputedStyle(current);
    const canScrollX =
      (styles.overflowX === "auto" || styles.overflowX === "scroll") &&
      current.scrollWidth > current.clientWidth + 12;

    if (canScrollX) {
      return true;
    }

    current = current.parentElement;
  }

  return false;
}

export function AppSwipeNavigator({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const touchStateRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
  });

  const activeIndex = getActiveMobileNavigationIndex(pathname);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (window.innerWidth >= 1280) {
      return;
    }

    const target = event.target instanceof HTMLElement ? event.target : null;

    if (
      isInteractiveElement(target) ||
      isInsideHorizontalScrollArea(target, rootRef.current)
    ) {
      touchStateRef.current.active = false;
      return;
    }

    const touch = event.touches[0];
    touchStateRef.current = {
      active: true,
      startX: touch.clientX,
      startY: touch.clientY,
    };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (!touchStateRef.current.active || window.innerWidth >= 1280) {
      return;
    }

    touchStateRef.current.active = false;

    if (activeIndex === -1) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStateRef.current.startX;
    const deltaY = touch.clientY - touchStateRef.current.startY;

    if (Math.abs(deltaX) < 72 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25 || Math.abs(deltaY) > 56) {
      return;
    }

    const nextIndex =
      deltaX < 0 ? activeIndex + 1 : activeIndex - 1;

    if (nextIndex < 0 || nextIndex >= APP_MOBILE_NAVIGATION.length) {
      return;
    }

    router.push(APP_MOBILE_NAVIGATION[nextIndex].href);
  };

  return (
    <div
      ref={rootRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="min-w-0 flex-1 touch-pan-y"
    >
      {children}
    </div>
  );
}
