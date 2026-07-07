import type { DesktopAPI } from '../preload';
import type { authClient } from '../main/lib/auth-client';

type Bridges = typeof authClient.$Infer.Bridges;

declare global {
  interface Window extends Bridges {
    desktop: DesktopAPI;
  }
}

export {};
