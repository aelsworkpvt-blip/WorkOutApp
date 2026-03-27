import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { cache } from "react";
import { getAuthSecretValue } from "@/lib/env";
import { requirePrisma } from "@/lib/prisma";

const SESSION_COOKIE = "forge-motion-session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function getAuthSecret() {
  return new TextEncoder().encode(getAuthSecretValue());
}

type SessionPayload = {
  userId: string;
  email: string;
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getAuthSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export const getSession = cache(async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify<SessionPayload>(token, getAuthSecret());
    return verified.payload;
  } catch {
    return null;
  }
});

export const getCurrentViewer = cache(async function getCurrentViewer() {
  const session = await getSession();

  if (!session?.userId) {
    return null;
  }

  const db = requirePrisma();
  return db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      onboardingComplete: true,
      hasSeenWelcomeCarousel: true,
      trainingMode: true,
      splitPreference: true,
    },
  });
});

export async function requireCurrentViewer() {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    throw new Error("Unauthorized");
  }

  return viewer;
}
