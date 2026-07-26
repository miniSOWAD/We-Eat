"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, FileWarning, History, LayoutDashboard, ListChecks, Settings, ShieldCheck, Soup, UserCog, UsersRound } from "lucide-react";
import type { Role } from "@/types";
import styles from "./dashboard-shell.module.css";

const userLinks = [
  {href:"/dashboard",label:"Overview",icon:LayoutDashboard},
  {href:"/dashboard/listings",label:"My listed food",icon:Soup},
  {href:"/dashboard/deals",label:"Completed deals",icon:ListChecks},
  {href:"/dashboard/favorites",label:"Saved foods",icon:Bookmark},
  {href:"/dashboard/settings",label:"Settings",icon:Settings},
  {href:"/dashboard/reports/new",label:"Submit a report",icon:FileWarning},
];
const moderatorLinks = [
  {href:"/dashboard",label:"Overview",icon:LayoutDashboard},
  {href:"/dashboard/moderator/reports",label:"Reports",icon:ShieldCheck},
  {href:"/dashboard/moderator/users",label:"Users",icon:UsersRound},
  {href:"/dashboard/moderator/listings",label:"Listings",icon:Soup},
  {href:"/dashboard/moderator/audit-logs",label:"Audit logs",icon:History},
  {href:"/dashboard/settings",label:"Settings",icon:Settings},
];
const adminLinks = [
  {href:"/dashboard",label:"Overview",icon:LayoutDashboard},
  {href:"/dashboard/admin/users",label:"Users",icon:UsersRound},
  {href:"/dashboard/admin/moderators",label:"Moderators",icon:UserCog},
  {href:"/dashboard/admin/reports",label:"Reports",icon:ShieldCheck},
  {href:"/dashboard/admin/listings",label:"Listings",icon:Soup},
  {href:"/dashboard/admin/audit-logs",label:"Audit logs",icon:History},
  {href:"/dashboard/settings",label:"Settings",icon:Settings},
];

export function DashboardNav({ role }: { role: Role }) {
  const pathname=usePathname(); const links=role==="ADMIN"?adminLinks:role==="MODERATOR"?moderatorLinks:userLinks;
  return <nav className={styles.nav} aria-label="Dashboard navigation">{links.map(({href,label,icon:Icon})=>{const active=href==="/dashboard"?pathname==="/dashboard":pathname===href||pathname.startsWith(`${href}/`);return <Link href={href} key={href} className={active?styles.active:""} aria-current={active?"page":undefined}><Icon size={18}/><span>{label}</span></Link>})}</nav>;
}
