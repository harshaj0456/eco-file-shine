import confetti from "canvas-confetti";

export function fireConfetti(options?: confetti.Options) {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#06b6d4", "#3b82f6", "#f59e0b", "#8b5cf6"],
      ...options,
    });
  } catch {
    // Gracefully handle if canvas not supported
  }
}

export function fireCelebration() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
