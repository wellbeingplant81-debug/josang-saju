/* 사주 자세히 보기 — 「조상님이 봐 주는 사주」 세계관
 * 동해 바닷가에서 평생 물일 하던 조상님이 후손 사주를 봐 준다. 말투는 정겨운 경상도.
 * 사업·연애·결혼·자식운, 대운(10년 흐름), 해마다 운(세운). 정해진 글을 조합(재미용, AI 비용 0원).
 * 건강·투자를 단정하지 않는다.
 */
(function (root) {
  const S = root.Saju || (typeof require !== 'undefined' ? require('./saju.js') : null);
  const mod = (a, n) => ((a % n) + n) % n;
  const HIDDEN = [9, 5, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8]; // 지장간 본기
  const GROUP = { 비견: '비겁', 겁재: '비겁', 식신: '식상', 상관: '식상', 편재: '재성', 정재: '재성', 편관: '관성', 정관: '관성', 편인: '인성', 정인: '인성' };
  const GROUP_KO = { 비겁: '나와 같은 기운(동료·경쟁)', 식상: '표현하는 기운(재주·말·작품)', 재성: '돈 기운(재물·결과)', 관성: '책임 기운(일·명예·규칙)', 인성: '도움 기운(배움·문서·어른)' };
  const ELEMENT_WORK = ['교육·출판·식물·패션', '방송·광고·IT·조명', '부동산·농업·중개·숙박', '금융·기계·법·의료기기', '바다·유통·무역·물류·음료'];
  const groupElement = (dmEl, g) => mod(dmEl + { 비겁: 0, 식상: 1, 재성: 2, 관성: 3, 인성: 4 }[g], 5);
  function hash(str) { let h = 2166136261; for (const c of str) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  const pick = (arr, seed) => arr[seed % arr.length];

  // ── 조상님 말씀 글 모음 ──────────────────────────
  const PERSON = {
    신강: [
      '니는 고집이 동해 바위만 하다. 근데 그 고집이 니 밥줄이데이. 남 밑에 있으면 답답해서 몬 산다, 니 일을 해야 빛나는 기라.',
      '아이고, 기운 센 거 봐라. 니는 파도가 쳐도 안 꺾이는 사주다. 대신 가끔은 돛을 내리고 쉬어 가래이.',
    ],
    신약: [
      '니는 혼자 끙끙대면 안 되는 사주다. 좋은 사람 옆에 두면 힘이 열 배로 커진데이. 사람 복이 곧 니 복이다.',
      '마음이 여리고 눈치가 빠르다. 그게 약점 같제? 아이다, 사람 마음 읽는 게 니 무기다.',
    ],
    중화: [
      '니는 이래 불어도 저래 불어도 잘 굴러가는 배다. 균형이 잘 잡혀서 할배가 걱정을 덜 해도 되겠다.',
      '모난 데 없이 둥글둥글한 사주다. 어디 가도 밥은 안 굶는다, 할매가 보장한데이.',
    ],
  };
  const MAIN = {
    비겁: '사주에 니 닮은 기운이 젤 많다. 친구 많고 자존심 세고, 지는 거 억수로 싫어하제?',
    식상: '사주에 재주 기운이 젤 많다. 말이면 말, 손이면 손, 뭐든 만들어 내는 재간둥이다.',
    재성: '사주에 돈 기운이 젤 많다. 돈 냄새를 기가 막히게 맡는 코를 타고났데이.',
    관성: '사주에 책임 기운이 젤 많다. 맡은 일은 끝까지 하는 반듯한 놈이다.',
    인성: '사주에 도움 기운이 젤 많다. 배우는 거 좋아하고 어른들한테 이쁨 받는 사주다.',
  };

  const DU = { // [좋음, 보통, 조심]
    비겁: ['니 편 들어줄 사람이 몰려오는 십 년이데이. 독립하고 판 키우기 딱 좋다.', '사람이 북적북적한 십 년. 친구도 많고 경쟁자도 많다 아이가. 니 몫은 니가 단디 챙기라.', '돈 빌려 달라, 동업하자는 사람이 줄을 선다. 보증은 절대 서지 마래이, 할배가 두 번 말한다.'],
    식상: ['니 재주가 밤바다 집어등처럼 번쩍번쩍하는 때다. 새 거 만들고 떠들수록 돈 된다.', '아이디어는 억수로 많은데 다 하다간 지친데이. 세 개만 골라 끝까지 해라.', '입이 화근이 될 수 있는 때다. 하고 싶은 말은 하룻밤 재우고 해라.'],
    재성: ['그물 던지는 족족 고기가 걸리는 십 년이다! 장사·확장 마음껏 해 봐라.', '돈이 들어오기도 하고 나가기도 한다. 들어올 때 쪼매씩 떼어 놔라.', '돈 냄새 따라가다 배 뒤집힌다. 욕심은 반만 내래이.'],
    관성: ['자리가 높아지고 이름이 나는 때다. 우리 집안 자랑이 될 기라.', '책임이 무거워지는 때. 어깨 아파도 버티면 그게 다 니 실력 된다.', '윗사람·규칙·서류 때문에 속 썩는 때다. 법이랑 약속은 칼같이 지키래이.'],
    인성: ['귀인이 나타나서 니 손을 잡아 준다. 공부하고 자격 따 두면 평생 밑천 된다.', '그물 손질하는 때다. 지금 배운 게 다음 십 년 밥줄이데이.', '생각만 많고 몸이 안 움직이는 때. 걱정은 조상이 할 테니 니는 움직이래이.'],
  };
  const DU_BRANCH = {
    비겁: '바닥엔 친구·동료 기운이 깔려 있어 사람 덕을 본다.',
    식상: '바닥엔 재주 기운이 깔려 손재주·말재주가 받쳐 준다.',
    재성: '바닥엔 돈 기운이 깔려 실속이 쏠쏠하다.',
    관성: '바닥엔 책임 기운이 깔려 일복이 터진다.',
    인성: '바닥엔 도움 기운이 깔려 어른·문서 덕을 본다.',
  };

  function positions(saju) {
    const dm = saju.dayMaster;
    const out = [];
    const add = (where, stem, weight) => out.push({ where, stem, god: S.tenGod(dm, stem), group: GROUP[S.tenGod(dm, stem)], weight });
    add('년간', saju.year.stem, 1); add('월간', saju.month.stem, 1.2);
    if (saju.hour) add('시간', saju.hour.stem, 1);
    add('년지', HIDDEN[saju.year.branch], 1); add('월지', HIDDEN[saju.month.branch], 3); add('일지', HIDDEN[saju.day.branch], 2);
    if (saju.hour) add('시지', HIDDEN[saju.hour.branch], 1);
    return out;
  }

  function strength(saju, pos) {
    const tot = pos.reduce((a, p) => a + p.weight, 0);
    const sup = pos.filter((p) => p.group === '비겁' || p.group === '인성').reduce((a, p) => a + p.weight, 0);
    const dmEl = Math.floor(saju.dayMaster / 2);
    const cnt = saju.elementCount, all = cnt.reduce((a, b) => a + b, 0);
    const r = (sup / tot + (cnt[dmEl] + cnt[mod(dmEl + 4, 5)]) / all) / 2;
    return { ratio: r, label: r >= 0.55 ? '신강' : r <= 0.42 ? '신약' : '중화' };
  }

  function favorable(st) {
    if (st.label === '신강') return { good: ['식상', '재성', '관성'], bad: ['비겁', '인성'] };
    if (st.label === '신약') return { good: ['인성', '비겁'], bad: ['재성', '관성', '식상'] };
    return { good: ['식상', '재성', '인성'], bad: [] };
  }

  function daeun(saju, gender) {
    const forward = (gender === 'M') === (saju.year.stem % 2 === 0);
    const jieLon = mod(315 + 30 * saju.jieIndex, 360), nextLon = mod(jieLon + 30, 360);
    const y = saju.input.year;
    const cands = (L) => [y - 1, y, y + 1].map((yy) => S.solarTermJD(yy, L));
    const days = forward ? Math.min(...cands(nextLon).filter((j) => j > saju.ut)) - saju.ut
      : saju.ut - Math.max(...cands(jieLon).filter((j) => j <= saju.ut));
    const startAge = Math.max(1, Math.round(days / 3));
    let monthIdx = 0; for (let i = 0; i < 60; i++) if (i % 10 === saju.month.stem && i % 12 === saju.month.branch) monthIdx = i;
    const list = [];
    for (let i = 1; i <= 9; i++) list.push({ age: startAge + (i - 1) * 10, pillar: S.pillar(monthIdx + (forward ? i : -i)) });
    return { forward, startAge, list };
  }

  function rate(saju, fav, p) {
    const sg = GROUP[S.tenGod(saju.dayMaster, p.stem)], bg = GROUP[S.tenGod(saju.dayMaster, HIDDEN[p.branch])];
    let s = 0;
    for (const g of [sg, bg]) { if (fav.good.includes(g)) s += 1; if (fav.bad.includes(g)) s -= 1; }
    const rel = S.branchRelation(saju.day.branch, p.branch);
    if (rel === '충') s -= 0.75; if (rel === '육합' || rel === '삼합') s += 0.5;
    const label = s >= 1.5 ? '아주 좋음' : s >= 0.5 ? '좋음' : s > -0.5 ? '보통' : s > -1.5 ? '조심' : '많이 조심';
    const tier = s >= 0.5 ? 0 : s > -0.5 ? 1 : 2;
    let text = DU[sg][tier];
    if (bg !== sg) text += ' ' + DU_BRANCH[bg];
    if (rel === '충') text += ' 그라고 이사·이직 같은 큰 움직임이 한 번은 온다. 겁내지 마라, 판이 바뀌는 기다.';
    if (rel === '육합' || rel === '삼합') text += ' 집안이 화목하고 일이 술술 풀리는 합이 들었데이.';
    return { score: s, label, stemGroup: sg, branchGroup: bg, rel, text };
  }

  function analyze(saju, gender) {
    const pos = positions(saju);
    const cnt = { 비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0 };
    pos.forEach((p) => { cnt[p.group]++; });
    const st = strength(saju, pos);
    const fav = favorable(st);
    const dmEl = Math.floor(saju.dayMaster / 2);
    const goodEls = [...new Set(fav.good.map((g) => groupElement(dmEl, g)))];
    const missingEls = saju.elementCount.map((c, i) => (c === 0 ? i : -1)).filter((i) => i >= 0);
    const E = S.ELEMENTS;
    const branches = [saju.year, saju.month, saju.day, saju.hour].filter(Boolean).map((p) => p.branch);
    const dohwa = branches.filter((b) => [0, 3, 6, 9].includes(b)).length;
    const yeokma = branches.filter((b) => [2, 5, 8, 11].includes(b)).length;
    const seed = hash(saju.pillars.filter(Boolean).map((p) => p.hanja).join(''));
    const top = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0][0];

    const personality = [pick(PERSON[st.label], seed), MAIN[top],
      missingEls.length ? `근데 ${missingEls.map((i) => E[i]).join('·')} 기운이 하나도 없데이. 걱정 마라, 그건 일·사람·밥상으로 채우면 된다.` : '다섯 기운이 다 들어 있다. 이래 고루 갖춘 사주 드물데이.'].join(' ');

    const biz = [];
    biz.push(st.label === '신강' ? '니는 사장 할 팔자다. 결정 빠르고 버티는 힘 있으니 니가 직접 키를 잡아라.'
      : st.label === '신약' ? '혼자 다 할라 카지 마라. 믿을 사람 하나, 잘 돌아가는 시스템 하나 붙이면 배가 쭉쭉 나간다.'
        : '천천히, 꾸준히 키우는 장사가 니한테 맞다. 한 방보다 오래 가는 배가 이긴데이.');
    if (cnt.재성 === 0) biz.push('사주에 돈 글자가 안 보인다꼬 서운해하지 마라. 니는 돈을 쫓는 게 아이라 신용을 쌓으면 돈이 알아서 따라오는 사주다.');
    else if (cnt.재성 >= 3) biz.push('돈 글자가 사주에 그득하다! 기회는 자꾸 오는데, 다 잡을라 카면 그물 찢어진다. 골라서 잡아라.');
    else biz.push(`돈 글자가 ${cnt.재성}개, 딱 알맞다. 어디서 고기 잡히는지 아는 눈이 있다.`);
    if (cnt.비겁 >= 3) biz.push('니 닮은 기운이 많아서 경쟁자가 늘 옆에 있다. 동업하면 고기를 나눠 묵게 되니 돈줄은 니가 꼭 쥐고 있어라. 대신 사람 거느리는 힘은 장군감이다.');
    if (cnt.식상 === 0) biz.push('재주 기운이 없다꼬 기죽지 마래이. 홍보·기획은 잘하는 사람이나 요즘 기계(AI·영상)한테 맡기면 된다. 니는 큰 그림만 그려라.');
    else if (cnt.식상 >= 2) biz.push('말발·손재주가 니 무기다. 직접 만들고 직접 알리면 손님이 알아서 찾아온다.');
    if (cnt.관성 >= 1) biz.push('명예 기운이 있어서 약속 지키고 원칙대로 하면 거래처가 대를 이어 간다.');
    biz.push(`니한테 맞는 물길: ${goodEls.map((i) => `${E[i]}(${ELEMENT_WORK[i]})`).join(', ')}.`);
    if (missingEls.includes(4) && goodEls.includes(4)) biz.push('사주에 물이 한 방울도 없는데 바다 일을 한다꼬? 아이고 잘했다! 모자란 기운을 일로 채우는 거, 그게 바로 조상 덕이다.');
    if (yeokma >= 1) biz.push('움직이는 별(역마)이 있다. 가만 앉아 있으면 운이 고이고, 현장 뛰고 배송 보내고 사람 만나야 운이 돈다.');

    const spouseGroup = gender === 'M' ? '재성' : '관성';
    const childGroup = gender === 'M' ? '관성' : '식상';
    const spousePos = pos.find((p) => p.group === spouseGroup);
    const love = [];
    love.push(dohwa >= 2 ? `인기 별(도화)이 ${dohwa}개다. 니 젊을 때 동네 처녀총각들 마이 울렸제? 말 한마디, 눈빛 한 번에 호감 사는 타입이다.`
      : dohwa === 1 ? '인기 별(도화)이 하나 있어서 은근한 매력이 있다. 알면 알수록 빠져드는 맛이 있는 기라.'
        : '도화는 없다. 첫눈에 반하게 하는 타입은 아이지만, 오래 볼수록 진국이라 한 번 잡으면 안 놓친다.');
    if (!spousePos) love.push('사주에 짝 글자가 숨어 있다. 연애는 늦게 불붙거나, 일하다가 모임 나가다가 슬그머니 온다.');
    else if (cnt[spouseGroup] >= 3) love.push('짝 글자가 많아서 인연이 자꾸 찾아온다. 한 사람한테 마음 주는 게 니 행복의 열쇠데이.');
    else love.push(`짝 글자가 알맞게 있다. ${spousePos.where.startsWith('월') ? '일터나 사회생활에서' : spousePos.where.startsWith('년') ? '어릴 적 친구나 고향 인연 중에서' : '가까운 생활 반경에서'} 인연이 닿는다.`);
    if (st.label === '신강' && cnt.비겁 >= 3) love.push('근데 니 고집 때문에 연애할 때도 키를 니가 잡을라 칸다. 상대 말 끝까지 들어 주면 점수가 두 배다, 명심해래이.');

    const marry = [];
    const palace = GROUP[S.tenGod(saju.dayMaster, HIDDEN[saju.day.branch])];
    marry.push({
      비겁: '배우자 자리에 니 닮은 기운이 앉아 있다. 친구 같은 부부가 되는데, 고집 둘이 부딪치면 파도가 친다. 져 주는 쪽이 이기는 기다.',
      식상: '배우자 자리에 재주 기운이 앉았다. 같이 있으면 웃음이 끊이질 않는 집이 된다.',
      재성: '배우자 자리에 돈 기운이 앉았다. 살림 야무지게 하는 짝을 만나 곳간이 차는 집이다.',
      관성: '배우자 자리에 명예 기운이 앉았다. 반듯하고 책임감 있는 짝이다. 서로 체면 세워 주는 집안이 된다.',
      인성: '배우자 자리에 도움 기운이 앉았다. 니를 챙기고 받쳐 주는 짝이니, 고맙다는 말 아끼지 마래이.',
    }[palace]);
    const relsDay = [saju.year, saju.month, saju.hour].filter(Boolean).map((p) => S.branchRelation(saju.day.branch, p.branch));
    if (relsDay.includes('육합') || relsDay.includes('삼합')) marry.push('배우자 자리가 다른 글자랑 손을 꼭 잡고(합) 있다. 집안이 화목한 사주다, 할매가 흐뭇하다.');
    if (relsDay.includes('충')) marry.push('배우자 자리를 치는 글자(충)가 있다. 떨어져 지내는 때가 있거나 다투기 쉬운데, 싸우면 그날 안에 풀어라. 이게 조상 비법이다.');
    if (relsDay.includes('원진') || relsDay.includes('형')) marry.push('사소한 말에 서운함이 쌓이기 쉬운 자리다. 하루 한 번 "고맙다" 소리 해라, 돈 안 든다.');
    marry.push(`결혼 인연이 들어오는 때는 아래 대운·해마다 운에서 💍 표시 붙은 해다.`);

    const child = [];
    const childCnt = cnt[childGroup];
    child.push(childCnt === 0 ? '자식 글자가 숨어 있다. 자식이랑은 친구처럼, 한 발짝 떨어져서 믿어 주는 게 젤 잘 맞는다.'
      : childCnt >= 2 ? '자식 글자가 넉넉하다. 자식 복 있다, 자식 땜에 웃을 일이 많을 기라.'
        : '자식 글자가 하나 있다. 정이 깊어서 한 명 한 명 온 정성으로 키우는 부모다.');
    if (saju.hour) {
      const hg = GROUP[S.tenGod(saju.dayMaster, HIDDEN[saju.hour.branch])];
      child.push({
        비겁: '자식 자리에 니 닮은 기운이 있다. 니 붕어빵이라 커서는 든든한 동료가 된다.',
        식상: '자식 자리에 재주 기운이 있다. 끼 많고 말 잘하는 자식이다, 무대 체질일 수도 있데이.',
        재성: '자식 자리에 돈 기운이 있다. 경제 감각 있는 자식이라 늙어서 실속 챙겨 준다.',
        관성: '자식 자리에 명예 기운이 있다. 반듯하게 커서 집안 이름을 빛낸다.',
        인성: '자식 자리에 도움 기운이 있다. 공부 운 있고, 부모 잘 챙기는 효자·효녀다.',
      }[hg]);
    } else child.push('태어난 시간을 알면 자식 자리(시주)까지 봐 줄 수 있는데… 어무이한테 한번 물어봐라.');

    const du = daeun(saju, gender);
    const now = new Date(Date.now() + 9 * 3600e3).getUTCFullYear();
    const birthY = saju.input.year;
    const daeunList = du.list.map((d) => {
      const r = rate(saju, fav, d.pillar);
      const fromYear = birthY + d.age - 1;
      return { ...d, ...r, fromYear, toYear: fromYear + 9, current: now >= fromYear && now <= fromYear + 9 };
    });
    const years = [now, now + 1, now + 2].map((yy) => {
      const p = S.pillar(yy - 4);
      const r = rate(saju, fav, p);
      return { year: yy, pillar: p, ...r, text: r.text.replace(/십 년/g, '한 해'), age: yy - birthY + 1,
        spouse: r.stemGroup === spouseGroup || r.branchGroup === spouseGroup, child: r.stemGroup === childGroup || r.branchGroup === childGroup };
    });
    daeunList.forEach((d) => { d.spouse = d.stemGroup === spouseGroup || d.branchGroup === spouseGroup; });

    return { pos, cnt, strength: st, fav, goodEls, missingEls, dohwa, yeokma, personality, biz, love, marry, child, daeun: du, daeunList, years, spouseGroup, childGroup };
  }

  const api = { analyze, GROUP_KO };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Analysis = api;
})(typeof self !== 'undefined' ? self : this);
