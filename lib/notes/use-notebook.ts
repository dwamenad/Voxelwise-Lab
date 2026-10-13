"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { UserBookmark, UserNote } from "@/lib/types";
import { EMPTY_NOTEBOOK_SNAPSHOT, getNotebookSnapshot, subscribeNotebook } from "./store";

const getServerSnapshot = () => EMPTY_NOTEBOOK_SNAPSHOT;

export function useNotebook() {
  const snapshot = useSyncExternalStore(subscribeNotebook, getNotebookSnapshot, getServerSnapshot);
  return useMemo(() => JSON.parse(snapshot) as { notes: UserNote[]; bookmarks: UserBookmark[] }, [snapshot]);
}
