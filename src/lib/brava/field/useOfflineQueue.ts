"use client";

import { useEffect, useState, useCallback } from "react";
import { PendingAction, listPendingActionsForTank, subscribeOfflineQueueChanged } from "./offlineQueue";

/** Live list of this tank's queued-but-not-yet-synced registros — re-reads on every queue change (enqueue, sent, or failed). */
export function useOfflineQueueForTank(tankId: string): PendingAction[] {
  const [items, setItems] = useState<PendingAction[]>([]);

  const refresh = useCallback(() => {
    listPendingActionsForTank(tankId)
      .then(setItems)
      .catch(() => {});
  }, [tankId]);

  useEffect(() => {
    refresh();
    return subscribeOfflineQueueChanged(refresh);
  }, [refresh]);

  return items;
}
