/* 사주 계산 엔진 (브라우저·Node 공용)
 * - 절기: 태양 겉보기 황경(Meeus 25장, 정확도 약 0.01도 ≈ 15분 안쪽)
 * - 한국 표준시 변천(1908~1911·1954~1961 UTC+8:30)과 서머타임(1948~1960, 1987~1988) 반영
 * - 출생지 경도로 실제 태양시 보정(서울 약 -32분), 끌 수 있음
 * - 자시: 기본은 23시에 날이 바뀜, 옵션으로 야자시(자정에 날 바뀜)
 */
(function (root) {
  const STEMS = '甲乙丙丁戊己庚辛壬癸'.split('');
  const STEMS_KO = '갑을병정무기경신임계'.split('');
  const BRANCHES = '子丑寅卯辰巳午未申酉戌亥'.split('');
  const BRANCHES_KO = '자축인묘진사오미신유술해'.split('');
  const ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
  const ELEMENTS = ['목', '화', '토', '금', '수'];
  const ELEMENTS_HANJA = ['木', '火', '土', '金', '水'];
  const BRANCH_ELEMENT = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
  const JIE_NAMES = ['입춘', '경칩', '청명', '입하', '망종', '소서', '입추', '백로', '한로', '입동', '대설', '소한'];

  const mod = (a, n) => ((a % n) + n) % n;
  const rad = (d) => (d * Math.PI) / 180;

  // 그레고리력 날짜(UT) → 율리우스일
  function julianDay(y, m, d, hourFrac) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + (hourFrac || 0) / 24 + B - 1524.5;
  }

  // ΔT(초): Espenak·Meeus 근사식
  function deltaT(year) {
    const y = year;
    let t;
    if (y < 1900) return 0;
    if (y < 1920) { t = y - 1900; return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t ** 3 - 0.000197 * t ** 4; }
    if (y < 1941) { t = y - 1920; return 21.2 + 0.84493 * t - 0.0761 * t * t + 0.0020936 * t ** 3; }
    if (y < 1961) { t = y - 1950; return 29.07 + 0.407 * t - t * t / 233 + t ** 3 / 2547; }
    if (y < 1986) { t = y - 1975; return 45.45 + 1.067 * t - t * t / 260 - t ** 3 / 718; }
    if (y < 2005) { t = y - 2000; return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5; }
    if (y < 2050) { t = y - 2000; return 62.92 + 0.32217 * t + 0.005589 * t * t; }
    return -20 + 32 * ((y - 1820) / 100) ** 2 - 0.5628 * (2150 - y);
  }

  // VSOP87 지구 황경 줄인 표(Meeus 부록 III) [A, B, C]
  const VL = [
    [[175347046, 0, 0], [3341656, 4.6692568, 6283.07585], [34894, 4.6261, 12566.1517], [3497, 2.7441, 5753.3849], [3418, 2.8289, 3.5231], [3136, 3.6277, 77713.7715], [2676, 4.4181, 7860.4194], [2343, 6.1352, 3930.2097], [1324, 0.7425, 11506.7698], [1273, 2.0371, 529.691], [1199, 1.1096, 1577.3435], [990, 5.233, 5884.927], [902, 2.045, 26.298], [857, 3.508, 398.149], [780, 1.179, 5223.694], [753, 2.533, 5507.553], [505, 4.583, 18849.228], [492, 4.205, 775.523], [357, 2.92, 0.067], [317, 5.849, 11790.629], [284, 1.899, 796.298], [271, 0.315, 10977.079], [243, 0.345, 5486.778], [206, 4.806, 2544.314], [205, 1.869, 5573.143], [202, 2.458, 6069.777], [156, 0.833, 213.299], [132, 3.411, 2942.463], [126, 1.083, 20.775], [115, 0.645, 0.98], [103, 0.636, 4694.003], [102, 0.976, 15720.839], [102, 4.267, 7.114], [99, 6.21, 2146.17], [98, 0.68, 155.42], [86, 5.98, 161000.69], [85, 1.3, 6275.96], [85, 3.67, 71430.7], [80, 1.81, 17260.15], [79, 3.04, 12036.46], [75, 1.76, 5088.63], [74, 3.5, 3154.69], [74, 4.68, 801.82], [70, 0.83, 9437.76], [62, 3.98, 8827.39], [61, 1.82, 7084.9], [57, 2.78, 6286.6], [56, 4.39, 14143.5], [56, 3.47, 6279.55], [52, 0.19, 12139.55], [52, 1.33, 1748.02], [51, 0.28, 5856.48], [49, 0.49, 1194.45], [41, 5.37, 8429.24], [41, 2.4, 19651.05], [39, 6.17, 10447.39], [37, 6.04, 10213.29], [37, 2.57, 1059.38], [36, 1.71, 2352.87], [36, 1.78, 6812.77], [33, 0.59, 17789.85], [30, 0.44, 83996.85], [30, 2.74, 1349.87], [25, 3.16, 4690.48]],
    [[628331966747, 0, 0], [206059, 2.678235, 6283.07585], [4303, 2.6351, 12566.1517], [425, 1.59, 3.523], [119, 5.796, 26.298], [109, 2.966, 1577.344], [93, 2.59, 18849.23], [72, 1.14, 529.69], [68, 1.87, 398.15], [67, 4.41, 5507.55], [59, 2.89, 5223.69], [56, 2.17, 155.42], [45, 0.4, 796.3], [36, 0.47, 775.52], [29, 2.65, 7.11], [21, 5.34, 0.98], [19, 1.85, 5486.78], [19, 4.97, 213.3], [17, 2.99, 6275.96], [16, 0.03, 2544.31], [16, 1.43, 2146.17], [15, 1.21, 10977.08], [12, 2.83, 1748.02], [12, 3.26, 5088.63], [12, 5.27, 1194.45], [12, 2.08, 4694], [11, 0.77, 553.57], [10, 1.3, 6286.6], [10, 4.24, 1349.87], [9, 2.7, 242.73], [9, 5.64, 951.72], [8, 5.3, 2352.87], [6, 2.65, 9437.76], [6, 4.67, 4690.48]],
    [[52919, 0, 0], [8720, 1.0721, 6283.0758], [309, 0.867, 12566.152], [27, 0.05, 3.52], [16, 5.19, 26.3], [16, 3.68, 155.42], [10, 0.76, 18849.23], [9, 2.06, 77713.77], [7, 0.83, 775.52], [5, 4.66, 1577.34], [4, 1.03, 7.11], [4, 3.44, 5573.14], [3, 5.14, 796.3], [3, 6.05, 5507.55], [3, 1.19, 242.73], [3, 6.12, 529.69], [3, 0.31, 398.15], [3, 2.28, 553.57], [2, 4.38, 5223.69], [2, 3.75, 0.98]],
    [[289, 5.844, 6283.076], [35, 0, 0], [17, 5.49, 12566.15], [3, 5.2, 155.42], [1, 4.72, 3.52], [1, 5.3, 18849.23], [1, 5.97, 242.73]],
    [[114, 3.142, 0], [8, 4.13, 6283.08], [1, 3.84, 12566.15]],
    [[1, 3.14, 0]],
  ];

  // 태양 겉보기 황경(도), 입력은 역학시 JDE
  function sunLongitude(jde) {
    const tau = (jde - 2451545.0) / 365250;
    let L = 0;
    for (let i = 0; i < VL.length; i++) {
      let s = 0;
      for (const [A, B, C] of VL[i]) s += A * Math.cos(B + C * tau);
      L += s * tau ** i;
    }
    L = L / 1e8 * 180 / Math.PI + 180; // 지구 → 태양
    const T = tau * 10;
    const omega = rad(125.04452 - 1934.136261 * T);
    const Ls = rad(280.4665 + 36000.7698 * T), Lm = rad(218.3165 + 481267.8813 * T);
    const dpsi = -17.2 * Math.sin(omega) - 1.32 * Math.sin(2 * Ls) - 0.23 * Math.sin(2 * Lm) + 0.21 * Math.sin(2 * omega);
    return mod(L + (-0.09033 + dpsi - 20.4898) / 3600, 360);
  }

  // 한국 시계 → UTC 차이(시간). 서머타임 포함.
  // 서머타임 구간은 [시작, 끝) 한국 시계 기준 "YYYYMMDDHH".
  const DST = [
    [1948060100, 1948091300], [1949040300, 1949091100], [1950040100, 1950091000],
    [1951050600, 1951090900], [1955050500, 1955090900], [1956052000, 1956093000],
    [1957050500, 1957092200], [1958050400, 1958092100], [1959050300, 1959092000],
    [1960050100, 1960091800], [1987051002, 1987101103], [1988050802, 1988100903],
  ];
  function koreaOffset(y, m, d, h) {
    const key = y * 1000000 + m * 10000 + d * 100 + h;
    let base = 9;
    if ((key >= 1908040100 && key < 1912010100) || (key >= 1954032100 && key < 1961081000)) base = 8.5;
    for (const [s, e] of DST) if (key >= s && key < e) return { offset: base + 1, dst: true, base };
    return { offset: base, dst: false, base };
  }

  // 율리우스일 → 그레고리력 날짜
  function jdToDate(jd) {
    const z = Math.floor(jd + 0.5);
    const f = jd + 0.5 - z;
    let A = z;
    if (z >= 2299161) { const a = Math.floor((z - 1867216.25) / 36524.25); A = z + 1 + a - Math.floor(a / 4); }
    const B = A + 1524, C = Math.floor((B - 122.1) / 365.25), D = Math.floor(365.25 * C), E = Math.floor((B - D) / 30.6001);
    const day = B - D - Math.floor(30.6001 * E);
    const month = E < 14 ? E - 1 : E - 13;
    const year = month > 2 ? C - 4716 : C - 4715;
    return { year, month, day, hour: f * 24 };
  }

  // 황경 target 에 태양이 닿는 순간(UT 율리우스일)
  function solarTermJD(year, targetLon) {
    // 대략 위치에서 시작해 뉴턴법으로 좁힘
    let jd = julianDay(year, 1, 1, 0) + mod(targetLon - 280, 360) / 360 * 365.2422;
    for (let i = 0; i < 8; i++) {
      const lon = sunLongitude(jd + deltaT(year) / 86400);
      let diff = mod(targetLon - lon + 180, 360) - 180;
      jd += diff / 360 * 365.2422;
    }
    return jd;
  }

  function pillar(idx60) {
    const s = mod(idx60, 10), b = mod(idx60, 12);
    return { stem: s, branch: b, hanja: STEMS[s] + BRANCHES[b], ko: STEMS_KO[s] + BRANCHES_KO[b] };
  }
  function pillarFrom(stem, branch) {
    for (let i = 0; i < 60; i++) if (i % 10 === stem && i % 12 === branch) return pillar(i);
  }

  /**
   * 사주 계산
   * @param {object} p {year, month, day, hour?, minute?, longitude?=127, solarCorrection?=true, yajasi?=false}
   *   hour 를 비우면(null) 시주 없이 계산
   */
  function calcSaju(p) {
    const lon = p.longitude == null ? 127.0 : p.longitude;
    const hasTime = p.hour != null && p.hour !== '';
    const hh = hasTime ? Number(p.hour) : 12, mm = hasTime ? Number(p.minute || 0) : 0;
    const off = koreaOffset(p.year, p.month, p.day, hh);
    const ut = julianDay(p.year, p.month, p.day, hh + mm / 60 - off.offset);

    // 년·월: 태양 황경으로 판정
    const lonSun = sunLongitude(ut + deltaT(p.year) / 86400);
    const k = Math.floor(mod(lonSun - 315, 360) / 30); // 0=입춘(寅월) … 11=소한(丑월)
    let sajuYear = p.year;
    if (p.month <= 2 && k >= 10) sajuYear -= 1;
    const yearP = pillar(sajuYear - 4);
    const monthStem = mod((yearP.stem % 5) * 2 + 2 + k, 10);
    const monthP = pillarFrom(monthStem, mod(2 + k, 12));

    // 일·시: 보정한 현지 시각
    const shiftH = p.solarCorrection === false ? 9 : lon / 15; // 보정 끄면 표준시 UTC+9
    const local = jdToDate(ut + shiftH / 24);
    const localHour = local.hour;
    let dayJDN = Math.floor(julianDay(local.year, local.month, local.day, 12) + 0.5);
    const lateZi = hasTime && localHour >= 23;
    if (lateZi && !p.yajasi) dayJDN += 1;
    const dayP = pillar(dayJDN + 49);

    let hourP = null;
    if (hasTime) {
      const hb = mod(Math.floor((localHour + 1) / 2), 12);
      const stemBase = lateZi && p.yajasi ? mod(dayP.stem + 1, 10) : dayP.stem;
      hourP = pillarFrom(mod((stemBase % 5) * 2 + hb, 10), hb);
    }

    const pillars = [yearP, monthP, dayP, hourP];
    const count = [0, 0, 0, 0, 0];
    pillars.forEach((pp) => { if (pp) { count[Math.floor(pp.stem / 2)]++; count[BRANCH_ELEMENT[pp.branch]]++; } });

    // 절기 경계에 가까운지(앞뒤 30분) — 화면에 주의 문구용
    const jieLon = mod(315 + 30 * k, 360);
    const nextLon = mod(jieLon + 30, 360);
    const yr = p.year;
    const nearJie = [jieLon, nextLon].some((L) => {
      const cands = [yr - 1, yr, yr + 1].map((y) => solarTermJD(y, L));
      return cands.some((j) => Math.abs(j - ut) * 1440 < 30);
    });

    return {
      input: p, ut, jieIndex: k, year: yearP, month: monthP, day: dayP, hour: hourP, pillars,
      dayMaster: dayP.stem, elementCount: count, animal: ANIMALS[yearP.branch],
      jie: JIE_NAMES[k], dst: off.dst, nearJie,
      correctionMin: p.solarCorrection === false ? 0 : Math.round((lon / 15 - off.base) * 60),
      localSolarTime: { y: local.year, m: local.month, d: local.day, hour: localHour },
    };
  }

  // 특정 날짜(한국 날짜)의 일진
  function dayPillarOf(y, m, d) {
    return pillar(Math.floor(julianDay(y, m, d, 12) + 0.5) + 49);
  }

  // 십신: 일간 dm 기준 상대 천간 s
  const TEN_GODS = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'];
  function tenGod(dm, s) {
    const diff = mod(Math.floor(s / 2) - Math.floor(dm / 2), 5);
    const same = (dm % 2) === (s % 2);
    return TEN_GODS[diff * 2 + (same ? 0 : 1)];
  }

  // 지지 관계
  const HAP6 = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
  const WONJIN = [[0, 7], [1, 6], [2, 9], [3, 8], [4, 11], [5, 10]];
  const SAMHAP = [[8, 0, 4], [2, 6, 10], [5, 9, 1], [11, 3, 7]];
  const HYEONG = [[2, 5], [5, 8], [2, 8], [1, 10], [10, 7], [1, 7], [0, 3]];
  const has = (list, a, b) => list.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  function branchRelation(a, b) {
    if (a === b) return [4, 6, 9, 11].includes(a) ? '자형' : '같음';
    if (has(HAP6, a, b)) return '육합';
    if (mod(a - b, 12) === 6) return '충';
    if (SAMHAP.some((g) => g.includes(a) && g.includes(b))) return '삼합';
    if (has(HYEONG, a, b)) return '형';
    if (has(WONJIN, a, b)) return '원진';
    return '보통';
  }

  const api = {
    STEMS, STEMS_KO, BRANCHES, BRANCHES_KO, ANIMALS, ELEMENTS, ELEMENTS_HANJA, BRANCH_ELEMENT, JIE_NAMES,
    julianDay, jdToDate, deltaT, sunLongitude, solarTermJD, koreaOffset, calcSaju, dayPillarOf, tenGod, branchRelation, pillar,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Saju = api;
})(typeof self !== 'undefined' ? self : this);
