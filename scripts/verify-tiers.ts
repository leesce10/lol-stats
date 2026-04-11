import { externalStats } from "../src/data/external-stats";

const lolpsExpected: Record<string, number> = {
  // TOP
  "LeeSin|top": 1, "Malphite|top": 1, "RekSai|top": 1, "Gangplank|top": 1, "Irelia|top": 1,
  "Sion|top": 2, "Garen|top": 2, "Kayle|top": 2, "Pantheon|top": 2,
  "Yasuo|top": 3, "Akali|top": 3, "Warwick|top": 3, "Quinn|top": 3,
  "Nasus|top": 4, "Ryze|top": 4, "Riven|top": 4,
  "Jax|top": 5,

  // JUNGLE
  "LeeSin|jungle": 1, "Naafiri|jungle": 1, "Graves|jungle": 1, "RekSai|jungle": 1,
  "Elise|jungle": 2, "Vi|jungle": 2, "Nidalee|jungle": 2, "Briar|jungle": 2,
  "Shaco|jungle": 3, "Sylas|jungle": 3, "Kindred|jungle": 3,
  "Ekko|jungle": 4, "MasterYi|jungle": 4,

  // MID
  "Ahri|mid": 1, "Zoe|mid": 1, "TwistedFate|mid": 1, "Akali|mid": 1,
  "Viktor|mid": 2, "Vex|mid": 2, "Xerath|mid": 2, "Yasuo|mid": 2, "Katarina|mid": 2,
  "Sylas|mid": 3, "Fizz|mid": 3,
  "Ryze|mid": 4, "Azir|mid": 4,

  // ADC
  "Ashe|adc": 1, "Jinx|adc": 1, "MissFortune|adc": 1,
  "Caitlyn|adc": 2, "Ezreal|adc": 2, "Jhin|adc": 2, "Kaisa|adc": 2, "Lucian|adc": 2,
  "Draven|adc": 4,

  // SUPPORT
  "Karma|support": 1, "Braum|support": 1, "Thresh|support": 1,
  "Leona|support": 2, "Lulu|support": 2, "Bard|support": 2,
  "Nautilus|support": 3, "Pyke|support": 3,
  "Yuumi|support": 5,
};

let correct = 0;
let wrong = 0;
const mismatches: string[] = [];

for (const [key, expected] of Object.entries(lolpsExpected)) {
  const [name, pos] = key.split("|");
  const stat = externalStats.find((s) => s.name === name && s.position === pos);
  if (!stat) {
    mismatches.push(`${key}: NOT FOUND`);
    continue;
  }
  if (stat.tier === expected) {
    correct++;
  } else {
    wrong++;
    mismatches.push(`${key}: expected T${expected}, got T${stat.tier} (wr ${stat.winRate}, pr ${stat.pickRate}, br ${stat.banRate})`);
  }
}

console.log(`Accuracy: ${correct}/${correct + wrong} = ${((correct / (correct + wrong)) * 100).toFixed(1)}%`);
if (mismatches.length > 0) {
  console.log("\nMismatches:");
  mismatches.forEach((m) => console.log("  " + m));
}
