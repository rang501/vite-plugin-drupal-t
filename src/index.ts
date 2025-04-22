import { createFilter } from '@rollup/pluginutils';
import type { Plugin } from 'rollup';

export interface ExtractDrupalTOptions {
  include?: string | string[];
  exclude?: string | string[];
}

export default function extractDrupalT(options: ExtractDrupalTOptions = {}): Plugin {
  const filter = createFilter(options.include, options.exclude);
  const translations = new Set() as Set<string>;

  return {
    name: 'extract-drupal-t',
    transform(code: string, id: string) {
      if (!filter(id)) return null;

      // Match Drupal.t('...') and (Drupal).t('...') calls, including parameters.
      const regex = /((\(Drupal\)|Drupal)\.t\((['"`].*?['"`](?:,.*?)*?)\))/g;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(code)) !== null) {
        translations.add(match[0]);
      }

      // Match Drupal.formatPlural('...', '...', '...', ...);
      const pluralRegex = /((\(Drupal\)|Drupal)\.formatPlural\((\d+),\s*(['"`].*?['"`]),\s*(['"`].*?['"`]),\s*(.*?)(?:,\s*(.*?))?\))/g;
      let pluralMatch: RegExpExecArray | null;

      while ((pluralMatch = pluralRegex.exec(code)) !== null) {
        translations.add(pluralMatch[0]);
      }

      return null;
    },
    generateBundle() {
      const bundleContent = Array.from(translations)
        // Sort translations to ensure consistent order.
        .sort()
        // Format each translation as a comment.
        // Replace '(Drupal)' with 'Drupal' for consistency.
        // Drupal can find the translations it needs to include.
        .map((translation) => `// ${translation.replace('(Drupal)', 'Drupal')}`)
        .join('\n');

      this.emitFile({
        type: 'asset',
        fileName: 'translations.js',
        source: bundleContent,
      });
    },
  };
}
