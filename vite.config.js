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
        fractals: resolve(__dirname, "src/fractals/index.html"),
        funky_snake: resolve(__dirname, "src/funky_snake/index.html"),
        p5_frames: resolve(__dirname, "src/p5_frames/index.html"),
        portfolio: resolve(__dirname, "src/portfolio/index.html"),
        qr_scan: resolve(__dirname, "src/qr_scan/index.html"),
        rain_p5: resolve(__dirname, "src/rain_p5/index.html"),
        walking_p5: resolve(__dirname, "src/walking_p5/index.html"),
        wavy_trees: resolve(__dirname, "src/wavy_trees/index.html"),
      },
    },
  },
});
