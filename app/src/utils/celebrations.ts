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
    colors: ["#f472b6", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"],
    scalar: 1.1,
    ticks: 160,
  });

  confetti({
    ...base,
    particleCount: 90,
    angle: 120,
    spread: 55,
    startVelocity: 55,
    origin: { x: 1, y: 0.6 },
    colors: ["#f472b6", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"],
    scalar: 1.1,
    ticks: 160,
  });

  setTimeout(() => {
    confetti({
      ...base,
      particleCount: 220,
      spread: 100,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.4 },
      scalar: 1.2,
      ticks: 170,
    });
  }, 240);

  setTimeout(() => {
    confetti({
      ...base,
      particleCount: 60,
      spread: 80,
      startVelocity: 20,
      origin: { x: 0.5, y: 0.2 },
      scalar: 1.2,
      ticks: 220,
      shapes: ["star"],
      colors: ["#fcd34d", "#fde68a", "#f59e0b"],
    });

    confetti({
      ...base,
      particleCount: 40,
      spread: 80,
      startVelocity: 15,
      origin: { x: 0.5, y: 0.2 },
      ticks: 220,
      shapes: ["emoji"],
      emojis: ["🏆", "🎉", "✨", "⭐️"],
      emojiSize: 24,
    });
  }, 480);
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
    colors: ["#f472b6", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"],
    scalar: 1.1,
    ticks: 160,
  });

  confetti({
    ...base,
    particleCount: 90,
    angle: 120,
    spread: 55,
    startVelocity: 55,
    origin: { x: 1, y: 0.6 },
    colors: ["#f472b6", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"],
    scalar: 1.1,
    ticks: 160,
  });

  setTimeout(() => {
    confetti({
      ...base,
      particleCount: 220,
      spread: 100,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.4 },
      scalar: 1.2,
      ticks: 170,
    });
  }, 240);

  setTimeout(() => {
    confetti({
      ...base,
      particleCount: 60,
      spread: 80,
      startVelocity: 20,
      origin: { x: 0.5, y: 0.2 },
      scalar: 1.2,
      ticks: 220,
      shapes: ["star"],
      colors: ["#fcd34d", "#fde68a", "#f59e0b"],
    });

    confetti({
      ...base,
      particleCount: 40,
      spread: 80,
      startVelocity: 15,
      origin: { x: 0.5, y: 0.2 },
      ticks: 220,
      shapes: ["emoji"],
      emojis: ["🏆", "🎉", "✨", "⭐️"],
      emojiSize: 24,
    });
  }, 480);
}