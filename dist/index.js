import { createFilter } from '@rollup/pluginutils';
/**
 * Find the index of the closing ')' that balances the already-opened '(',
 * skipping over quoted strings and nested parentheses.
 */
function findBalancedClose(code, start) {
    let depth = 1;
    let i = start;
    while (i < code.length && depth > 0) {
        const ch = code[i];
        if (ch === '(') {
            depth++;
        }
        else if (ch === ')') {
            depth--;
            if (depth === 0)
                return i;
        }
        else if (ch === "'" || ch === '"' || ch === '`') {
            // Skip over quoted strings
            i++;
            while (i < code.length && code[i] !== ch) {
                if (code[i] === '\\')
                    i++; // skip escaped chars
                i++;
            }
        }
        i++;
    }
    return -1;
}
export default function extractDrupalT(options = {}) {
    const filter = createFilter(options.include, options.exclude);
    const translations = new Set();
    return {
        name: 'extract-drupal-t',
        config() {
            return {
                build: {
                    rollupOptions: {
                        external: ['Drupal'],
                        output: {
                            globals: {
                                Drupal: 'Drupal',
                            },
                        },
                    },
                },
            };
        },
        transform(code, id) {
            if (!filter(id))
                return null;
            // Match Drupal.t() and (Drupal).t() calls with balanced parentheses.
            const tCallRegex = /(\(Drupal\)|Drupal)\.t\(/g;
            let tMatch;
            while ((tMatch = tCallRegex.exec(code)) !== null) {
                const argsStart = tMatch.index + tMatch[0].length;
                const end = findBalancedClose(code, argsStart);
                if (end !== -1) {
                    translations.add(code.slice(tMatch.index, end + 1));
                }
            }
            // Match Drupal.formatPlural() and (Drupal).formatPlural() calls.
            const pluralRegex = /(\(Drupal\)|Drupal)\.formatPlural\(/g;
            let pluralMatch;
            while ((pluralMatch = pluralRegex.exec(code)) !== null) {
                const argsStart = pluralMatch.index + pluralMatch[0].length;
                const end = findBalancedClose(code, argsStart);
                if (end !== -1) {
                    translations.add(code.slice(pluralMatch.index, end + 1));
                }
            }
            return null;
        },
        generateBundle() {
            const lines = Array.from(translations)
                // Sort translations to ensure consistent order.
                .sort()
                // Replace '(Drupal)' with 'Drupal' for consistency.
                // Drupal can find the translations it needs to include.
                .map((translation) => translation.replace('(Drupal)', 'Drupal'))
                .join('\n');
            const bundleContent = lines ? `/*\n${lines}\n*/` : '';
            this.emitFile({
                type: 'asset',
                fileName: 'translations.js',
                source: bundleContent,
            });
        },
    };
}
