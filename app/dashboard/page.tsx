import type { Metadata } from "next";
import { DashboardContent } from "@/components/dashboard-content";

export const metadata: Metadata = { title: "Dashboard", description: "Resume FSL Academy courses and review lesson progress." };
export default function DashboardPage() { return <DashboardContent />; }

