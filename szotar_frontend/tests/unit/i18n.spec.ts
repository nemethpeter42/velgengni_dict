import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
const srcDir = resolve(__dirname, "../../src");

// read raw JSON: importing it would go through the i18n plugin's precompilation
const readLocale = (l: string) => JSON.parse(readFileSync(join(srcDir, `locales`, `${l}.json`), `utf8`));
const hu = readLocale(`hu`);
const en = readLocale(`en`);

const flattenKeys = (obj: object, prefix = ``): string[] =>
  Object.entries(obj).flatMap(([k, v]) =>
    typeof v === `object` && v !== null ? flattenKeys(v, `${prefix}${k}.`) : [`${prefix}${k}`]
  );

const listSourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap(f => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return listSourceFiles(p);
    return /\.(vue|ts)$/.test(p) ? [p] : [];
  });

describe("i18n messages", () => {
  const huKeys = flattenKeys(hu);
  const enKeys = flattenKeys(en);

  it("hu and en define the same keys", () => {
    expect([...enKeys].sort()).toEqual([...huKeys].sort());
  });

  it("every key used in src exists in the messages", () => {
    const keyUsage = /(?:\$t|\bt)\(\s*['`"]([\w.]+)['`"]/g;
    const missing: string[] = [];
    for (const file of listSourceFiles(srcDir)) {
      for (const [, key] of readFileSync(file, `utf8`).matchAll(keyUsage)) {
        if (!huKeys.includes(key)) missing.push(`${file}: ${key}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
