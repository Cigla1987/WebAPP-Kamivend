export interface AuthResponse<T> {
  data: T | null;
  error: { message?: string } | null;
}

export interface SessionData {
  user?: {
    name?: string;
    email?: string;
    [key: string]: unknown;
  };
  session?: unknown;
}

export const authClient = {
  signIn: {
    email: async ({ email, password }: { email: string; password: string }) => {
      const result = await window.desktop.auth.signInEmail({ email, password });
      return result as AuthResponse<SessionData>;
    },
  },
  getSession: async () => {
    const result = await window.desktop.auth.getSession();
    return result as AuthResponse<SessionData>;
  },
  signOut: async () => {
    const result = await window.desktop.auth.signOut();
    return result as AuthResponse<null>;
  },
};

export function getAuthClient() {
  return authClient;
}
