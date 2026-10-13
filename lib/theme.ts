export type Theme = "light" | "dark";
export const THEME_STORAGE_KEY = "voxelwise-theme";
const THEME_CHANGE_EVENT = "voxelwise-theme-change";
let memoryPreference: Theme | null | undefined;

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

function savedPreference(): Theme | null {
  if (memoryPreference !== undefined) return memoryPreference;
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return memoryPreference = isTheme(saved) ? saved : null;
  } catch {
    return memoryPreference = null;
  }
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function setTheme(theme: Theme) {
  memoryPreference = theme;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // A blocked preference store should not prevent changing the current theme.
  }
  applyTheme(theme);
}

export function getThemeSnapshot(): Theme {
  const theme = document.documentElement.dataset.theme;
  return isTheme(theme) ? theme : savedPreference() ?? systemTheme();
}

export const getServerThemeSnapshot = (): Theme => "dark";

export function subscribeTheme(listener: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (!savedPreference()) applyTheme(systemTheme());
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== THEME_STORAGE_KEY) return;
    memoryPreference = isTheme(event.newValue) ? event.newValue : null;
    applyTheme(memoryPreference ?? systemTheme());
  };
  window.addEventListener(THEME_CHANGE_EVENT, listener);
  window.addEventListener("storage", onStorage);
  media.addEventListener("change", onSystemChange);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, listener);
    window.removeEventListener("storage", onStorage);
    media.removeEventListener("change", onSystemChange);
  };
}

// Run before rendering the body so a saved choice never flashes the other theme.
// Only the two known theme names can become a DOM attribute.
export const THEME_BOOTSTRAP = `(()=>{let theme;try{theme=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch{}if(theme!=="light"&&theme!=="dark")theme=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=theme})();`;
