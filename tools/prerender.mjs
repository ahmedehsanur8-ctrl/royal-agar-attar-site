// Writes the timeline rows, grade cards and sizes strip into index.html as plain HTML,
// so search engines and link previews see them without running JavaScript.
// Run after editing STEPS, GRADES or CARDS in index.html:   node tools/prerender.mjs
import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";

const file = new URL("../index.html", import.meta.url);
let html = readFileSync(file, "utf8");

const grab = (start, end) => { const a = html.indexOf(start), b = html.indexOf(end, a); if (a < 0 || b < 0) throw new Error(`missing ${start}`); return html.slice(a, b + end.length); };
const block = (name) => { const a = html.indexOf(`const ${name} = [`); if (a < 0) throw new Error(`missing ${name}`); let d = 0;
  for (let i = html.indexOf("[", a); i < html.length; i++) { if (html[i] === "[") d++; else if (html[i] === "]" && --d === 0) return html.slice(a, i + 1) + ";"; } };

const code = [block("STEPS"), block("GRADES"), block("CARDS"), grab("/* @prerender-start", "/* @prerender-end */"),
  "out = { rows: STEPS.map(stepRowHTML).join('\\n'), grid: GRADES.map(gradeHTML).join('\\n'), cal: calHTML() };"].join("\n");
const ctx = { out: null }; vm.runInNewContext(code, ctx);

for (const [key, markup] of Object.entries(ctx.out)) {
  const re = new RegExp(`<!-- @prerender:${key} -->[\\s\\S]*?<!-- /@prerender:${key} -->`);
  if (!re.test(html)) throw new Error(`missing marker ${key}`);
  html = html.replace(re, `<!-- @prerender:${key} -->\n${markup}\n<!-- /@prerender:${key} -->`);
}
writeFileSync(file, html);
console.log("prerendered:", Object.fromEntries(Object.entries(ctx.out).map(([k, v]) => [k, v.length + " chars"])));
