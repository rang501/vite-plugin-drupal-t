# Drupal translations extract plugin for Vite

A Vite plugin that automatically extracts `Drupal.t()` and `Drupal.formatPlural()` translation calls from your JavaScript/TypeScript source code into a separate file. This enables Drupal's translation system to discover and process strings from your Vite-built frontend applications, making internationalization seamless across your entire stack.

The plugin scans your codebase during the build process, collects all translation calls, and outputs them as JavaScript comments in a `translations.js` file. Once included in your Drupal library, these strings become available for translation through Drupal's standard translation interface.

## Installation

```bash
npm install vite-plugin-drupal-t --save-dev
```

## Usage

Add to **vite.config.ts** file:
```ts
import { defineConfig } from 'vite'
import extractDrupalT from 'vite-plugin-drupal-t'

export default defineConfig({
  plugins: [
    extractDrupalT({
      include: ['**/*.js', '**/*.ts', '**/*.vue'],
    }),
  ],
})
```

Or if you need it only during build:

```ts
import { defineConfig } from 'vite'
import extractDrupalT from 'vite-plugin-drupal-t'

export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [
        extractDrupalT({
          include: ['**/*.js', '**/*.ts', '**/*.vue'],
        }),
      ],
    },
  },
})
```

## Output

The plugin creates a `translations.js` file in your build output directory (e.g., `dist/translations.js`). This file contains all translation strings found in the codebase as JavaScript comments:

```javascript
// Drupal.t('Welcome to the site')
// Drupal.t('Hello @name', {'@name': userName})
// Drupal.formatPlural(5, '1 item', '@count items', {})
```

The translations are commented out, so they won't execute at runtime, but Drupal's string extraction system can still find and process them.

## Drupal Setup

For Drupal to discover and extract these translation strings, you **must include the `translations.js` file in a Drupal library definition**.

### Step 1: Add to your library definition

In your theme or module's `*.libraries.yml` file (e.g., `mytheme.libraries.yml`):

```yaml
global:
  js:
    dist/translations.js: {}
    dist/main.js: {}
  css:
    theme:
      dist/style.css: {}
```

Or create a dedicated library just for translations:

```yaml
translations:
  js:
    dist/translations.js: {}

main:
  js:
    dist/main.js: {}
  dependencies:
    - mytheme/translations
```

### Step 2: Attach the library

Attach the library in your theme or module:

**In your theme's `.info.yml` file:**
```yaml
libraries:
  - mytheme/global
```

**Or programmatically in a hook:**
```php
/**
 * Implements hook_page_attachments().
 */
function mytheme_page_attachments(array &$attachments) {
  $attachments['#attached']['library'][] = 'mytheme/global';
}
```

### Step 3: Extract translations

Once the library is attached, Drupal's translation system will scan the `translations.js` file during:

- **Interface translation updates** (Configuration → Regional and language → User interface translation)
- **Locale module scanning** when enabled
- **Drush locale:check** and **locale:update** commands

The commented translation calls will be extracted and made available for translation in Drupal's translation interface.

## Features

- ✅ Extracts `Drupal.t()` calls
- ✅ Extracts `Drupal.formatPlural()` calls
- ✅ Supports single quotes, double quotes, and template literals
- ✅ Supports multiline strings
- ✅ Supports strings with parentheses
- ✅ Supports parameters and context options
- ✅ Automatically deduplicates identical translations
- ✅ Sorts output alphabetically

## Options

### `include`
Type: `string | string[]`
Default: `undefined`

A pattern or array of patterns to include files for extraction.

### `exclude`
Type: `string | string[]`
Default: `undefined`

A pattern or array of patterns to exclude files from extraction.