import { describe, it, expect, beforeEach } from 'vitest';
import extractDrupalT from './index';
import type { Plugin } from 'rollup';

describe('extractDrupalT', () => {
  let plugin: Plugin;

  beforeEach(() => {
    plugin = extractDrupalT() as Plugin;
  });

  describe('Drupal.t() extraction', () => {
    it('should extract simple Drupal.t() calls', () => {
      const code = `const message = Drupal.t('Hello World');`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.t('Hello World')`);
    });

    it('should extract Drupal.t() with double quotes', () => {
      const code = `const message = Drupal.t("Hello World");`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.t("Hello World")`);
    });

    it('should extract Drupal.t() with backticks', () => {
      const code = 'const message = Drupal.t(`Hello World`);';
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain('// Drupal.t(`Hello World`)');
    });

    it('should extract (Drupal).t() calls', () => {
      const code = `const message = (Drupal).t('Hello World');`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.t('Hello World')`);
    });

    it('should extract Drupal.t() with context parameter', () => {
      const code = `const message = Drupal.t('Hello World', {}, {context: 'greeting'});`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.t('Hello World', {}, {context: 'greeting'})`);
    });

    it('should extract Drupal.t() with placeholder variables', () => {
      const code = `const message = Drupal.t('Hello @name', {'@name': userName});`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.t('Hello @name', {'@name': userName})`);
    });

    it('should extract multiple Drupal.t() calls', () => {
      const code = `
        const msg1 = Drupal.t('First message');
        const msg2 = Drupal.t('Second message');
        const msg3 = Drupal.t('Third message');
      `;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.t('First message')`);
      expect(output).toContain(`// Drupal.t('Second message')`);
      expect(output).toContain(`// Drupal.t('Third message')`);
    });

    it('should deduplicate identical Drupal.t() calls', () => {
      const code = `
        const msg1 = Drupal.t('Same message');
        const msg2 = Drupal.t('Same message');
      `;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      const matches = output.match(/Drupal\.t\('Same message'\)/g);
      expect(matches).toHaveLength(1);
    });

    it('should extract Drupal.t() with nested quotes', () => {
      const code = `const message = Drupal.t("It's a test");`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.t("It's a test")`);
    });

    it('should extract Drupal.t() with special characters in string', () => {
      const code = `const message = Drupal.t('Message with @placeholder and %markup');`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.t('Message with @placeholder and %markup')`);
    });

    it('should extract Drupal.t() with parentheses in string', () => {
      const code = `const message = Drupal.t('This is a message (with parentheses)');`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.t('This is a message (with parentheses)')`);
    });

    it('should extract Drupal.t() with nested parentheses in string', () => {
      const code = `const message = Drupal.t('Message (with (nested) parentheses)');`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.t('Message (with (nested) parentheses)')`);
    });

    it('should extract Drupal.t() with parentheses and parameters', () => {
      const code = `const message = Drupal.t('Total cost (@count items)', {'@count': count});`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.t('Total cost (@count items)', {'@count': count})`);
    });
  });

  describe('Drupal.t() multiline strings', () => {
    it('should extract multiline template literals', () => {
      const code = `const message = Drupal.t(\`This is a
multiline string\`);`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain('// Drupal.t(`This is a');
      expect(output).toContain('multiline string`)');
    });

    it('should extract single-line template literals', () => {
      const code = 'const message = Drupal.t(`Single line template literal`);';
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain('// Drupal.t(`Single line template literal`)');
    });

    it('should extract template literals with escaped content on single line', () => {
      const code = 'const message = Drupal.t(`Message with ${variable} interpolation`);';
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain('// Drupal.t(`Message with ${variable} interpolation`)');
    });

    it('should extract multiline strings with parameters', () => {
      const code = `const message = Drupal.t(\`Line 1
Line 2\`, {});`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain('// Drupal.t(`Line 1');
      expect(output).toContain('Line 2`, {})');
    });

    it('should extract multiline formatPlural strings', () => {
      const code = `const message = Drupal.formatPlural(5, \`One
item\`, \`Many
items\`, {});`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain('// Drupal.formatPlural(5,');
      expect(output).toContain('`One');
      expect(output).toContain('item`');
      expect(output).toContain('`Many');
      expect(output).toContain('items`, {})');
    });
  });

  describe('Drupal.formatPlural() extraction', () => {
    // NOTE: The current regex implementation requires at least a third parameter (replacements or options)
    // formatPlural calls without any additional parameters after the two strings won't be matched

    it('should extract formatPlural with empty replacements object', () => {
      const code = `const msg = Drupal.formatPlural(5, '1 item', '@count items', {});`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.formatPlural(5, '1 item', '@count items', {})`);
    });

    it('should extract formatPlural with double quotes and empty object', () => {
      const code = `const msg = Drupal.formatPlural(10, "1 item", "@count items", {});`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.formatPlural(10, "1 item", "@count items", {})`);
    });

    it('should extract formatPlural with replacements', () => {
      const code = `const msg = Drupal.formatPlural(3, '1 item', '@count items', {'@count': 3});`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.formatPlural(3, '1 item', '@count items', {'@count': 3})`);
    });

    it('should extract formatPlural with options', () => {
      const code = `const msg = Drupal.formatPlural(2, '1 item', '@count items', {}, {context: 'shopping'});`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.formatPlural(2, '1 item', '@count items', {}, {context: 'shopping'})`);
    });

    it('should extract (Drupal).formatPlural() calls', () => {
      const code = `const msg = (Drupal).formatPlural(7, '1 item', '@count items', {});`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.formatPlural(7, '1 item', '@count items', {})`);
    });

    it('should extract multiple formatPlural calls', () => {
      const code = `
        const msg1 = Drupal.formatPlural(1, '1 item', '@count items', {});
        const msg2 = Drupal.formatPlural(5, '1 user', '@count users', {});
      `;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.formatPlural(1, '1 item', '@count items', {})`);
      expect(output).toContain(`// Drupal.formatPlural(5, '1 user', '@count users', {})`);
    });

    it('should deduplicate identical formatPlural calls', () => {
      const code = `
        const msg1 = Drupal.formatPlural(8, '1 item', '@count items', {});
        const msg2 = Drupal.formatPlural(8, '1 item', '@count items', {});
      `;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      const matches = output.match(/Drupal\.formatPlural\(8, '1 item', '@count items', \{\}\)/g);
      expect(matches).toHaveLength(1);
    });

    it('should extract formatPlural with parentheses in strings', () => {
      const code = `const msg = Drupal.formatPlural(5, '1 item (single)', '@count items (multiple)', {});`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.formatPlural(5, '1 item (single)', '@count items (multiple)', {})`);
    });
  });

  describe('mixed extraction', () => {
    it('should extract both Drupal.t() and formatPlural() calls', () => {
      const code = `
        const msg1 = Drupal.t('Hello');
        const msg2 = Drupal.formatPlural(4, '1 item', '@count items', {});
        const msg3 = Drupal.t('Goodbye');
      `;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.t('Hello')`);
      expect(output).toContain(`// Drupal.formatPlural(4, '1 item', '@count items', {})`);
      expect(output).toContain(`// Drupal.t('Goodbye')`);
    });

    it('should sort all translations alphabetically', () => {
      const code = `
        const msg1 = Drupal.t('Zebra');
        const msg2 = Drupal.t('Apple');
        const msg3 = Drupal.formatPlural(9, '1', '@count', {});
      `;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      const lines = output.split('\n').filter(line => line.trim());
      expect(lines[0]).toContain('formatPlural');
      expect(lines[1]).toContain('Apple');
      expect(lines[2]).toContain('Zebra');
    });
  });

  describe('filter options', () => {
    it('should respect include option', () => {
      plugin = extractDrupalT({ include: '**/*.js' }) as Plugin;
      const code = `const msg = Drupal.t('Test');`;

      callTransform(plugin, code, 'test.js');
      const output = generateOutput(plugin);
      expect(output).toContain(`// Drupal.t('Test')`);

      plugin = extractDrupalT({ include: '**/*.js' }) as Plugin;
      callTransform(plugin, code, 'test.ts');
      const output2 = generateOutput(plugin);
      expect(output2).toBe('');
    });

    it('should respect exclude option', () => {
      plugin = extractDrupalT({ exclude: '**/*.test.js' }) as Plugin;
      const code = `const msg = Drupal.t('Test');`;

      callTransform(plugin, code, 'main.js');
      const output = generateOutput(plugin);
      expect(output).toContain(`// Drupal.t('Test')`);

      plugin = extractDrupalT({ exclude: '**/*.test.js' }) as Plugin;
      callTransform(plugin, code, 'file.test.js');
      const output2 = generateOutput(plugin);
      expect(output2).toBe('');
    });
  });

  describe('edge cases', () => {
    it('should not extract incomplete Drupal.t() calls', () => {
      const code = `const obj = { t: function() {} }; obj.t('not drupal');`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).not.toContain('not drupal');
    });

    it('should handle empty strings', () => {
      const code = `const msg = Drupal.t('');`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toContain(`// Drupal.t('')`);
    });

    it('should handle code with no translations', () => {
      const code = `const x = 5; console.log('test');`;
      const id = 'test.js';

      callTransform(plugin, code, id);
      const output = generateOutput(plugin);

      expect(output).toBe('');
    });
  });
});

// Helper functions
function createPluginContext(): any {
  const emittedFiles: any[] = [];
  return {
    emitFile(file: any) {
      emittedFiles.push(file);
    },
    _emittedFiles: emittedFiles,
  };
}

function callTransform(plugin: Plugin, code: string, id: string): void {
  const context = createPluginContext();
  const transform = plugin.transform;

  if (typeof transform === 'function') {
    transform.call(context, code, id);
  } else if (transform && typeof transform === 'object' && 'handler' in transform) {
    transform.handler.call(context, code, id);
  }
}

function generateOutput(plugin: Plugin): string {
  const context = createPluginContext();
  const generateBundle = plugin.generateBundle;

  if (typeof generateBundle === 'function') {
    generateBundle.call(context, {} as any, {} as any, false);
  } else if (generateBundle && typeof generateBundle === 'object' && 'handler' in generateBundle) {
    generateBundle.handler.call(context, {} as any, {} as any, false);
  }

  if (context._emittedFiles.length === 0) {
    return '';
  }

  return context._emittedFiles[0]?.source || '';
}
