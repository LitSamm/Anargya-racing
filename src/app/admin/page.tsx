import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin-panel";
import { SiteFooter, SiteNavigation } from "@/components/site-navigation";

export const metadata: Metadata = { title: "Admin | Anargya", description: "Manage inquiries, accounts, vehicles, proposals and site content." };

export default function AdminPage() {
  return <><SiteNavigation /><main id="main-content" className="app-page"><AdminPanel /></main><SiteFooter /></>;
}
