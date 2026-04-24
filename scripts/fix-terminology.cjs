// One-off script to fix LoL terminology across profiles + generator.
const fs = require("fs");
const path = require("path");

function walk(dir) {
  const results = [];
  const list = fs.readdirSync(dir);
  for (const name of list) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...walk(full));
    } else if (/\.(ts|tsx|json)$/.test(name)) {
      results.push(full);
    }
  }
  return results;
}

const replacements = [
  // 자원: 에너지 → 기력
  [/에너지 0/g, "기력 0"],
  [/에너지 고갈/g, "기력 고갈"],
  [/에너지가 0/g, "기력이 0"],
  [/에너지\/마나/g, "기력/마나"],
  [/에너지 바/g, "기력 바"],
  [/에너지 관리/g, "기력 관리"],
  [/에너지 (\d+)/g, "기력 $1"],
  [/에너지(?=를|가|는|로|에|만)/g, "기력"],
  [/에너지 /g, "기력 "],

  // 룬: 오역/미존재 이름 교정
  [/신비로운 보석/g, "신비로운 유성"],
  [/기만자의 유산/g, "어둠의 수확"],
  [/수호의 역류/g, "수호자"],
  [/에테르 환상/g, "조율"],

  // 아이템: 구 이름/오타 교정
  [/루덴의 메아리/g, "루덴의 동반자"],
  [/에센스 레이버/g, "영겁의 창"],
  [/헤르메스의 발걸음/g, "기동의 장화"],
  [/크라켄 슬레이어/g, "크라켄 학살자"],
  [/최후의 속삭임(?! 숨결| 구경거리| 일격)/g, "필사의 속삭임"],
  [/리안드리의 고통/g, "리안드리의 고뇌"],
  [/트리니티 포스/g, "삼위일체"],
  [/트리니티(?! [가-힣])/g, "삼위일체"],
];

const files = walk("src");
let totalChanges = 0;
const changedFiles = [];

for (const file of files) {
  let content = fs.readFileSync(file, "utf-8");
  const original = content;
  let fileChanges = 0;

  for (const [pattern, replacement] of replacements) {
    const matches = content.match(pattern);
    if (matches) fileChanges += matches.length;
    content = content.replace(pattern, replacement);
  }

  if (content !== original) {
    fs.writeFileSync(file, content, "utf-8");
    changedFiles.push({ file, changes: fileChanges });
    totalChanges += fileChanges;
  }
}

console.log("Total replacements:", totalChanges);
console.log("Files changed:", changedFiles.length);
for (const c of changedFiles) console.log("  " + c.file + ": " + c.changes);
