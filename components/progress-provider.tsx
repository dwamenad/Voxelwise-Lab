"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { DEFAULT_PROGRESS, enrollInCourse, toggleLessonCompletion, type LocalProgressState } from "@/lib/progress/store";

const STORAGE_KEY = "fsl-academy-local-progress-v2";
const listeners = new Set<() => void>();
let memoryState: LocalProgressState = DEFAULT_PROGRESS;
let storageLoaded = false;

function loadStorage(): LocalProgressState {
  if (storageLoaded || typeof window === "undefined") return memoryState;
  storageLoaded = true;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) memoryState = JSON.parse(saved) as LocalProgressState;
  } catch {
    // Progress still works with the in-memory default when storage is blocked.
  }
  return memoryState;
}

function getSnapshot() {
  return loadStorage();
}

function getServerSnapshot() {
  return DEFAULT_PROGRESS;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  function onStorage(event: StorageEvent) {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      memoryState = JSON.parse(event.newValue) as LocalProgressState;
      listeners.forEach((item) => item());
    } catch {
      // Ignore malformed progress written by another tab.
    }
  }
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function updateProgress(update: (state: LocalProgressState) => LocalProgressState) {
  memoryState = update(loadStorage());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
  } catch {
    // State remains available until the tab closes.
  }
  listeners.forEach((listener) => listener());
}

interface ProgressContextValue {
  state: LocalProgressState;
  hydrated: boolean;
  enroll: (courseSlug: string) => void;
  markComplete: (lessonId: string, completed?: boolean) => void;
  recordView: (courseSlug: string, lessonSlug: string) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const enroll = useCallback((courseSlug: string) => updateProgress((current) => enrollInCourse(current, courseSlug)), []);
  const markComplete = useCallback((lessonId: string, completed = true) => updateProgress((current) => toggleLessonCompletion(current, lessonId, completed)), []);
  const recordView = useCallback((courseSlug: string, lessonSlug: string) => updateProgress((current) => ({ ...current, lastViewed: { courseSlug, lessonSlug, viewedAt: new Date().toISOString() } })), []);
  const resetProgress = useCallback(() => updateProgress(() => DEFAULT_PROGRESS), []);
  const value = useMemo(() => ({ state, hydrated: true, enroll, markComplete, recordView, resetProgress }), [state, enroll, markComplete, recordView, resetProgress]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used inside ProgressProvider");
  return context;
}
