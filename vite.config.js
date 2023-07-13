import path, { resolve } from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  root: path.join(__dirname, "./src"),
  build: {
    emptyOutDir: true,
    outDir: path.join(__dirname, "dist"),
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        card_js: resolve(__dirname, "src/card_js/index.html"),
        chesspath: resolve(__dirname, "src/chesspath/index.html"),
      },
    },
  },
});
