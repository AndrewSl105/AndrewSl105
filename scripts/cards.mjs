#!/usr/bin/env node
// Renders the profile README cards as animated SVGs.
// Usage: node scripts/cards.mjs <outdir> [--mock]
// Live mode reads GITHUB_TOKEN and queries the GitHub GraphQL API.

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const LOGIN = 'AndrewSl105';
const W = 840;

const THEMES = {
  light: {
    text: '#111', muted: '#6b6b6b', faint: '#a3a3a3', rule: '#e8e8e8', accent: '#2d64f6',
    heat: ['#eef1f6', '#cdd9fd', '#94aefb', '#5a84f8', '#2d64f6'],
  },
  dark: {
    text: '#e6edf3', muted: '#9198a1', faint: '#5d646d', rule: '#262c34', accent: '#6e93ff',
    heat: ['#161b22', '#1b2f66', '#24479f', '#3b6cf0', '#7fa1ff'],
  },
};
const SANS = "Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const SERIF = "'Source Serif 4', Charter, Georgia, serif";

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
const num = (n) => n.toLocaleString('en-US');
const r1 = (n) => Math.round(n * 10) / 10;

// Deterministic PRNG (mulberry32), so mock data and the swirl are stable between runs.
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- data ----------

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      totalCommitContributions
      restrictedContributionsCount
      totalPullRequestContributions
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
      nodes {
        stargazerCount
        languages(first: 20, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name } }
        }
      }
    }
  }
}`;

async function fetchLive() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not set (use --mock for local previews)');
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'cards.mjs' },
    body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const { data, errors } = await res.json();
  if (errors?.length) throw new Error(`GraphQL: ${errors.map((e) => e.message).join('; ')}`);

  const cc = data.user.contributionsCollection;
  const repos = data.user.repositories.nodes;
  const languages = {};
  for (const repo of repos) {
    for (const { size, node } of repo.languages.edges) languages[node.name] = (languages[node.name] ?? 0) + size;
  }
  return {
    total: cc.contributionCalendar.totalContributions,
    commits: cc.totalCommitContributions + cc.restrictedContributionsCount,
    prs: cc.totalPullRequestContributions,
    stars: repos.reduce((sum, r) => sum + r.stargazerCount, 0),
    days: cc.contributionCalendar.weeks.flatMap((w) => w.contributionDays).map((d) => ({ date: d.date, count: d.contributionCount })),
    languages,
  };
}

function mockData() {
  const rand = rng(105);
  const end = Date.UTC(2026, 10, 17);
  const start = end - (52 * 7 + new Date(end).getUTCDay()) * 864e5;
  const days = [];
  for (let t = start; t <= end; t += 864e5) {
    const busy = rand();
    days.push({ date: new Date(t).toISOString().slice(0, 10), count: busy < 0.45 ? 0 : Math.floor(rand() * rand() * 14) + 1 });
  }
  for (let i = days.length - 23; i < days.length; i++) days[i].count ||= 1 + Math.floor(rand() * 6);
  return {
    total: days.reduce((s, d) => s + d.count, 0),
    commits: 813,
    prs: 214,
    stars: 41,
    days,
    languages: { TypeScript: 620, Go: 210, Python: 80, Ruby: 50, Shell: 25, CSS: 15 },
  };
}

function streaks(days) {
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--;
  let current = 0;
  while (i >= 0 && days[i].count > 0) { current++; i--; }
  let longest = 0, run = 0;
  for (const d of days) { run = d.count > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
  return { current, longest };
}

// Levels 0–4 by quartiles of the non-zero days, like GitHub's own calendar.
function leveler(days) {
  const nz = days.map((d) => d.count).filter(Boolean).sort((a, b) => a - b);
  const q = [0.25, 0.5, 0.75].map((p) => nz[Math.floor(p * (nz.length - 1))] ?? 0);
  return (c) => (c === 0 ? 0 : c <= q[0] ? 1 : c <= q[1] ? 2 : c <= q[2] ? 3 : 4);
}

// ---------- shared SVG bits ----------

function svg(height, title, css, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${height}" viewBox="0 0 ${W} ${height}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>
.sans { font-family: ${SANS}; }
.serif { font-family: ${SERIF}; }
${css.trim()}
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}
</style>
${body}
</svg>
`;
}

// ---------- header ----------

function header(t) {
  const rand = rng(2864);
  const cx = 700, cy = 100;
  const arcs = [];
  for (let i = 0; i < 70; i++) {
    const r = 6 + Math.pow(rand(), 0.8) * 144;
    const a0 = rand() * Math.PI * 2;
    const sweep = 0.4 + rand() * 1.8;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a0 + sweep), y1 = cy + r * Math.sin(a0 + sweep);
    const dur = Math.round(40 + rand() * 50);
    const width = r1(0.6 + rand() * 0.8);
    const op = r1(0.35 + rand() * 0.6);
    arcs.push(`<path class="arc ${i % 2 ? 'ccw' : 'cw'}" style="animation-duration:${dur}s" stroke-width="${width}" stroke-opacity="${op}" d="M${r1(x0)} ${r1(y0)}A${r1(r)} ${r1(r)} 0 0 1 ${r1(x1)} ${r1(y1)}"/>`);
  }

  const css = `
.rise { animation: rise .8s cubic-bezier(.2,.7,.2,1) both; }
@keyframes rise { from { opacity: 0; transform: translateY(8px); } }
.arc { fill: none; stroke: ${t.accent}; stroke-linecap: round; transform-origin: ${cx}px ${cy}px; animation: spin 60s linear infinite; }
.ccw { animation-direction: reverse; }
@keyframes spin { to { transform: rotate(360deg); } }
.blink { animation: blink 2.4s ease-in-out infinite; }
@keyframes blink { 50% { opacity: .25; } }
`;
  const body = `<defs>
  <radialGradient id="fade" cx="${cx}" cy="${cy}" r="150" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#fff"/>
    <stop offset=".6" stop-color="#fff" stop-opacity=".8"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
  <mask id="swirl-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="210">
    <rect width="${W}" height="210" fill="url(#fade)"/>
  </mask>
</defs>
<g mask="url(#swirl-mask)">
${arcs.join('\n')}
</g>
<circle cx="${cx}" cy="${cy}" r="3" fill="${t.accent}"/>
<g class="sans rise" style="animation-delay:.05s">
  <text x="0" y="46" font-size="38" font-weight="800" fill="${t.text}"><tspan fill="${t.accent}">[</tspan>A<tspan fill="${t.accent}">]</tspan></text>
</g>
<text class="sans rise" style="animation-delay:.2s" x="0" y="114" font-size="34" font-weight="700" fill="${t.text}">Andrii Slipchenko</text>
<text class="serif rise" style="animation-delay:.35s" x="0" y="146" font-size="19" fill="${t.muted}">Product engineer · Kyiv, remote</text>
<g class="rise" style="animation-delay:.5s">
  <circle class="blink" cx="5" cy="186" r="5" fill="${t.accent}"/>
  <text class="sans" x="17" y="191" font-size="13" fill="${t.muted}">${esc('open to senior product, full-stack & AI roles')}</text>
</g>`;
  return svg(210, 'Andrii Slipchenko — Product engineer · Kyiv, remote', css, body);
}

// ---------- activity ----------

function activity(t, d) {
  const { current, longest } = streaks(d.days);
  const level = leveler(d.days);

  // Pad the calendar into Sunday-first weeks and keep the last 53.
  const first = new Date(`${d.days[0].date}T00:00:00Z`).getUTCDay();
  const cells = [...Array(first).fill(null), ...d.days];
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const cols = weeks.slice(-53);

  const pitch = W / 53, size = r1(pitch - 3), gridY = 168;
  const lastDate = d.days.at(-1).date;
  const heat = [];
  const months = [];
  let lastLabelCol = -10, prevMonth = null;
  cols.forEach((week, c) => {
    const x = r1(c * pitch + 1.5);
    const firstDay = week.find(Boolean);
    const month = firstDay ? Number(firstDay.date.slice(5, 7)) - 1 : prevMonth;
    if (c > 0 && month !== prevMonth && c - lastLabelCol >= 3 && c <= 50) {
      months.push(`<text x="${x}" y="${gridY - 10}">${MONTHS[month]}</text>`);
      lastLabelCol = c;
    }
    prevMonth = month;
    const rects = [];
    week.forEach((day, r) => {
      if (!day) return;
      const y = r1(gridY + r * pitch);
      const when = new Date(`${day.date}T00:00:00Z`);
      const label = `${day.count === 0 ? 'No' : num(day.count)} contribution${day.count === 1 ? '' : 's'} on ${MONTHS[when.getUTCMonth()]} ${when.getUTCDate()}, ${when.getUTCFullYear()}`;
      rects.push(`<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="2.5" fill="${t.heat[level(day.count)]}"><title>${label}</title></rect>`);
      if (day.date === lastDate) {
        rects.push(`<rect class="today" x="${r1(x - 1.5)}" y="${r1(y - 1.5)}" width="${r1(size + 3)}" height="${r1(size + 3)}" rx="3.5"/>`);
      }
    });
    heat.push(`<g class="col" style="animation-delay:${(0.3 + c * 0.018).toFixed(3)}s">${rects.join('')}</g>`);
  });
  const gridBottom = gridY + 7 * pitch - 3;

  // Language bar: top 4 plus Other.
  const langs = Object.entries(d.languages).sort((a, b) => b[1] - a[1]);
  const totalSize = langs.reduce((s, [, v]) => s + v, 0) || 1;
  const parts = langs.slice(0, 4).map(([name, v]) => ({ name, v }));
  const rest = langs.slice(4).reduce((s, [, v]) => s + v, 0);
  if (rest > 0) parts.push({ name: 'Other', v: rest });
  const shades = [t.heat[4], t.heat[3], t.heat[2], t.heat[1]];
  const barY = r1(gridBottom + 32), gap = 3;
  const usable = W - gap * (parts.length - 1);
  let bx = 0;
  const bar = [], legend = [];
  parts.forEach((p, i) => {
    const color = p.name === 'Other' ? t.rule : shades[i];
    const w = Math.max(usable * (p.v / totalSize), 2);
    bar.push(`<rect x="${r1(bx)}" y="${barY}" width="${r1(w)}" height="6" rx="3" fill="${color}"/>`);
    bx += w + gap;
    const pct = Math.round((p.v / totalSize) * 100);
    legend.push(`<tspan${i ? ' dx="18"' : ''} font-size="17" fill="${color}">●</tspan><tspan dx="6">${esc(p.name)} ${pct < 1 ? '&lt;1' : pct}%</tspan>`);
  });
  const legendY = r1(barY + 34);
  const height = Math.ceil(legendY + 8);

  const stats = [
    [num(d.total), 'Contributions'],
    [num(d.commits), 'Commits'],
    [num(d.prs), 'Pull requests'],
    [num(d.stars), 'Stars earned'],
    [`${current}d`, 'Current streak'],
  ].map(([value, label], i) => {
    const x = i * (W / 5);
    const fill = i === 4 ? t.accent : t.text;
    return `<g class="rise" style="animation-delay:${(0.1 + i * 0.07).toFixed(2)}s">
  <text class="sans" x="${x}" y="88" font-size="28" font-weight="700" fill="${fill}">${value}</text>
  <text class="serif" x="${x}" y="112" font-size="14" fill="${t.muted}">${label}</text>
</g>`;
  });

  const css = `
.rise { animation: rise .7s cubic-bezier(.2,.7,.2,1) both; }
@keyframes rise { from { opacity: 0; transform: translateY(6px); } }
.col { animation: fade .5s ease-out both; }
@keyframes fade { from { opacity: 0; } }
.today { fill: none; stroke: ${t.accent}; stroke-width: 1.5; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 50% { stroke-opacity: .2; } }
.bar { transform-origin: 0 ${barY}px; animation: grow 1.4s cubic-bezier(.3,.7,.2,1) .9s both; }
@keyframes grow { from { transform: scaleX(0); } }
`;
  const body = `<text class="sans" x="0" y="20" font-size="15" font-weight="600" fill="${t.text}">Activity</text>
<text class="sans" x="${W}" y="20" font-size="13" fill="${t.faint}" text-anchor="end">last 12 months · longest streak ${longest}d</text>
<rect x="0" y="34" width="${W}" height="1" fill="${t.rule}"/>
${stats.join('\n')}
<g class="sans" font-size="11" fill="${t.faint}">${months.join('')}</g>
${heat.join('\n')}
<g class="bar">${bar.join('')}</g>
<text class="sans" x="0" y="${legendY}" font-size="13" fill="${t.muted}">${legend.join('')}</text>`;
  return svg(height, `GitHub activity: ${num(d.total)} contributions in the last 12 months`, css, body);
}

// ---------- main ----------

const args = process.argv.slice(2);
const outdir = args.find((a) => !a.startsWith('--'));
if (!outdir) {
  console.error('Usage: node scripts/cards.mjs <outdir> [--mock]');
  process.exit(2);
}
const data = args.includes('--mock') ? mockData() : await fetchLive();
await mkdir(outdir, { recursive: true });
for (const [name, theme] of Object.entries(THEMES)) {
  await writeFile(join(outdir, `header-${name}.svg`), header(theme));
  await writeFile(join(outdir, `activity-${name}.svg`), activity(theme, data));
}
console.log(`Wrote 4 cards to ${outdir}`);
