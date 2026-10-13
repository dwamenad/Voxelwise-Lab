import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./theme-toggle";
import { subscribeTheme, THEME_BOOTSTRAP, THEME_STORAGE_KEY } from "@/lib/theme";

let prefersDark: boolean;
let systemListeners: Set<() => void>;

function bootstrap() {
  new Function("window", "document", "localStorage", THEME_BOOTSTRAP)(window, document, window.localStorage);
}

beforeEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
  prefersDark = false;
  systemListeners = new Set();
  vi.stubGlobal("matchMedia", () => ({
    matches: prefersDark,
    addEventListener: (_event: string, listener: () => void) => systemListeners.add(listener),
    removeEventListener: (_event: string, listener: () => void) => systemListeners.delete(listener),
  }));
  // Reset the preference through the public cross-tab synchronization API.
  const unsubscribe = subscribeTheme(() => {});
  window.dispatchEvent(new StorageEvent("storage", { key: THEME_STORAGE_KEY, newValue: null }));
  unsubscribe();
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("theme preference", () => {
  it("resolves the system preference before paint and persists a manual toggle", () => {
    prefersDark = true;
    bootstrap();
    expect(document.documentElement.dataset.theme).toBe("dark");
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    // Simulate a subsequent full navigation before React hydrates.
    delete document.documentElement.dataset.theme;
    bootstrap();
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("follows system changes until a learner makes an explicit choice", () => {
    bootstrap();
    render(<ThemeToggle />);
    act(() => { prefersDark = true; systemListeners.forEach((listener) => listener()); });
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
    act(() => { systemListeners.forEach((listener) => listener()); });
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("synchronizes a saved change from another tab", () => {
    bootstrap();
    render(<ThemeToggle />);
    act(() => window.dispatchEvent(new StorageEvent("storage", { key: THEME_STORAGE_KEY, newValue: "dark" })));
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
  });

  it("ignores invalid preferences and still toggles when storage is blocked", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "invalid-theme");
    bootstrap();
    expect(document.documentElement.dataset.theme).toBe("light");
    render(<ThemeToggle />);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
  });
});
