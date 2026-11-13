import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { SiteFooter, SiteNavigation } from "@/components/site-navigation";

export const metadata: Metadata = { title: "Sign in | Anargya", description: "Sign in to the Anargya customer dashboard." };

export default function LoginPage() {
  return <><SiteNavigation /><main id="main-content" className="app-page app-center"><LoginForm /></main><SiteFooter /></>;
}
