"use client";

import { useCallback, useEffect, useState } from "react";

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

/** Calls the site's own API. Throws ApiError with the server's message. */
export async function api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(path, {
    method: init?.method ?? (init?.body === undefined ? "GET" : "POST"),
    credentials: "same-origin",
    headers: init?.body === undefined ? undefined : { "Content-Type": "application/json" },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new ApiError(data.error ?? res.statusText, res.status);
  return data;
}

export type Me = { id: string; email: string; name: string; role: "ADMIN" | "CUSTOMER"; organizationId: string | null };

/** Loads the signed-in user. Sends the visitor to /login when there is none, or home when the role is wrong. */
export function useMe(role?: Me["role"]) {
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    api<{ user: Me | null }>("/api/auth/me").then(({ user }) => {
      if (!user) { window.location.replace("/login"); return; }
      if (role && user.role !== role) { window.location.replace(user.role === "ADMIN" ? "/admin" : "/dashboard"); return; }
      setMe(user);
    }).catch(() => window.location.replace("/login"));
  }, [role]);
  return me;
}

export async function signOut() {
  await api("/api/auth/logout", { method: "POST", body: {} }).catch(() => undefined);
  window.location.href = "/login";
}

/** Fetches a list on mount and exposes a reload. */
export function useList<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const reload = useCallback(() => { api<T>(path).then((d) => { setData(d); setError(""); }).catch((e: Error) => setError(e.message)); }, [path]);
  useEffect(() => { reload(); }, [reload]);
  return { data, error, reload };
}

export const yen = (value: number) => `¥${value.toLocaleString("en-US")}`;
export const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
