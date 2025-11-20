import { createFilter } from '@rollup/pluginutils';
export default function extractDrupalT(options = {}) {
    const filter = createFilter(options.include, options.exclude);
    const translations = new Set();
    return {
        name: 'extract-drupal-t',
        transform(code, id) {
            if (!filter(id))
                return null;
            // Match Drupal.t('...') and (Drupal).t('...') calls, including parameters.
            // Using [\s\S] instead of . to match multiline strings (including newlines)
            const regex = /((\(Drupal\)|Drupal)\.t\((['"`][\s\S]*?['"`](?:,[\s\S]*?)*?)\))/g;
            let match;
            while ((match = regex.exec(code)) !== null) {
                translations.add(match[0]);
            }
            // Match Drupal.formatPlural('...', '...', '...', ...);
            // Using [\s\S] instead of . to match multiline strings (including newlines)
            const pluralRegex = /((\(Drupal\)|Drupal)\.formatPlural\((\d+),\s*(['"`][\s\S]*?['"`]),\s*(['"`][\s\S]*?['"`]),\s*([\s\S]*?)(?:,\s*([\s\S]*?))?\))/g;
            let pluralMatch;
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
