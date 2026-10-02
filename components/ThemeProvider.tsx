// components/ThemeProvider.tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

const ThemeContext = createContext<{
    theme: Theme
    setTheme: (theme: Theme) => void
}>({
    theme: "light",
    setTheme: () => null,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem("veq-theme") as Theme
        if (savedTheme) {
            setTheme(savedTheme)
            document.documentElement.classList.toggle("dark", savedTheme === "dark")
        }
    }, [])

    const updateTheme = (newTheme: Theme) => {
        setTheme(newTheme)
        localStorage.setItem("veq-theme", newTheme)
        document.documentElement.classList.toggle("dark", newTheme === "dark")
    }

    if (!mounted) return <>{children}</>

    return (
        <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)