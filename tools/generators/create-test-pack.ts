const id = process.argv[2];

if (!id) {
  throw new Error("Usage: pnpm tsx tools/generators/create-test-pack.ts <test-id>");
}

console.log(`Create a new JSON content pack scaffold for: ${id}`);
