/* 음력 ↔ 양력 변환 (한국 기준, 브라우저·Node 공용)
 * 표를 내려받지 않고 천문 계산으로 만든다.
 * - 삭(초하루): Meeus 49장 + 행성 보정(오차 수십 초 안쪽)
 * - 중기(동지·대한…): saju.js 의 태양 황경(VSOP87)
 * - 날짜는 한국 표준시(1954~1961은 UTC+8:30) 자정 기준
 * - 동지가 든 달 = 11월, 동지~다음 동지 사이 13달이면 중기 없는 첫 달이 윤달
 */
(function (root) {
  const S = root.Saju || (typeof require !== 'undefined' ? require('./saju.js') : null);
  const rad = (d) => (d * Math.PI) / 180;
  const sin = (d) => Math.sin(rad(d));

  // k번째 삭의 순간(UT 율리우스일). k=0 은 2000-01-06 무렵
  function newMoonJD(k) {
    const T = k / 1236.85;
    let jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T * T - 0.00000015 * T ** 3 + 0.00000000073 * T ** 4;
    const E = 1 - 0.002516 * T - 0.0000074 * T * T;
    const M = 2.5534 + 29.1053567 * k - 0.0000014 * T * T - 0.00000011 * T ** 3;
    const Mp = 201.5643 + 385.81693528 * k + 0.0107582 * T * T + 0.00001238 * T ** 3 - 0.000000058 * T ** 4;
    const F = 160.7108 + 390.67050284 * k - 0.0016118 * T * T - 0.00000227 * T ** 3 + 0.000000011 * T ** 4;
    const Om = 124.7746 - 1.56375588 * k + 0.0020672 * T * T + 0.00000215 * T ** 3;
    jde += -0.4072 * sin(Mp) + 0.17241 * E * sin(M) + 0.01608 * sin(2 * Mp) + 0.01039 * sin(2 * F) +
      0.00739 * E * sin(Mp - M) - 0.00514 * E * sin(Mp + M) + 0.00208 * E * E * sin(2 * M) -
      0.00111 * sin(Mp - 2 * F) - 0.00057 * sin(Mp + 2 * F) + 0.00056 * E * sin(2 * Mp + M) -
      0.00042 * sin(3 * Mp) + 0.00042 * E * sin(M + 2 * F) + 0.00038 * E * sin(M - 2 * F) -
      0.00024 * E * sin(2 * Mp - M) - 0.00017 * sin(Om) - 0.00007 * sin(Mp + 2 * M) +
      0.00004 * sin(2 * Mp - 2 * F) + 0.00004 * sin(3 * M) + 0.00003 * sin(Mp + M - 2 * F) +
      0.00003 * sin(2 * Mp + 2 * F) - 0.00003 * sin(Mp + M + 2 * F) + 0.00003 * sin(Mp - M + 2 * F) -
      0.00002 * sin(Mp - M - 2 * F) - 0.00002 * sin(3 * Mp + M) + 0.00002 * sin(4 * Mp);
    const A = [
      [299.77 + 0.107408 * k - 0.009173 * T * T, 325], [251.88 + 0.016321 * k, 165], [251.83 + 26.651886 * k, 164],
      [349.42 + 36.412478 * k, 126], [84.66 + 18.206239 * k, 110], [141.74 + 53.303771 * k, 62],
      [207.14 + 2.453732 * k, 60], [154.84 + 7.30686 * k, 56], [34.52 + 27.261239 * k, 47],
      [207.19 + 0.121824 * k, 42], [291.34 + 1.844379 * k, 40], [161.72 + 24.198154 * k, 37],
      [239.56 + 25.513099 * k, 35], [331.55 + 3.592518 * k, 23],
    ];
    for (const [a, c] of A) jde += c * 1e-6 * sin(a);
    const y = 2000 + k / 12.3685;
    return jde - S.deltaT(y) / 86400;
  }

  // UT 순간 → 한국 날짜의 날 번호(JDN)
  function koreaDayNumber(jdUT) {
    const approx = S.jdToDate(jdUT + 9 / 24);
    const off = S.koreaOffset(approx.year, approx.month, approx.day, Math.floor(approx.hour)).base;
    return Math.floor(jdUT + off / 24 + 0.5);
  }

  // 날 번호 이하에서 가장 가까운 삭의 k
  function kOnOrBefore(dayNo) {
    let k = Math.floor((dayNo - 2451550.1) / 29.530588861) + 1;
    while (koreaDayNumber(newMoonJD(k)) > dayNo) k--;
    while (koreaDayNumber(newMoonJD(k + 1)) <= dayNo) k++;
    return k;
  }

  const cache = {};
  // 동지(y-1)가 든 달부터 동지(y)가 든 달 직전까지의 달 목록
  function span(y) {
    if (cache[y]) return cache[y];
    const ws0 = koreaDayNumber(S.solarTermJD(y - 1, 270));
    const ws1 = koreaDayNumber(S.solarTermJD(y, 270));
    const k0 = kOnOrBefore(ws0), k1 = kOnOrBefore(ws1);
    const months = [];
    for (let k = k0; k < k1; k++) months.push({ k, start: koreaDayNumber(newMoonJD(k)), end: koreaDayNumber(newMoonJD(k + 1)) });
    // 각 달에 중기(황경 30의 배수)가 있는지
    const zq = [];
    for (let yy = y - 1; yy <= y; yy++) for (let L = 0; L < 360; L += 30) zq.push(koreaDayNumber(S.solarTermJD(yy, L)));
    months.forEach((m) => { m.hasZq = zq.some((d) => d >= m.start && d < m.end); });
    const leapYear = months.length === 13;
    let label = 10, leapUsed = false, reachedJan = false;
    months.forEach((m, i) => {
      if (leapYear && !leapUsed && i > 0 && !m.hasZq) { m.leap = true; leapUsed = true; m.month = label; }
      else { m.leap = false; label = label % 12 + 1; m.month = label; }
      if (m.month === 1 && !m.leap) reachedJan = true;
      m.year = reachedJan ? y : y - 1;
      m.days = m.end - m.start;
    });
    return (cache[y] = months);
  }

  function monthsOfLunarYear(Y) {
    return [...span(Y), ...span(Y + 1)].filter((m) => m.year === Y);
  }

  function jdnToYMD(jdn) { const d = S.jdToDate(jdn); return { year: d.year, month: d.month, day: d.day }; }

  /** 음력 → 양력. 없는 날이면 null */
  function lunarToSolar(year, month, day, leap) {
    const m = monthsOfLunarYear(year).find((x) => x.month === month && !!x.leap === !!leap);
    if (!m || day < 1 || day > m.days) return null;
    return jdnToYMD(m.start + day - 1);
  }

  /** 양력 → 음력 */
  function solarToLunar(y, mo, d) {
    const dayNo = Math.floor(S.julianDay(y, mo, d, 12) + 0.5);
    for (const Y of [y - 1, y]) {
      const m = monthsOfLunarYear(Y).find((x) => dayNo >= x.start && dayNo < x.end);
      if (m) return { year: Y, month: m.month, day: dayNo - m.start + 1, leap: m.leap };
    }
    return null;
  }

  /** 그 해 윤달 번호(없으면 0) */
  function leapMonthOf(Y) { const m = monthsOfLunarYear(Y).find((x) => x.leap); return m ? m.month : 0; }
  function daysInLunarMonth(Y, month, leap) { const m = monthsOfLunarYear(Y).find((x) => x.month === month && !!x.leap === !!leap); return m ? m.days : 0; }

  const api = { newMoonJD, lunarToSolar, solarToLunar, leapMonthOf, daysInLunarMonth, monthsOfLunarYear };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Lunar = api;
})(typeof self !== 'undefined' ? self : this);
