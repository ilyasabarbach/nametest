import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defaultManifest, defaultTests, enCopy } from "../../packages/content-packs/src/index";

async function main(): Promise<void> {
  const outputDir = resolve(process.cwd(), "services/content/published");

  await mkdir(outputDir, { recursive: true });
  await writeFile(resolve(outputDir, "manifest.json"), JSON.stringify(defaultManifest, null, 2));
  await writeFile(resolve(outputDir, "tests.json"), JSON.stringify(defaultTests, null, 2));
  await writeFile(resolve(outputDir, "copy.en.json"), JSON.stringify(enCopy, null, 2));

  console.log(`Content bundle written to ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
