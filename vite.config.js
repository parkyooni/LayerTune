import { defineConfig } from "vite";
import webExtension from "@samrum/vite-plugin-web-extension";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  define: {
    "process.env.VITE_API_BASE_URL": JSON.stringify(
      process.env.VITE_API_BASE_URL
    ),
  },
  plugins: [
    webExtension({
      manifest: {
        manifest_version: 3,
        name: "LayerTune",
        version: "1.3",
        description:
          "웹사이트 전체에서 사용자가 원하는 위치로 요소들을 이동할 수 있도록 돕는 Chrome Extension입니다.",
        icons: {
          16: "icons/icon16.png",
          48: "icons/icon48.png",
          128: "icons/icon128.png",
        },
        action: {
          default_popup: "src/popup/index.html",
        },
        background: {
          service_worker: "src/background/index.js",
          type: "module",
        },
        oauth2: {
          client_id: process.env.VITE_GOOGLE_CLIENT_ID,
          scopes: [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
          ],
        },
        content_security_policy: {
          extension_pages: "script-src 'self'; object-src 'self'",
        },
        content_scripts: [
          {
            matches: ["<all_urls>"],
            js: ["src/content/index.js"],
            css: ["src/styles/index.scss"],
          },
        ],
        permissions: ["scripting", "tabs", "identity", "storage"],
        host_permissions: [
          "<all_urls>",
          "https://specific-site.com/*",
          "https://accounts.google.com/",
          "https://www.googleapis.com/",
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "src/popup/index.html"),
        background: path.resolve(__dirname, "src/background/index.js"),
        content: path.resolve(__dirname, "src/content/index.js"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const mapping = {
            main: "popup/index.js",
            background: "background/index.js",
            content: "content/index.js",
          };
          return mapping[chunkInfo.name] || "[name]/index.js";
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith(".html")) {
            return "index.html";
          }
          if (
            assetInfo.name.endsWith(".css") ||
            assetInfo.name.endsWith(".scss")
          ) {
            return "styles/index.css";
          }
          if (/\.(png|jpe?g|gif|svg)$/.test(assetInfo.name)) {
            return "icons/[name][extname]";
          }
          return "[name][extname]";
        },
      },
    },
    sourcemap: process.env.NODE_ENV === "development",
  },
  publicDir: "public",
  css: {
    modules: false,
  },
});
