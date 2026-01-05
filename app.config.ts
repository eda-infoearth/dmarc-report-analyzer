import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

const isDev = process.env.IS_DEVELOPMENT === "true";

export default defineConfig({
  middleware: "src/middleware/index.ts",
  vite: {
    plugins: [tailwindcss()],
  },
  ...(isDev && {
    ssr: true, // ← SPA構成
    server: {
    baseURL: "/dmarc-report-analyzer/",
    static: true,
    prerender: {
      failOnError: true,
      routes: ["/"],
      crawlLinks: true,
    },
  }}),
});
