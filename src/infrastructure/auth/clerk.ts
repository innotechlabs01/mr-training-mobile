import type { BrowserClerk } from '@clerk/clerk-react';

let clerkInstance: BrowserClerk | null = null;

export function setClerkInstance(clerk: BrowserClerk) {
  clerkInstance = clerk;
}

export async function getClerkToken(): Promise<string | null> {
  if (!clerkInstance?.session) return null;
  try {
    return await clerkInstance.session.getToken();
  } catch {
    return null;
  }
}

export async function getClerkUserId(): Promise<string | null> {
  return clerkInstance?.user?.id ?? null;
}
