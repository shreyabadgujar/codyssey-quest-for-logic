import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Dev proxy so the browser talks to one origin; backend runs on :5000
    proxy: { "/api": "http://localhost:5000" },
  },
});
