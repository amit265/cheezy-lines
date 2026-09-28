import { sampleTopics } from "./constants/topics.js";

const titles = sampleTopics.map(t => t.title);
console.log("Categories:", titles);

sampleTopics.forEach((t, i) => {
  console.log(`\n--- ${t.title} ---`);
  console.log(t.lines.slice(0, 3).map(l => l.text));
});
