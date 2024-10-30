import { defineConfig } from "vite";
import webExtension from "@samrum/vite-plugin-web-extension";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [
    webExtension({
      manifest: {
        manifest_version: 3,
        name: "LayerTune",
        version: "1.0",
        description:
          "Highlight and switch semantic and div elements on web pages",
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
        commands: {
          undo: {
            suggested_key: {
              default: "Ctrl+Shift+Z",
              mac: "Command+Shift+Z",
            },
            description: "Undo last action",
          },
          save: {
            suggested_key: {
              default: "Ctrl+Shift+S",
              mac: "Command+Shift+S",
            },
            description: "Save changes",
          },
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
            css: ["src/styles/style.css"],
          },
        ],
        permissions: ["scripting", "tabs", "identity", "storage", "commands"],
        host_permissions: [
          "<all_urls>",
          "https://specific-site.com/*",
          "https://accounts.google.com/",
          "https://www.googleapis.com/",
          "http://localhost:5000/",
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@public": path.resolve(__dirname, "./public"),
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
        style: path.resolve(__dirname, "src/styles/style.css"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "background") {
            return "background.js";
          }
          if (chunkInfo.name === "content") {
            return "content.js";
          }
          return "[name].js";
        },
        chunkFileNames: "[name].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const extType = info[info.length - 1];

          if (extType === "css") {
            return `styles/style.css`;
          }

          if (/\.(png|jpe?g|gif|svg)$/.test(assetInfo.name)) {
            return `icons/[name][extname]`;
          }

          return `[name][extname]`;
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
