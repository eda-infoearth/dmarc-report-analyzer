import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    // build: {
    //   outDir: "dist", // 出力ディレクトリを指定
    //   assetsDir: "assets",
    // },
    // base: "/dmarc-checker/", // 👈 リポ名に合わせる！
  },
  ssr: false, // ← SPA構成
  server: {
    preset: "static", // ← 静的ビルドモード
    baseURL: "/dmarc-checker/", // 👈 GitHub Pages配下URL
  },
});
