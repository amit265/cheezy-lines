export const offlineAILines = [
  "Are you a Wi-Fi signal? Because I'm feeling a strong connection.",
  "If you were a vegetable, you'd be a cute-cumber.",
  "Are you French? Because Eiffel for you.",
  "Do you have a name, or can I call you mine?",
  "Are you a magician? Because whenever I look at you, everyone else disappears.",
  "Are you made of copper and tellurium? Because you're Cu-Te.",
  "Is your name Google? Because you have everything I've been searching for."
];

export const getRandomOfflineLine = () => {
  const randomIndex = Math.floor(Math.random() * offlineAILines.length);
  return offlineAILines[randomIndex];
};
