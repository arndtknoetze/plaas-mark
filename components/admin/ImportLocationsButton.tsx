"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components/admin/AdminUI";

type ImportResult = {
  created: number;
  updated: number;
  skipped?: number;
};

export function ImportLocationsButton() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onImport() {
    if (pending) return;
    setPending(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/locations/import", {
        method: "POST",
      });
      const data = (await res.json()) as
        | ImportResult
        | { error?: string; created?: number; skipped?: number };

      if (!res.ok) {
        throw new Error(
          data && "error" in data ? data.error : "Import failed.",
        );
      }

      setResult({
        created: Number((data as ImportResult).created ?? 0),
        updated: Number((data as ImportResult).updated ?? 0),
        skipped: Number((data as ImportResult).skipped ?? 0),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div>
        <PrimaryButton type="button" onClick={onImport} disabled={pending}>
          {pending ? "Importing towns..." : "Import towns"}
        </PrimaryButton>
      </div>
      {result ? (
        <div style={{ fontSize: "0.92rem", fontWeight: 700 }}>
          Imported {result.created} locations, updated {result.updated}
          {result.skipped ? `, skipped ${result.skipped}` : ""}.
        </div>
      ) : null}
      {error ? (
        <div style={{ fontSize: "0.92rem", color: "#b42318", fontWeight: 700 }}>
          {error}
        </div>
      ) : null}
    </div>
  );
}
