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
      return window.desktop.auth.signIn({ email, password }) as Promise<
        AuthResponse<SessionData>
      >;
    },
  },
  getSession: async () => {
    return window.desktop.auth.getSession() as Promise<AuthResponse<SessionData>>;
  },
  signOut: async () => {
    return window.desktop.auth.signOut() as Promise<AuthResponse<null>>;
  },
};

export function getAuthClient() {
  return authClient;
}
