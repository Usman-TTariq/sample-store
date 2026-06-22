import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const replacements = [
  ['from-[#1D63FF] to-[#5B8FFF]', 'from-[#FFD23F] to-[#FFE566]'],
  ['from-[#1D63FF]/5', 'from-[#FFD23F]/10'],
  ['from-[#1D63FF]/0', 'from-[#FFD23F]/0'],
  ['to-[#1D63FF]/0', 'to-[#FFD23F]/0'],
  ['to-[#5B8FFF]/20', 'to-[#FFE566]/20'],
  ['shadow-[#1D63FF]/20', 'shadow-[#FFD23F]/20'],
  ['shadow-[#1D63FF]/10', 'shadow-[#FFD23F]/10'],
  ['border-[#1D63FF]/20', 'border-[#FFD23F]/40'],
  ['border-[#1D63FF]/30', 'border-[#FFD23F]/40'],
  ['hover:bg-[#0047E0]', 'hover:bg-[#E6BC2E]'],
  ['hover:text-[#1D63FF]', 'hover:text-[#E6BC2E]'],
  ['group-hover:text-[#1D63FF]', 'group-hover:text-[#E6BC2E]'],
  ['hover:border-[#1D63FF]', 'hover:border-[#E6BC2E]'],
  ['active:border-[#1D63FF]', 'active:border-[#E6BC2E]'],
  ['focus:ring-[#1D63FF]', 'focus:ring-[#FFD23F]'],
  ['ring-[#1D63FF]', 'ring-[#FFD23F]'],
  ['text-[#1D63FF]', 'text-[#B8860B]'],
  ['border-[#1D63FF]', 'border-[#FFD23F]'],
  ['bg-[#0047E0]', 'bg-[#E6BC2E]'],
  ['#5B8FFF', '#FFE566'],
  ['#0047E0', '#E6BC2E'],
  ['#1D63FF', '#FFD23F'],
];

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    if (n === 'node_modules' || n === '.next') continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.tsx') || p.endsWith('.ts') || p.endsWith('.svg')) out.push(p);
  }
  return out;
}

function fixYellowButtonText(t) {
  return t
    .replace(/bg-\[#FFD23F\]([^"\n]*?)text-white/g, 'bg-[#FFD23F]$1text-black')
    .replace(/text-white([^"\n]*?)bg-\[#FFD23F\]/g, 'text-black$1bg-[#FFD23F]')
    .replace(/hover:bg-\[#E6BC2E\]([^"\n]*?)text-white/g, 'hover:bg-[#E6BC2E]$1text-black')
    .replace(/group-hover:bg-\[#FFD23F\]([^"\n]*?)group-hover:text-white/g, 'group-hover:bg-[#FFD23F]$1group-hover:text-black')
    .replace(/hover:bg-\[#FFD23F\]([^"\n]*?)hover:text-white/g, 'hover:bg-[#E6BC2E]$1hover:text-black')
    .replace(/hover:text-white([^"\n]*?)hover:bg-\[#FFD23F\]/g, 'hover:text-black$1hover:bg-[#E6BC2E]')
    .replace(/font-bold text-white">/g, 'font-bold text-black">')
    .replace(/border-dashed border-white/g, 'border-dashed border-black/20')
    .replace(/border-white\/60/g, 'border-black/20')
    .replace(/border-white\/70/g, 'border-black/30')
    .replace(/border-white\/80/g, 'border-black/30')
    .replace(/to-transparent to-\[#FFE566\]\/20/g, 'to-transparent to-[#FFE566]/30');
}

let count = 0;
for (const f of [...walk('app'), ...walk('lib'), ...walk('public')]) {
  let t = readFileSync(f, 'utf8');
  const o = t;
  for (const [a, b] of replacements) t = t.split(a).join(b);
  t = fixYellowButtonText(t);
  if (t !== o) {
    writeFileSync(f, t);
    count++;
    console.log(f);
  }
}
console.log('Total:', count);
