/**
 * Patch compiled Prisma client files to be CJS-compatible.
 *
 * Problem: Prisma 7's generated client uses `import.meta.url` (ESM-only).
 * TypeScript with module=commonjs cannot transpile it, so it leaks into
 * the CJS output, causing: SyntaxError: Cannot use 'import.meta' outside a module
 *
 * Fix: In CJS, `__dirname` is already a Node.js global — the `import.meta.url`
 * line is unnecessary. Replace it with a harmless static string.
 */
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'dist', 'src', 'generated', 'prisma');

function walk(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  ${dir} not found — skipping Prisma build patch`);
    return;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const before = content.length;
      // Replace `import.meta.url` with a static file URL.
      // In CJS, `globalThis.__dirname` is already set by Node, so the
      // computed value is only relevant in ESM context anyway.
      content = content.replaceAll(
        'import.meta.url',
        "'file:///opt/render/project/src/dist/src/generated/prisma/client.js'",
      );
      if (content.length !== before) {
        fs.writeFileSync(fullPath, content);
        console.log(`  ✓ patched ${path.relative(outDir, entry.name)}`);
      }
    }
  }
}

walk(outDir);
console.log('✅ Prisma build patch complete');
