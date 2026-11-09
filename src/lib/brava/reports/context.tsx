"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ExecutiveReportDraftInput, ExecutiveReportSnapshot } from "./types";
import { useBravaPollInterval } from "../use-poll-interval";

type LoadStatus = "loading" | "ready" | "error";

interface ReportsContextValue {
  reports: ExecutiveReportSnapshot[];
  status: LoadStatus;
  errorMessage: string | null;
  saveDraft: (input: ExecutiveReportDraftInput) => Promise<ExecutiveReportSnapshot>;
  closeReport: (snapshot: ExecutiveReportSnapshot) => Promise<ExecutiveReportSnapshot>;
}

const ReportsContext = createContext<ReportsContextValue | null>(null);

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.message || "Falha ao comunicar com o servidor.";
  } catch {
    return "Falha ao comunicar com o servidor.";
  }
}

export function ExecutiveReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<ExecutiveReportSnapshot[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);
  const pollInterval = useBravaPollInterval();

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch("/api/reports", { cache: "no-store" });
      if (!res.ok) {
        const message = await parseErrorMessage(res);
        if (!hasLoadedOnce.current) {
          setStatus("error");
          setErrorMessage(message);
        } else {
          console.error("Falha ao atualizar relatórios:", message);
        }
        return;
      }
      const body = await res.json();
      setReports(body.reports);
      hasLoadedOnce.current = true;
      setStatus("ready");
      setErrorMessage(null);
    } catch (err) {
      if (!hasLoadedOnce.current) {
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Falha ao comunicar com o servidor.");
      } else {
        console.error("Falha ao atualizar relatórios:", err);
      }
    }
  }, []);

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, pollInterval);
    return () => clearInterval(interval);
  }, [fetchReports, pollInterval]);

  const saveDraft = useCallback(
    async (input: ExecutiveReportDraftInput) => {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(await parseErrorMessage(res));
      const body = await res.json();
      setReports((prev) => [body.report, ...prev.filter((r) => r.id !== body.report.id)]);
      return body.report as ExecutiveReportSnapshot;
    },
    []
  );

  const closeReport = useCallback(async (snapshot: ExecutiveReportSnapshot) => {
    const res = await fetch(`/api/reports/${encodeURIComponent(snapshot.id)}/close`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    const body = await res.json();
    setReports((prev) => [body.report, ...prev.filter((r) => r.id !== body.report.id)]);
    return body.report as ExecutiveReportSnapshot;
  }, []);

  const value: ReportsContextValue = { reports, status, errorMessage, saveDraft, closeReport };

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useExecutiveReports(): ReportsContextValue {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error("useExecutiveReports must be used within ExecutiveReportsProvider");
  return ctx;
}
