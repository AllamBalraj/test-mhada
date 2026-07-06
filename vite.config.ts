import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/mhada": {
        target: "https://appro.mhada.gov.in",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/mhada/, ""),
      },
    },
  },
});
