import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    if (n === 'node_modules' || n === '.next') continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.tsx')) out.push(p);
  }
  return out;
}

function fixLine(line) {
  if (!line.includes('bg-[#FFD23F]') && !line.includes('from-[#FFD23F]') && !line.includes('hover:bg-')) {
    return line;
  }
  // Skip non-interactive decorative gradients
  if (
    line.includes('bg-clip-text') ||
    line.includes('absolute inset-0') ||
    line.includes('group-hover:from-[#FFD23F]/10') ||
    line.includes('h-0.5') ||
    line.includes('h-1 ') ||
    line.includes('h-1.5')
  ) {
    return line;
  }

  let l = line;

  l = l.replace(/hover:bg-\[#FFD23F\] hover:text-black/g, 'hover:bg-black hover:text-white');
  l = l.replace(/group-hover:bg-\[#FFD23F\] group-hover:text-black/g, 'group-hover:bg-black group-hover:text-white');

  if (l.includes('bg-gradient-to-r from-[#FFD23F]')) {
    l = l.replace(/hover:bg-\[#E6BC2E\]/g, 'hover:from-black hover:to-black hover:text-white');
    l = l.replace(/hover:bg-\[#FFD23F\]/g, 'hover:from-black hover:to-black hover:text-white');
    if (!l.includes('hover:from-black') && (l.includes('<button') || l.includes('<Link') || l.includes('type="submit"'))) {
      l = l.replace(
        /(bg-gradient-to-r from-\[#FFD23F\] to-\[#FFE566\])([^"\n]*?)text-black/g,
        '$1 hover:from-black hover:to-black hover:text-white$2text-black'
      );
    }
  } else {
    l = l.replace(/hover:bg-\[#E6BC2E\]/g, 'hover:bg-black hover:text-white');
    l = l.replace(/hover:bg-\[#FFD23F\]/g, 'hover:bg-black hover:text-white');
  }

  return l;
}

let count = 0;
for (const f of walk('app')) {
  const lines = readFileSync(f, 'utf8').split('\n');
  const updated = lines.map(fixLine);
  const t = updated.join('\n');
  const o = lines.join('\n');
  if (t !== o) {
    writeFileSync(f, t);
    count++;
    console.log(f);
  }
}
console.log('Updated:', count);
