import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBadgeColor(badge: string | null | undefined) {
  if (!badge) return "";
  const b = badge.toUpperCase();
  switch (b) {
    case "HOT":
      return "bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]";
    case "NEW":
      return "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]";
    case "SALE":
      return "bg-yellow-400 text-black shadow-[0_0_10px_rgba(250,204,21,0.5)]";
    case "LIMITED":
      return "bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]";
    case "PRE-ORDER":
      return "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]";
    case "BEST SELLER":
      return "bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.5)] border border-orange-400/50";
    default:
      return "bg-primary text-black"; // default
  }
}
