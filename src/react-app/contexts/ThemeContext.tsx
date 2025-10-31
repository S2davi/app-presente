import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { UserSettings } from "@/shared/types";

interface ThemeContextValue {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>({
    theme: "light",
    primary_color: "#8B5CF6",
    secondary_color: "#EC4899",
    font_family: "Inter",
    notifications_enabled: 1,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", settings.theme);
    document.documentElement.style.setProperty("--primary-color", settings.primary_color);
    document.documentElement.style.setProperty("--secondary-color", settings.secondary_color);
    
    // Load Google Font
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${settings.font_family.replace(" ", "+")}:wght@300;400;500;600;700&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);
    document.documentElement.style.setProperty("--font-family", settings.font_family);

    return () => {
      document.head.removeChild(link);
    };
  }, [settings]);

  async function fetchSettings() {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateSettings(updates: Partial<UserSettings>) {
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setSettings((prev) => ({ ...prev, ...updates }));
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  }

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
