import { api, setAccessToken } from "../api/client";
import type { User } from "../types";

type Session = { accessToken: string; user: User };

export async function login(email: string, password: string) {
  const session = await api<Session>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  setAccessToken(session.accessToken);
  return session;
}

export async function sendOtp(email: string) {
  return api<{ message: string }>("/api/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export async function verifyOtp(email: string, otp: string) {
  const session = await api<Session>("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp })
  });
  setAccessToken(session.accessToken);
  return session;
}

export async function profile() {
  return api<User>("/api/auth/profile");
}

export async function logout() {
  await api("/api/auth/logout", { method: "POST" }).catch(() => undefined);
  setAccessToken(null);
}
