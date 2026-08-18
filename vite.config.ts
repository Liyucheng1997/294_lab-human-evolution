import { defineConfig } from "vite";
import { sites } from "@openai/sites-vite-plugin";

export default defineConfig({
  base: "./",
  plugins: [sites()],
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 1200,
  },
});
