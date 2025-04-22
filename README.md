# Drupal translations extract plugin for Vite

Extract Drupal.t() and Drupal.formatPlural() calls into separate file.

Add to vite.config.ts file:
export default defineConfig({
import extractDrupalT from './plugins/rollup-plugin-extract-drupal-t'

build: {
    rollupOptions: {
      plugins: [
        extractDrupalT({
          include: ['**/*.js', "**/*.ts", '**/*.vue'],
        }),
      ],
    },
  }
})