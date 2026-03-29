"use client";

import { useState } from "react";

export function SignUpContextFields() {
  const [context] = useState(() => ({
    locale:
      typeof navigator !== "undefined" && navigator.language
        ? navigator.language
        : "en-CA",
    timezone:
      Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Toronto",
  }));

  return (
    <>
      <input type="hidden" name="locale" value={context.locale} />
      <input type="hidden" name="timezone" value={context.timezone} />
    </>
  );
}
