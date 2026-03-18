import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@nametests/backend-contracts": path.resolve(__dirname, "../../packages/backend-contracts/src/index.ts"),
      "@nametests/content-packs": path.resolve(__dirname, "../../packages/content-packs/src/index.ts"),
      "@nametests/core": path.resolve(__dirname, "../../packages/core/src/index.ts"),
      "@nametests/platform-sdk": path.resolve(__dirname, "../../packages/platform-sdk/src/index.ts")
    }
  },
  server: {
    port: 5173
  }
});
