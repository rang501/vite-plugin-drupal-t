# Drupal translations extract plugin for Vite

Extract Drupal.t() and Drupal.formatPlural() calls into separate file.

Add to **vite.config.ts** file:
```TS
import extractDrupalT from './plugins/rollup-plugin-extract-drupal-t'

export default defineConfig({

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
```

It will create translations.js file, which has all translation string found in the codebase. These are commented out, so translation is not called, but Drupal is able to find it.

The translations.js file must be included through library system, otherwise Drupal will not pick it up for scanning string.