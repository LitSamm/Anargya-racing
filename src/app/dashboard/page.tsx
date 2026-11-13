import type { Metadata } from "next";
import { CustomerDashboard } from "@/components/customer-dashboard";
import { SiteFooter, SiteNavigation } from "@/components/site-navigation";

export const metadata: Metadata = { title: "Dashboard | Anargya", description: "Your vehicles, telemetry sessions and proposals." };

export default function DashboardPage() {
  return <><SiteNavigation /><main id="main-content" className="app-page"><CustomerDashboard /></main><SiteFooter /></>;
}
