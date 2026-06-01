import confetti from "canvas-confetti";

export function celebrateDoneToday() {
const base = {
    zIndex: 9999,
    disableForReducedMotion: true,
  };

  confetti({
    ...base,
    particleCount: 90,
    angle: 60,
    spread: 55,
    startVelocity: 55,
    origin: { x: 0, y: 0.6 },
  });

  confetti({
    ...base,
    particleCount: 90,
    angle: 120,
    spread: 55,
    startVelocity: 55,
    origin: { x: 1, y: 0.6 },
  });

  setTimeout(() => {
    confetti({
      ...base,
      particleCount: 220,
      spread: 100,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.4 },
    });
  }, 240);
}

export function celebrateGoalAchieved() {
  const base = {
    zIndex: 9999,
    disableForReducedMotion: true,
  };

  confetti({
    ...base,
    particleCount: 90,
    angle: 60,
    spread: 55,
    startVelocity: 55,
    origin: { x: 0, y: 0.6 },
  });

  confetti({
    ...base,
    particleCount: 90,
    angle: 120,
    spread: 55,
    startVelocity: 55,
    origin: { x: 1, y: 0.6 },
  });

  setTimeout(() => {
    confetti({
      ...base,
      particleCount: 220,
      spread: 100,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.4 },
    });
  }, 240);
}