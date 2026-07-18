import { useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

const ADMIN_HOLD_MS = 2500;

export default function CustomerPage() {
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  const cancelHold = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    timerRef.current = null;
    animationRef.current = null;
    startedAtRef.current = null;
    setProgress(0);
  };

  const updateProgress = () => {
    if (startedAtRef.current === null) return;
    const elapsed = performance.now() - startedAtRef.current;
    setProgress(Math.min(1, elapsed / ADMIN_HOLD_MS));
    if (elapsed < ADMIN_HOLD_MS) {
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const startHold = () => {
    cancelHold();
    startedAtRef.current = performance.now();
    animationRef.current = requestAnimationFrame(updateProgress);
    timerRef.current = setTimeout(() => {
      cancelHold();
      navigate({ to: '/admin/login' });
    }, ADMIN_HOLD_MS);
  };

  return (
    <main className="relative flex min-h-screen flex-col bg-[#F9FAFB] text-[#333333]">
      <header className="flex items-center justify-between px-10 py-7">
        <button
          type="button"
          aria-label="Kamivend logo"
          className="relative flex select-none items-center gap-3 rounded-2xl px-3 py-2 text-left touch-none"
          onPointerDown={startHold}
          onPointerUp={cancelHold}
          onPointerCancel={cancelHold}
          onPointerLeave={cancelHold}
          onContextMenu={(event) => event.preventDefault()}
        >
          <span
            className="absolute inset-0 rounded-2xl"
            style={{
              background: `conic-gradient(#E05D38 ${progress * 360}deg, transparent 0deg)`,
              opacity: progress > 0 ? 1 : 0,
            }}
          />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E05D38] text-2xl font-black text-white">
            K
          </span>
          <span className="relative text-3xl font-black tracking-tight">Kamivend</span>
        </button>
        <div className="rounded-full bg-white px-5 py-2 text-sm font-semibold shadow-sm">
          Ready
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-10 pb-16">
        <div className="grid w-full max-w-6xl grid-cols-2 gap-8">
          <div className="rounded-[2rem] bg-white p-12 shadow-sm">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-[#E05D38]">
              Smart Fridge
            </p>
            <h1 className="max-w-xl text-6xl font-black leading-[1.02]">
              Tap your card to start shopping
            </h1>
            <p className="mt-6 max-w-lg text-xl leading-8 text-[#6B7280]">
              Authorise, open the door, take your goods and close the door. Your purchase finishes automatically.
            </p>
          </div>

          <div className="grid grid-rows-4 gap-4">
            {[
              ['1', 'Tap your card', 'Tap your card to start'],
              ['2', 'Authorised', 'You can now open the door'],
              ['3', 'Take your goods', 'Take any products you want'],
              ['4', 'Close the door', 'Your purchase finishes automatically'],
            ].map(([number, title, text]) => (
              <div key={number} className="flex items-center gap-6 rounded-3xl bg-white px-7 py-5 shadow-sm">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E05D38] text-xl font-black text-white">
                  {number}
                </span>
                <div>
                  <h2 className="text-xl font-extrabold">{title}</h2>
                  <p className="mt-1 text-[#6B7280]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
