import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
server: {
    port: 8081,
    host: '0.0.0.0', // <--- Force listening on ALL IPv4 interfaces
    strictPort: true,
    allowedHosts: [
      'client-a.crm.local',
      'client-b.crm.local',
      'crm.local',
      'juan.crm.local',
      'tesla.crm.local',
      'tesla2.crm.local',
      'localhost',
    ],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
