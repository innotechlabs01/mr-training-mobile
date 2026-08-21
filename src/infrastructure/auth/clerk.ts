let clerkInstance: any = null;

export function setClerkInstance(clerk: any) {
  clerkInstance = clerk;
}

export function getClerkInstance(): any {
  return clerkInstance;
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
