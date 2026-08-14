import type { Metadata } from "next";
import { DashboardContent } from "@/components/dashboard-content";

export const metadata: Metadata = { title: "My progress", description: "Resume FSL Academy courses and review local lesson progress." };
export default function DashboardPage() { return <DashboardContent />; }
