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
            const regex = /((\(Drupal\)|Drupal)\.t\((['"`].*?['"`](?:,.*?)*?)\))/g;
            let match;
            while ((match = regex.exec(code)) !== null) {
                translations.add(match[0]);
            }
            // Match Drupal.formatPlural('...', '...', '...', ...);
            const pluralRegex = /((\(Drupal\)|Drupal)\.formatPlural\((\d+),\s*(['"`].*?['"`]),\s*(['"`].*?['"`]),\s*(.*?)(?:,\s*(.*?))?\))/g;
            let pluralMatch;
            while ((pluralMatch = pluralRegex.exec(code)) !== null) {
                translations.add(pluralMatch[0]);
            }
            return null;
        },
        generateBundle() {
            const bundleContent = Array.from(translations)
                .sort()
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
