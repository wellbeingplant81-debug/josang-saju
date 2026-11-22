/* 조상님 캐릭터·오늘의 운세·띠별 운세 (재미용, AI 비용 0원)
 * 세계관: 동해 바닷가에서 평생 물일 하던 조상님들이 후손 사주를 봐 준다. 경상도 말투.
 * 건강·투자를 단정하는 말은 쓰지 않는다. */
(function (root) {
  const S = root.Saju || (typeof require !== 'undefined' ? require('./saju.js') : null);

  // 일간 10가지 = 바다친구 + 그 바다친구를 잡던 조상님
  const DAY_MASTER = [
    { name: '갑목', nick: '큰 나무', sea: '대게', emoji: '🦀', ancestor: '대게잡이 배 선장이던 고조할배', aEmoji: '👴', hi: '어이, 선장 집안 후손 왔나!', line: '한 번 정하면 끝까지 가는 직진형 리더', good: '듬직함 · 책임감 · 추진력', care: '고집이 세 보일 때가 있다. 가끔은 옆 물길도 둘러봐래이.' },
    { name: '을목', nick: '덩굴 풀', sea: '미역', emoji: '🌿', ancestor: '미역 따던 해녀 증조할매', aEmoji: '👵', hi: '아이고 우리 강아지, 할매 보러 왔나!', line: '어디서든 뿌리내리는 생활력 만렙', good: '유연함 · 눈치 · 끈기', care: '남 맞춰 주다 니 마음 잃어버린다. 니 편도 좀 들어라.' },
    { name: '병화', nick: '한낮의 해', sea: '성게', emoji: '🌞', ancestor: '성게 까서 장에 내던 고조할매', aEmoji: '👵', hi: '와, 니 들어오니 방이 다 환하네!', line: '들어오면 분위기가 환해지는 주인공', good: '밝음 · 솔직함 · 열정', care: '불붙는 만큼 식는 것도 빠르다. 마무리만 단디 하면 무적이다.' },
    { name: '정화', nick: '촛불', sea: '오징어', emoji: '🦑', ancestor: '밤마다 집어등 켜던 오징어배 증조할배', aEmoji: '👴', hi: '밤바다 불빛 따라 잘 찾아왔데이.', line: '집어등처럼 조용히 사람을 끌어당기는 타입', good: '섬세함 · 배려 · 집중력', care: '속으로 삭이는 게 많다. 말로 꺼내야 풀린데이.' },
    { name: '무토', nick: '큰 산', sea: '과메기', emoji: '🐟', ancestor: '과메기 덕장 주인 고조할배', aEmoji: '👴', hi: '바닷바람 맞고 잘 컸네, 우리 후손!', line: '바닷바람 맞을수록 깊어지는 묵직한 믿음직함', good: '포용력 · 신뢰 · 뚝심', care: '시동 걸리는 데 오래 걸린다. 시작 버튼만 누르면 된다 마.' },
    { name: '기토', nick: '기름진 밭', sea: '전복', emoji: '🐚', ancestor: '전복 물질하던 증조할매', aEmoji: '👵', hi: '살림꾼 왔나! 밥은 묵고 다니나?', line: '알뜰살뜰 사람과 돈을 키우는 살림꾼', good: '꼼꼼함 · 실속 · 돌봄', care: '걱정을 미리 당겨서 한다. 내일 걱정은 내일 해라.' },
    { name: '경금', nick: '바위·무쇠', sea: '백골뱅이', emoji: '🐌', ancestor: '골뱅이 통발 놓던 증조할배', aEmoji: '👴', hi: '껍데기 단단한 놈 왔네! 할배 닮았다.', line: '단단한 껍데기 속 의리파', good: '결단력 · 의리 · 정의감', care: '말이 직선이라 상처 줄 때 있다. 부드러운 말 한마디만 앞에 붙여라.' },
    { name: '신금', nick: '보석', sea: '진주조개', emoji: '💎', ancestor: '진주 감정하던 고조할매', aEmoji: '👵', hi: '어데 보자, 우리 집 보석 왔나!', line: '디테일에 강한 반짝반짝 완벽주의자', good: '감각 · 깔끔함 · 자존심', care: '작은 흠에 오래 맘 쓰지 마라. 진주도 흠이 있어야 진짜다.' },
    { name: '임수', nick: '큰 바다', sea: '고래', emoji: '🐋', ancestor: '먼바다 누비던 뱃사람 고조할배', aEmoji: '👴', hi: '큰물에서 놀 놈이 왔구나!', line: '스케일 크고 생각 넓은 자유로운 영혼', good: '지혜 · 포용 · 모험심', care: '하고 싶은 게 너무 많다. 하나씩 끝내고 다음 배 타라.' },
    { name: '계수', nick: '이슬비', sea: '문어', emoji: '🐙', ancestor: '문어 단지 놓던 꾀돌이 증조할매', aEmoji: '👵', hi: '머리 좋은 우리 꾀돌이 왔나!', line: '머리 좋고 감 좋은 숨은 전략가', good: '직관 · 아이디어 · 공감', care: '생각이 많아 밤이 길다. 머리맡에 메모지 두고 자라.' },
  ];

  const ELEMENT_LUCK = [
    { color: '초록', colorHex: '#3fa34d', sea: '미역·다시마', dir: '동쪽', word: '새로 시작하기' },
    { color: '빨강', colorHex: '#e5533d', sea: '성게', dir: '남쪽', word: '표현하기' },
    { color: '노랑', colorHex: '#e2a72e', sea: '과메기', dir: '가운데(집)', word: '자리 지키기' },
    { color: '흰색', colorHex: '#9aa5b1', sea: '백골뱅이', dir: '서쪽', word: '정리하기' },
    { color: '남색', colorHex: '#2c5aa0', sea: '문어·오징어', dir: '북쪽', word: '쉬어 가기' },
  ];

  // 오늘의 기운(십신)별 운세 — 조상님 말투
  const TEN_GOD_DAY = {
    비견: { base: 72, key: '내 편이 생기는 날', all: ['오늘은 니 닮은 사람이 니 편 들어준다. 혼자 낑낑대지 말고 손 내밀어라.', '둘이 노 저으면 배가 두 배로 빨리 간데이.', '오래 연락 안 한 친구 생각나제? 그거 조상이 보낸 신호다.'], money: '더치페이하면 득, 혼자 다 쏘면 지갑이 운다.', love: '친구 같은 편안함이 오늘 니 최고 매력이다.', tip: '같이 밥 묵자고 먼저 말해 봐라' },
    겁재: { base: 60, key: '경쟁심 불타는 날', all: ['탐나는 게 생기는데 서두르면 놓친다. 그물은 천천히 당기래이.', '라이벌이 니를 키워 주는 날이다. 미워하지 말고 배워라.', '니 몫은 똑 부러지게 챙겨라. 오늘은 양보가 미덕이 아이다.'], money: '충동구매 경보! 장바구니에 하루 재워 놔라.', love: '밀당 말고 직진이 통한다. 대신 말은 부드럽게.', tip: '계산은 그 자리서 깔끔하게' },
    식신: { base: 88, key: '먹을 복 터지는 날', all: ['오늘은 입이 호강하는 날이다. 맛난 거 묵으면 운이 더 열린데이.', '손대는 것마다 맛이 산다. 요리든 일이든!', '웃을 일이 많은 날, 여유 부려도 된다.'], money: '맛난 거 사 묵는 돈은 아까운 돈 아이다.', love: '맛집 데이트, 할배가 강력 추천한다.', tip: '오늘 저녁은 제철 해산물로' },
    상관: { base: 70, key: '말발이 서는 날', all: ['오늘 니 입에서 나오는 말이 다 명언이다. 발표·글쓰기 해라.', '할 말은 하되 한 번 더 다듬으면 대박 난다.', '틀 깨는 짓을 해도 칭찬받는 날이데이.'], money: '니 재주를 돈으로 바꿀 힌트가 온다. 귀 열어 놔라.', love: '재치 있는 한마디가 상대 마음을 흔든다.', tip: '보내기 전에 문자 한 번 더 읽기' },
    편재: { base: 84, key: '뜻밖의 돈 냄새 나는 날', all: ['생각도 못 한 데서 고기가 걸린다! 오늘은 움직여라.', '발이 넓어지고 새 사람이랑 연이 닿는 날이다.', '많이 돌아다닐수록 운이 커지는 날이데이.'], money: '공돈·할인·이벤트 운 좋다. 응모는 해 봐라.', love: '새로운 만남 운이 있다. 모임 나가 봐라.', tip: '오늘 들어온 제안은 일단 들어 보기' },
    정재: { base: 82, key: '차곡차곡 쌓이는 날', all: ['한 만큼 딱 돌아오는 날이다. 성실이 최고데이.', '정리정돈 하면 잃어버린 물건이 나온다.', '약속 지키면 신용 점수가 쑥 올라간다.'], money: '새는 돈 막는 날. 고정 지출 한번 훑어봐라.', love: '꾸준한 연락이 최고의 고백이다.', tip: '가계부 한 줄 쓰기' },
    편관: { base: 58, key: '버티면 레벨업 하는 날', all: ['갑자기 일이 몰려와도 당황하지 마라. 파도는 지나간다.', '부담스러운 일이 오히려 니 실력을 키워 준다.', '규칙 지키는 게 니 지키는 거다. 오늘은 원칙대로.'], money: '큰돈 결정은 내일로 미뤄라.', love: '예민해지기 쉽다. 단 거 하나 묵고 얘기해라.', tip: '오늘 할 일은 세 개로만 줄이기' },
    정관: { base: 80, key: '인정받는 날', all: ['윗사람·손님한테 칭찬 들을 일 생긴다. 어깨 펴라!', '격식 있는 자리에서 니가 빛나는 날이다.', '맡은 일 깔끔히 끝내면 평판이 쑥 오른다.'], money: '계획대로만 쓰면 걱정 없데이.', love: '진지한 얘기가 사이를 한 단계 올려 준다.', tip: '옷차림 한 끗 신경 쓰기' },
    편인: { base: 66, key: '촉이 좋아지는 날', all: ['오늘은 니 촉이 잘 맞는다. 첫 느낌을 믿어라.', '혼자 있는 시간에 좋은 생각이 떠오른다.', '새 공부·취미 시작하기 좋은 날이데이.'], money: '정보는 많이 모으고 돈은 천천히 써라.', love: '말 없는 배려가 통하는 날이다.', tip: '10분 산책하며 생각 정리' },
    정인: { base: 86, key: '도움받는 날', all: ['귀인이 나타나 막힌 데를 뚫어 준다. 조상이 다리 놔 줬다.', '배운 걸 바로 써먹는 날이다.', '부모님·선배 말 한마디가 오늘의 정답이다.'], money: '문서·계약 운 좋다. 꼼꼼히 읽고 도장 찍어라.', love: '따뜻한 말 한마디에 마음이 녹는다.', tip: '고마운 사람한테 안부 보내기' },
  };

  const BRANCH_MOD = {
    육합: { add: 10, text: '오늘은 니랑 궁합 딱 맞는 날이다. 일이 술술 풀린데이.' },
    삼합: { add: 6, text: '같은 편 기운이 들어와서 힘이 실린다.' },
    같음: { add: 3, text: '니 닮은 기운의 날, 하던 대로만 해도 된다.' },
    보통: { add: 0, text: '' },
    형: { add: -6, text: '사소한 말다툼 조심해라. 한 박자 쉬고 대답하기.' },
    자형: { add: -4, text: '니 자신을 너무 몰아붙이지 마래이.' },
    원진: { add: -5, text: '괜히 서운한 마음 든다. 오해는 그날 바로 풀어라.' },
    충: { add: -10, text: '변화가 생기는 날! 이동·약속 바뀌는 거 여유 있게 받아들여라.' },
  };

  function hash(str) { let h = 2166136261; for (const c of str) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  const pick = (arr, seed) => arr[seed % arr.length];
  const clamp = (n) => Math.max(35, Math.min(99, Math.round(n)));
  const stars = (score) => { const n = Math.max(1, Math.round(score / 20)); return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); };
  function weakestElement(count) { let min = Infinity, idx = 0; count.forEach((c, i) => { if (c < min) { min = c; idx = i; } }); return idx; }

  // 같은 기운 날이라도 사람마다 덧붙는 한마디 (사주 날 기둥·띠·날짜로 고름)
  const EXTRA = {
    money: ['오후 세 시 넘어 들어오는 연락에 돈 냄새가 난다.', '지갑 정리하다 잊은 돈 찾는다.', '충동 결제는 하룻밤 재워라.', '작은 돈 아끼다 큰돈 놓친다. 쓸 데는 써라.',
      '오늘 받은 견적은 한 번 더 깎아 봐라.', '돈 얘기는 저녁보다 아침에 해라.', '빌려준 돈 슬쩍 물어봐도 되는 날이다.', '장 볼 때 바다음식 하나 담으면 운이 붙는다.'],
    love: ['먼저 안부 묻는 쪽이 이긴다.', '오늘 짝한테 한 칭찬은 열 배로 돌아온다.', '옛 인연 소식이 들려도 흔들리지 마라.', '말보다 같이 밥 한 끼가 낫다.',
      '서운한 건 오늘 안에 풀어라.', '눈 마주치고 웃어 주면 반은 먹고 들어간다.', '혼자라면 모임에 얼굴 내밀어라, 인연은 거기 있다.', '오늘은 듣는 쪽이 돼라, 그게 사랑이다.'],
    tip: ['물 한 잔 마시고 시작해라.', '오른쪽 주머니를 비워 둬라, 복 들어올 자리다.', '현관 신발 한번 가지런히 놔라.', '창문 열고 바람 한 번 들여라.',
      '해 질 녘 바다 쪽(동쪽) 한번 바라봐라.', '오늘 처음 만나는 사람한테 웃어 줘라.', '안 쓰는 물건 하나 버려라, 묵은 기운이 나간다.', '잠들기 전 조상님께 고맙다 한마디 해라.'],
  };
  function personalDaily(saju, date) {
    const today = S.dayPillarOf(date.y, date.m, date.d);
    const god = S.tenGod(saju.dayMaster, today.stem);
    const g = TEN_GOD_DAY[god];
    const rel = S.branchRelation(saju.day.branch, today.branch);
    const mod = BRANCH_MOD[rel];
    const seed = hash(`${date.y}${date.m}${date.d}|${saju.day.hanja}|${saju.year.hanja}`);
    const score = clamp(g.base + mod.add + (seed % 9) - 4);
    const luck = ELEMENT_LUCK[weakestElement(saju.elementCount)];
    return {
      today, god, rel, score, stars: stars(score), keyword: g.key,
      all: pick(g.all, seed) + (mod.text ? ' ' + mod.text : ''),
      money: `${g.money} ${pick(EXTRA.money, seed >> 4)}`, love: `${g.love} ${pick(EXTRA.love, seed >> 7)}`, tip: `${g.tip} ${pick(EXTRA.tip, seed >> 10)}`,
      luckyColor: luck.color, luckyColorHex: luck.colorHex, luckySea: luck.sea, luckyDir: luck.dir, luckyNumber: (seed % 9) + 1,
    };
  }

  // 띠별 오늘의 운세(인스타 카드) — 조상님 한마디
  const BAND_TEXT = [
    { min: 85, lines: ['순풍에 돛 단 날! 미뤄 둔 일 오늘 해치워라.', '귀인 온다. 반가운 연락 놓치지 마래이.', '뭘 해도 되는 날, 겁내지 말고 질러라!', '조상이 밀어준다. 오늘은 니가 주인공이다.'] },
    { min: 72, lines: ['차분히 하면 결과가 따라온다.', '소소한 행운이 줄줄이 온데이.', '맛난 거 묵으면 운이 더 붙는다.', '하던 대로만 해라, 그게 정답이다.'] },
    { min: 60, lines: ['무난한 하루, 욕심만 쪼매 내려놔라.', '계획대로 가면 충분히 좋다.', '오후에 기분 좋은 소식 있을 끼다.', '급할수록 돌아가라, 할배 말 들어라.'] },
    { min: 0, lines: ['서두르면 그물 엉킨다. 한 박자 천천히!', '말 한마디 조심하면 무사통과다.', '오늘은 충전하는 날, 일찍 들어가 자라.', '남 말에 휘둘리지 마래이. 니 중심 잡아라.'] },
  ];
  function zodiacDaily(date) {
    const today = S.dayPillarOf(date.y, date.m, date.d);
    const todayEl = Math.floor(today.stem / 2);
    return S.ANIMALS.map((animal, b) => {
      const rel = S.branchRelation(b, today.branch);
      const seed = hash(`${date.y}-${date.m}-${date.d}|${b}`);
      const myEl = S.BRANCH_ELEMENT[b];
      const flow = (todayEl + 1) % 5 === myEl ? 6 : (myEl + 1) % 5 === todayEl ? 2 : (todayEl + 2) % 5 === myEl ? -4 : 0;
      const score = clamp(70 + BRANCH_MOD[rel].add + flow + (seed % 13) - 6);
      const band = BAND_TEXT.find((t) => score >= t.min);
      const luck = ELEMENT_LUCK[seed % 5];
      return { animal, branch: b, rel, score, stars: stars(score), line: pick(band.lines, seed >> 3), luckySea: luck.sea, luckyColor: luck.color };
    });
  }

  const api = { DAY_MASTER, ELEMENT_LUCK, TEN_GOD_DAY, personalDaily, zodiacDaily, weakestElement };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Fortune = api;
})(typeof self !== 'undefined' ? self : this);
