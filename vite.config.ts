import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { marketApiPlugin } from "./server/marketApi";

export default defineConfig({
  plugins: [react(), marketApiPlugin()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    open: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
    open: true,
  },
});
