import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Boxes,
  Cable,
  Gauge,
  LayoutGrid,
  PackagePlus,
  RefreshCw,
  Settings,
  SlidersHorizontal,
  Stethoscope,
} from 'lucide-react';
import { Button } from '@vending/ui';
import { getAuthClient } from '../lib/auth-client';
import type { BoundMachine } from '../../preload';

interface SessionUser {
  name?: string;
  email?: string;
  role?: string;
}

const cards = [
  { title: 'Setup', description: 'Complete the guided Smart Fridge commissioning workflow.', icon: SlidersHorizontal, status: 'Not started' },
  { title: 'Shelf recognition', description: 'Find real CAN shelves connected through the Waveshare adapter.', icon: Cable, status: 'Hardware required' },
  { title: 'Shelf calibration', description: 'Calibrate every physical four-load-cell shelf.', icon: Gauge, status: 'Not checked' },
  { title: 'Shelf layout', description: 'Map recognised shelves to their real fridge positions.', icon: LayoutGrid, status: 'Not configured' },
  { title: 'Product creation', description: 'Create products through the existing Kamivend workflow.', icon: PackagePlus, status: 'Online required' },
  { title: 'Refill', description: 'Refill assigned shelves without changing product assignments.', icon: Boxes, status: 'Not ready' },
  { title: 'Settings', description: 'Manage this Smart Fridge installation and local preferences.', icon: Settings, status: 'Available' },
  { title: 'Diagnostics', description: 'View adapter, heartbeat, shelf and CAN communication status.', icon: Stethoscope, status: 'Hardware required' },
  { title: 'Synchronisation', description: 'Review Kamivend cloud data and pending local operations.', icon: RefreshCw, status: 'Not checked' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [machine, setMachine] = useState<BoundMachine | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAuthClient().getSession(),
      window.desktop.machine.getBound(),
    ]).then(([sessionResult, boundMachine]) => {
      const session = sessionResult.data as { user?: SessionUser } | null;
      setUser(session?.user ?? null);
      setMachine(boundMachine);
      setLoading(false);
    });
  }, []);

  const subtitle = useMemo(() => {
    if (!machine) return 'No Smart Fridge is bound to this installation.';
    return `${machine.machine_name} · ${machine.serial_number}`;
  }, [machine]);

  const handleSignOut = async () => {
    await getAuthClient().signOut();
    navigate({ to: '/' });
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading…</div>;
  }

  return (
    <main className="min-h-screen bg-[#F3F4F6] text-[#333333]">
      <header className="border-b border-[#E8EBED] bg-white px-10 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#E05D38]">Smart Fridge administration</p>
            <h1 className="mt-2 text-4xl font-black">Kamivend</h1>
            <p className="mt-2 text-[#6B7280]">{subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-bold">{user?.name || user?.email || 'Authenticated user'}</p>
              <p className="text-sm text-[#6B7280]">{user?.role ?? 'user'}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>Exit admin</Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-10 py-10">
        {!machine && (
          <div className="mb-8 rounded-3xl border border-[#E05D38]/30 bg-white p-6">
            <h2 className="text-xl font-extrabold">Smart Fridge machine selection required</h2>
            <p className="mt-2 text-[#6B7280]">
              This desktop application accepts only machines where the Kamivend machine type is <strong>smartfridge</strong>. Lockbox machines and their compartments are not supported here.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ title, description, icon: Icon, status }) => (
            <button
              key={title}
              type="button"
              className="group min-h-56 rounded-3xl border border-[#E8EBED] bg-white p-7 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!machine && title !== 'Settings' && title !== 'Synchronisation'}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E05D38]/10 text-[#E05D38]">
                  <Icon size={24} />
                </span>
                <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-bold text-[#6B7280]">{status}</span>
              </div>
              <h2 className="mt-7 text-2xl font-extrabold">{title}</h2>
              <p className="mt-3 leading-6 text-[#6B7280]">{description}</p>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
