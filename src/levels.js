// Levels are built from a grid. Legend:
// '#' ground  'B' brick  '?' coin block  'P' power-up block  'o' coin
// 'e' walking enemy  'f' flying enemy  'S' player start  'G' goal
window.LEVELS = [buildLevel1()];

function buildLevel1() {
  const W = 130, H = 15;
  const g = Array.from({ length: H }, () => Array(W).fill(' '));
  const set = (x, y, c) => { g[y][x] = c; };
  const row = (x1, x2, y, c) => { for (let x = x1; x <= x2; x++) set(x, y, c); };
  const gaps = [[28, 30], [62, 65], [95, 97]];

  for (let x = 0; x < W; x++) {
    if (gaps.some(([a, b]) => x >= a && x <= b)) continue;
    set(x, 13, '#'); set(x, 14, '#');
  }
  set(3, 12, 'S');

  set(10, 9, '?'); row(14, 18, 9, 'B'); set(16, 9, 'P'); set(16, 5, '?');
  row(20, 24, 12, 'o'); set(22, 12, 'e');
  row(32, 34, 11, '#'); row(33, 35, 10, '#');     // step up after first gap
  row(40, 44, 9, 'B'); set(42, 9, '?'); row(40, 44, 8, 'o');
  set(48, 12, 'e'); set(52, 12, 'e'); set(50, 8, 'f');
  row(56, 60, 10, '#'); row(56, 60, 9, 'o');
  row(66, 69, 9, 'B'); set(67, 9, 'P');
  set(74, 12, 'e'); set(80, 7, 'f'); row(76, 82, 6, 'o');
  for (let i = 0; i < 5; i++) row(85 + i, 89, 12 - i, '#'); // staircase
  row(100, 104, 9, '?'); set(108, 12, 'e'); set(112, 12, 'e'); set(110, 6, 'f');
  for (let i = 0; i < 6; i++) row(115 + i, 120, 12 - i, '#');
  set(125, 10, 'G');
  return g.map(r => r.join(''));
}
