import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  middleware: "src/middleware/index.ts",
  vite: {
    plugins: [tailwindcss()],
  },
  ssr: true, // ← SPA構成
  // server: {
  //   baseURL: "/dmarc-report-analyzer/",
  //   static: true,
  //   prerender: {
  //     failOnError: true,
  //     routes: ["/"],
  //     crawlLinks: true,
  //   },
  // },
});


// async function loadEnv() {
//   const mod = await import("./src/loadEnv");
//   return mod.env;
// }

// const loadedEnv = await loadEnv();

// const isDev = loadedEnv.IS_DEVELOPMENT;
// console.log("isDev:", isDev);

// export default defineConfig({
//   vite: {
//     plugins: [tailwindcss()],
//   },
//   ssr: isDev ? true : false, // ← SPA構成
//   server: isDev ? undefined : {
//     baseURL: "/dmarc-report-analyzer/",
//     static: true,
//     prerender: {
//       failOnError: true,
//       routes: ["/"],
//       crawlLinks: true,
//     },
//   },
// });
