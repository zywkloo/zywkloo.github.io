import { readdir, readFile, writeFile, mkdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

const DIST_DIR = 'dist';
const ROOT_DIR = '.';

// Files/folders to exclude from copying to root
const EXCLUDE = ['src', 'node_modules', 'scripts', 'astro.config.mjs', 'package.json', 'package-lock.json', '.git', '.gitignore', 'tsconfig.json', 'tailwind.config.cjs', '.astro'];

async function copyDir(src, dest) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    
    // Skip excluded files/folders
    if (EXCLUDE.includes(entry.name)) {
      console.log(`Skipping: ${entry.name}`);
      continue;
    }
    
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      const content = await readFile(srcPath);
      await writeFile(destPath, content);
      console.log(`Copied: ${entry.name}`);
    }
  }
}

async function main() {
  if (!existsSync(DIST_DIR)) {
    console.error('Error: dist directory not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  console.log('Copying dist files to root...');
  await copyDir(DIST_DIR, ROOT_DIR);
  console.log('✓ Copy complete!');
}

main().catch(console.error);

