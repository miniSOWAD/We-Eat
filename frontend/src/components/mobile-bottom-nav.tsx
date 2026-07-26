"use client";
import Link from "next/link";
import { Home, LayoutDashboard, PlusCircle, Search, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import type { UserMe } from "@/types";
import styles from "./mobile-bottom-nav.module.css";

export function MobileBottomNav({ user }: { user: UserMe | null }) {
  const pathname = usePathname();
  if (["/login", "/register", "/forgot-password"].includes(pathname)) return null;
  const links = [
    { href:"/", label:"Home", icon:Home },
    { href:"/listings", label:"Find", icon:Search },
    { href:"/share", label:"Share", icon:PlusCircle, primary:true },
    { href:user?"/dashboard":"/how-it-works", label:user?"Dashboard":"How", icon:LayoutDashboard },
    { href:user?"/dashboard/settings":"/login", label:user?"Settings":"Sign in", icon:Settings },
  ];
  const active=(href:string)=>href==="/"?pathname==="/":href==="/dashboard"?pathname==="/dashboard":pathname===href||pathname.startsWith(`${href}/`);
  return <nav className={styles.nav} aria-label="Mobile navigation" data-mobile-nav><div className={styles.glow}/>{links.map(({href,label,icon:Icon,primary})=>{const isActive=active(href);return <Link key={`${href}-${label}`} href={href} className={`${styles.item} ${primary?styles.primary:""} ${isActive?styles.active:""}`} aria-current={isActive?"page":undefined}><span className={styles.iconWrap}><Icon size={primary?22:20} strokeWidth={2.2}/></span><span>{label}</span></Link>})}</nav>;
}
