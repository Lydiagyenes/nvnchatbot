import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/**
 * Vite config for building the embeddable chat widget
 * This creates a standalone bundle that can be used in WordPress
 * 
 * Build command: npx vite build --config vite.embed.config.ts
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "public/wordpress-plugin/nvn-chatbot/assets",
    emptyOutDir: true,
    lib: {
      entry: "src/embed/embed.tsx",
      name: "NVNChat",
      fileName: () => "nvn-chat.js",
      formats: ["iife"],
    },
    rollupOptions: {
      // Bundle everything - no external dependencies
      external: [],
      output: {
        globals: {},
        // Ensure single file output
        inlineDynamicImports: true,
      },
    },
    minify: "esbuild",
    sourcemap: false,
  },
});
