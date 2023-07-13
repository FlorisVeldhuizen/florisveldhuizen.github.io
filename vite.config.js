import path, { resolve } from "path";
import { defineConfig } from "vite";

const fileRegex = /.*chesspath.*/

const noAttr = () => {
  return {
    name: "no-attribute",
    transformIndexHtml(html, id) {
      // console.log("testing:", fileRegex.test(id), id.fileName);
      console.log(html, id.path);
      if (fileRegex.test(id.path)) {
        console.log("replacing chesspath")
        return html.replace(`type="module"`, "");
      }
    }
  }
}

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
  plugins: [noAttr()],
});
