import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});

const files = [
  "index.html",
  "sitemap.xml",
  "assets/search-index.ja.json",
  "assets/search-index.en.json",
  ...walk("pages").filter((file) => file.endsWith(".html")),
  ...walk("en").filter((file) => file.endsWith(".html")),
];

const digest = () => new Map(files.map((file) => [
  file,
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"),
]));

const before = digest();
execFileSync("npm", ["run", "verify:site"], { stdio: "inherit" });
const after = digest();
const changed = files.filter((file) => before.get(file) !== after.get(file));

if (changed.length) {
  console.error(`Generation is not idempotent:\n${changed.join("\n")}`);
  process.exit(1);
}

console.log(`Idempotency check OK: ${files.length} generated files unchanged.`);
