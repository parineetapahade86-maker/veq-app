// components/ThemeToggle.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "./ThemeProvider"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-2.5 rounded-xl bg-[#F4EDE1] dark:bg-[#171411] border border-[#E9DED0] dark:border-[#3A2418] text-[#3A2418] dark:text-[#C6A15B] hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm"
            aria-label="Toggle Dark Mode"
        >
            {theme === "light" ? (
                <Moon className="w-5 h-5" />
            ) : (
                <Sun className="w-5 h-5" />
            )}
        </button>
    )
}