/* 「되묻는 조상님」 + 「조상님 처방」 (재미용, AI 비용 0원)
 * - 지난 인생에서 사주 신호가 가장 센 해 3개를 골라, 조상님이 「그 해 이런 일 있었제?」 하고 되묻는다.
 * - 손님 대답(맞다/긴가민가/아니다)에 따라 조상님 반응과 뒤 풀이가 바뀐다.
 * - 나쁜 일은 지난 일 공감으로만 말하고, 앞날을 나쁘게 단정하지 않는다.
 * - 처방: 니 사주에 필요한 기운 → 푸드비트 바다음식, 네이버 스토어로 보낸다(nt_ 유입 표시). */
(function (root) {
  const S = root.Saju || (typeof require !== 'undefined' ? require('./saju.js') : null);
  const E = ['나무', '불', '흙', '쇠', '물'];

  // 나이·성별로 「내 얘기」처럼 들리는 장면
  const SCENE = {
    M: [
      [29, '니 요새 「내가 잘 가고 있나」 밤에 천장 보고 생각 마이 하제. 남들은 다 앞서가는 것 같고.'],
      [39, '니 일도 집도 다 니 어깨에 걸려 있제. 힘들다 소리 한 번 제대로 못 하고, 괜찮은 척하는 게 버릇이 됐다.'],
      [49, '니 요새 밤에 혼자 돈 계산 마이 하제. 집에서는 웃는데, 속에는 짐이 니 키만큼 쌓였다.'],
      [59, '니 앞만 보고 달려왔는데, 문득 「이래 사는 기 맞나」 싶은 날이 늘었제. 몸이 먼저 신호를 보낸다.'],
      [200, '니 평생 식구 먹여 살린다꼬 니 몫은 맨날 뒤로 미뤘제. 인자는 니 차례다.'],
    ],
    F: [
      [29, '니 겉으로는 씩씩한데, 혼자 있을 때 「나만 이런가」 싶어 울컥한 날 있제.'],
      [39, '니는 다 챙기다가 정작 니 자신은 맨 뒤에 세운다. 요새 「나는 뭐 하고 사노」 생각 자주 들제.'],
      [49, '니 식구들 다 챙기면서, 니 속 알아주는 사람은 하나도 없다 싶을 때 있제. 할매는 안다.'],
      [59, '니 참 많이 참고 살았다. 그 참은 말들이 가슴에 돌처럼 앉아 있제.'],
      [200, '니 한평생 남 먼저 챙기고 살았제. 인자 니 하고 싶은 거 하나쯤은 해도 된다.'],
    ],
  };
  const STRONG_TWIST = {
    신강: '근데 니 고집 하나는 아무도 못 꺾는다. 한 번 아이다 싶으면 끝까지 아인 기라.',
    신약: '남 부탁 거절 못 해서 손해 본 적 많제? 니 착한 게 니 발목을 잡았다.',
    중화: '남들 눈엔 무난해 보여도, 니 속은 남들보다 몇 배는 시끄럽다.',
  };

  function scene(an, gender) {
    const age = an.now - an.birthY + 1;
    const list = SCENE[gender] || SCENE.M;
    const line = list.find(([max]) => age <= max)[1];
    return `${line} ${STRONG_TWIST[an.strength.label] || ''}`;
  }

  const Q = {
    move: (y, a) => `${y}년, 니 ${a}살 언저리… 자리가 한 번 크게 흔들렸제? 집을 옮기든, 하던 일을 접든, 새로 벌이든.`,
    lock: (y, a) => `${y}년, ${a}살 그 언저리… 돈이 어디 꽉 묶여서 애먹었제? 받을 돈이 안 들어오든가, 들어간 돈이 안 빠지든가.`,
    turn: (y, a) => `${y}년, 니 ${a}살 무렵부터 인생 물길이 확 꺾였다. 만나는 사람, 하는 일이 그 전하고 싹 달라졌제?`,
    heart: (y, a) => `${y}년, ${a}살 그 앞뒤로… 가까운 사람하고 마음이 크게 멀어진 일 있었제. 말은 안 해도 할매는 안다.`,
    hard: (y, a) => `${y}년, ${a}살 그 해는 몸도 마음도 무거웠제. 남들은 몰라도 니 혼자 이 악물고 버틴 해다.`,
    money: (y, a) => `${y}년, ${a}살쯤 큰돈이 한 번 움직였제? 들어왔든 나갔든, 손이 떨리는 돈이었을 기다.`,
    rise: (y, a) => `${y}년, 니 ${a}살 그 해… 막혔던 게 확 뚫리고 사람들이 니를 다시 봤제?`,
  };
  const WHY = {
    move: (p) => `그 해 하늘에서 「${p}」 글자가 내려와 니 자리(일지)를 정면으로 쳤다. 옛말로 「충」이다. 판이 안 바뀔 수가 없는 해였다.`,
    lock: (p) => `그 해 「${p}」 글자가 니 돈 글자를 합으로 꽁꽁 묶었다. 니가 못나서가 아이라, 돈이 잠길 수밖에 없는 해였다.`,
    turn: (p) => `그 해 십 년 물길(대운)이 「${p}」로 바뀌었다. 물길 바뀌는 해엔 누구라도 인생이 한 번 출렁인다.`,
    heart: (p) => `그 해 「${p}」 글자가 배우자 자리를 건드렸다. 마음이 멀어질 수밖에 없는 바람이 불었다.`,
    hard: (p) => `그 해 「${p}」 글자가 니한테 버거운 기운으로 들어왔다. 버틴 것만 해도 잘한 기다.`,
    money: (p) => `그 해 「${p}」 글자에 돈 기운이 실려 들어왔다. 돈이 크게 움직이는 해였다.`,
    rise: (p) => `그 해 「${p}」 글자가 니가 꼭 필요한 기운으로 들어왔다. 물 들어올 때였다.`,
  };
  const MAYBE = '그 해 아이면 바로 그 다음 해다. 기억은 흐려도 몸은 기억한다. 가만히 한번 떠올려 봐라.';
  const NO = {
    move: '겉으로 안 움직였으면 속이 움직였다. 그 해 니 마음속에서 「여길 떠야 되나」 하는 생각이 처음 들었을 기다.',
    lock: '돈이 안 묶였으면 마음이 묶였다. 하고 싶은 걸 못 하고 꾹 참은 해다.',
    turn: '그때는 몰랐어도, 지나고 보면 그 해가 갈림길이었다. 그 해 만난 사람·시작한 일을 한번 떠올려 봐라.',
    heart: '다툼이 없었으면 니가 참았다. 서운한 걸 말 안 하고 삼킨 해다.',
    hard: '니가 워낙 잘 버티는 놈이라 힘든 줄도 몰랐던 기다. 그것도 복이다.',
    money: '큰돈이 안 움직였으면, 큰 결정을 하나 미룬 해다. 그 미룬 것이 아직 니 마음에 남아 있다.',
    rise: '그 기회를 니가 그냥 흘려보냈을 수도 있다. 괜찮다, 물은 또 들어온다.',
  };

  // 지난 인생에서 「큰일 났을 법한 해」 3개 고르기
  function pickYears(an) {
    const startY = Math.max(an.birthY + 18, 1950);
    const turnYears = new Set(an.daeunList.map((d) => d.fromYear));
    const cands = [];
    for (let y = startY; y <= an.now - 1; y++) {
      const r = an.yearInfo(y);
      const ev = new Set(r.events.map((e) => e[0]));
      let w = 0; const kinds = [];
      const set = (k, v) => { w += v; if (!kinds.includes(k)) kinds.push(k); };
      if (r.rel === '충') { set('move', 3); set('heart', 0); }
      if (r.locked) set('lock', 2.5);
      if (turnYears.has(y)) set('turn', 2);
      if (ev.has('💔')) set('heart', 1.5);
      if (r.level === 4) set('hard', 1.5); else if (r.level === 3) set('hard', 0.75);
      if (r.level === 0) set('rise', 1);
      if (ev.has('💰')) set('money', 0.5);
      if (kinds.length) cands.push({ year: y, age: y - an.birthY + 1, kinds, w, pillar: r.pillar.hanja });
    }
    cands.sort((a, b) => b.w - a.w || b.year - a.year);
    const picked = [];
    for (const c of cands) {
      if (!picked.every((p) => Math.abs(p.year - c.year) >= 4)) continue;
      // 같은 질문이 되풀이되지 않게, 아직 안 쓴 종류를 먼저
      const used = picked.map((p) => p.kind);
      picked.push({ ...c, kind: c.kinds.find((k) => !used.includes(k)) || c.kinds[0] });
      if (picked.length === 3) break;
    }
    return picked.sort((a, b) => a.year - b.year);
  }

  function questions(an) {
    return pickYears(an).map((c) => ({
      ...c,
      q: Q[c.kind](c.year, c.age),
      yes: `그래, 할배 눈은 못 속인다. ${WHY[c.kind](c.pillar)}`,
      maybe: MAYBE,
      no: NO[c.kind],
    }));
  }

  // 대답을 다 들은 뒤 조상님 마무리 + 앞날(좋은 쪽으로만 콕 집기)
  function closing(an, answers, qs) {
    const yes = answers.filter((a) => a === 'yes').length;
    let best = null;
    for (let y = an.now; y <= an.now + 5; y++) { const r = an.yearInfo(y); if (!best || r.score > best.score) best = { ...r, year: y }; }
    const nextTurn = an.daeunList.find((d) => d.fromYear > an.now);
    const hard = qs.filter((q, i) => answers[i] === 'yes' && ['move', 'lock', 'hard', 'heart'].includes(q.kind)).map((q) => q.year);
    const head = yes >= 2 ? `봐라, ${qs.length}개 중에 ${yes}개를 맞혔제. 니 인생은 할배 손바닥 안이다.`
      : yes === 1 ? '하나는 딱 맞혔고, 나머지는 니가 속을 꽁꽁 싸매고 살아서 그렇다.'
        : '니가 속을 워낙 꽁꽁 싸매고 사는 놈이라 그렇다. 그래도 할배 말 들어 봐라.';
    const parts = [head];
    if (hard.length) parts.push(`니가 맞다 한 ${hard.join('년, ')}년 그 일들… 그게 다 니 탓이 아이라 물길 탓이었다.`);
    parts.push(best.year === an.now ? '그라고 니 돛 올릴 해는 바로 올해다. 망설이지 말고 그물 던져라.' : `앞으로 니 돛 올릴 해는 ${best.year}년이다. 그 해엔 망설이지 말고 그물 던져라.`);
    if (nextTurn) parts.push(`그라고 ${nextTurn.fromYear}년에 십 년 물길이 「${nextTurn.label}」 쪽으로 바뀐다. 그 전에 준비해 둬라.`);
    return { text: parts.join(' '), yes, best, hard };
  }

  /* 조상님 처방: 니 사주에 필요한 기운 → 바다음식 → 푸드비트 스토어
   * 링크는 스토어 안 검색(미검증: 스토어에 그 상품이 없으면 빈 화면), 골뱅이만 확인된 상품 주소 */
  const STORE = 'https://smartstore.naver.com/foodbeat';
  const RX = [
    { el: 0, food: '과메기 야채세트', kw: '과메기 야채세트', emoji: '🌿', how: '푸른 미역·쌈 채소에 싸 묵어라. 나무 기운이 쭉쭉 뻗는다.' },
    { el: 1, food: '성게', kw: '성게', emoji: '🌞', how: '붉은 성게알 한 숟갈이면 꺼진 불씨가 다시 붙는다.' },
    { el: 2, food: '과메기', kw: '과메기', emoji: '🐟', how: '바닷바람에 말린 과메기가 흔들리는 니 땅을 단단히 다져 준다.' },
    { el: 3, food: '백골뱅이', kw: '골뱅이', emoji: '🐌', how: '껍데기 단단한 골뱅이가 니 결단력을 세워 준다.', url: STORE + '/products/10218498322' },
    { el: 4, food: '장어', kw: '장어', emoji: '🐍', how: '물 기운 센 장어가 마른 니 기운에 물을 대 준다.' },
  ];
  function prescription(an) {
    const el = an.missingEls.find((i) => an.goodEls.includes(i)) ?? an.goodEls[0] ?? an.missingEls[0] ?? 2;
    const rx = RX.find((r) => r.el === el) || RX[2];
    const lack = an.missingEls.includes(el);
    const nt = `nt_source=saju&nt_medium=event&nt_detail=rx&nt_keyword=${encodeURIComponent(rx.kw)}`;
    const naver = rx.url ? `${rx.url}?${nt}` : `${STORE}/search?q=${encodeURIComponent(rx.kw)}&${nt}`;
    const coupang = `https://www.coupang.com/np/search?q=${encodeURIComponent('푸드비트 ' + rx.kw)}`;
    return {
      ...rx, elName: E[el], lack, naver, coupang,
      why: lack ? `니 사주 여덟 글자에 ${E[el]} 기운이 한 톨도 없다. 그런데 니한테 젤 필요한 기 바로 그 ${E[el]}이다.`
        : `니 사주에 젤 필요한 기운이 ${E[el]}이다.`,
    };
  }

  const api = { scene, questions, closing, prescription, pickYears };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Medium = api;
})(typeof self !== 'undefined' ? self : this);
