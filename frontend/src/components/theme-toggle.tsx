"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./site-header.module.css";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => { setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light"); }, []);
  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("we-eat-theme", next);
  }
  return <button type="button" className={styles.themeToggle} onClick={toggle} aria-label={theme === "dark" ? "Use light mode" : "Use night mode"} title={theme === "dark" ? "Light mode" : "Night mode"}>{theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}<span>{theme === "dark" ? "Light" : "Night"}</span></button>;
}
