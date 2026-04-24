// One-off: replace "챔셀" jargon with natural Korean across site + docs.
const fs = require("fs");
const path = require("path");

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx|json|md)$/.test(name)) out.push(full);
  }
  return out;
}

// Order matters: longer phrases first so they don't get fragmented.
const replacements = [
  // 복합어 먼저
  [/챔셀 코치/g, "밴픽 코치"],
  [/챔셀 70초 의사결정/g, "밴픽 단계 의사결정"],
  [/챔셀 70초/g, "밴픽 단계"],
  [/챔셀 60초/g, "밴픽 중"],
  [/챔셀 의사결정/g, "밴픽 의사결정"],
  [/챔셀 시간/g, "밴픽 시간"],
  [/챔셀 시작/g, "밴픽 시작"],
  [/챔셀 종료/g, "밴픽 종료"],
  [/챔셀 중/g, "밴픽 중"],
  [/챔셀 분석/g, "밴픽 분석"],
  [/챔셀 화면/g, "밴픽 화면"],
  [/챔셀 들어가면/g, "밴픽 들어가면"],
  [/챔셀 가능/g, "밴픽 중 사용 가능"],
  [/솔랭 챔셀/g, "솔랭 밴픽"],
  // 단독
  [/챔셀/g, "밴픽"],
];

const roots = ["src", "docs"];
const files = roots.flatMap(r => (fs.existsSync(r) ? walk(r) : []));
let total = 0;
const touched = [];

for (const f of files) {
  let c = fs.readFileSync(f, "utf-8");
  const orig = c;
  let fileChanges = 0;
  for (const [p, r] of replacements) {
    const m = c.match(p);
    if (m) fileChanges += m.length;
    c = c.replace(p, r);
  }
  if (c !== orig) {
    fs.writeFileSync(f, c, "utf-8");
    touched.push({ f, fileChanges });
    total += fileChanges;
  }
}

console.log("total replacements:", total);
for (const t of touched) console.log("  ", t.f, ":", t.fileChanges);
