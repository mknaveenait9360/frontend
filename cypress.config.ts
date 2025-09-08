import { defineConfig } from "cypress";

export default defineConfig({
  projectId: 'fbq14f',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
