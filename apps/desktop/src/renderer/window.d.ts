import type { DesktopAPI } from '../preload';
import type { AuthClient } from '../main/lib/auth-client';

type Bridges = AuthClient['$Infer']['Bridges'];

declare global {
  interface Window extends Bridges {
    desktop: DesktopAPI;
  }
}

export {};
