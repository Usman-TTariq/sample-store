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

let count = 0;
for (const f of walk('app')) {
  let t = readFileSync(f, 'utf8');
  const o = t;
  t = t
    .replace(/border-black\/20\/60/g, 'border-black/20')
    .replace(/border-black\/20\/70/g, 'border-black/30')
    .replace(/from-\[#FFD23F\] to-\[#FFE566\]([^"\n]*?)text-white/g, 'from-[#FFD23F] to-[#FFE566]$1text-black')
    .replace(/bg-gradient-to-r from-\[#FFD23F\] to-\[#FFE566\] text-white/g, 'bg-gradient-to-r from-[#FFD23F] to-[#FFE566] text-black')
    .replace(/bg-gradient-to-br from-\[#FFD23F\] to-\[#FFE566\] flex items-center justify-center text-white/g, 'bg-gradient-to-br from-[#FFD23F] to-[#FFE566] flex items-center justify-center text-black')
    .replace(/bg-\[#FFD23F\] flex items-center justify-center"><span class="text-2xl font-bold text-white/g, 'bg-[#FFD23F] flex items-center justify-center"><span class="text-2xl font-bold text-black')
    .replace(/bg-\[#FFD23F\] flex items-center justify-center"><span class="text-xs font-bold text-white/g, 'bg-[#FFD23F] flex items-center justify-center"><span class="text-xs font-bold text-black')
    .replace(/rounded-lg p-6 text-white/g, 'rounded-lg p-6 text-black')
    .replace(/text-white font-bold text-xs drop-shadow-md/g, 'text-black font-bold text-xs');
  if (t !== o) {
    writeFileSync(f, t);
    count++;
    console.log(f);
  }
}
console.log('Fixed:', count);
