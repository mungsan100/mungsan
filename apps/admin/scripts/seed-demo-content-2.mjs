// 데모 콘텐츠 확충 시드 2차 (2026-07-20, 7단계).
// - 정책은 1차(seed-demo-data.mjs)와 동일: 순수 추가·멱등·실데이터 불변.
//   글/공고는 (작성자,제목), 댓글은 (글,작성자,내용), 좋아요는 unique 제약으로 존재 확인 후
//   없을 때만 생성하고, 캐시 카운트는 "실제 생성했을 때만" 증가시킨다.
// - 작성자는 승인된 @demo.mungsan.dev 계정만 사용(실계정 절대 미사용).
// - 라운지 22글(카테고리 11종×2) + 댓글 30+ + 좋아요 / 협업 공고 11건(업종 11종×1).
// 사용: node --env-file=.env scripts/seed-demo-content-2.mjs
import { PrismaClient } from '../../../packages/db/generated/client/index.js';
import { PrismaPg } from '@prisma/adapter-pg';

const url = new URL(process.env.DATABASE_URL);
const schema = url.searchParams.get('schema') ?? 'public';
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }, { schema }),
});

const day = 24 * 60 * 60 * 1000;
const daysFromNow = (n) => new Date(Date.now() + n * day);

// ── 라운지 글 22건 — 카테고리 11종 × 2 ─────────────────────────────────
// c: 카테고리, t: 제목, b: 본문, cm: 댓글(작성자 오프셋, 내용), lk: 좋아요 수(0~3)
const LOUNGE = [
  { c: 'COLLABORATION', t: '물류사와 공동 배송망 꾸려보실 F&B 대표님 계신가요?', b: '수도권 새벽배송을 자체로 돌리다가 비용이 감당이 안 됩니다. 물량을 합쳐서 공동 배송망을 만들면 서로 원가를 낮출 수 있을 것 같은데, 관심 있는 대표님들 의견 궁금합니다.', cm: [[1, '저희도 새벽배송 원가 때문에 골치입니다. 물량 규모가 어느 정도이신가요?'], [2, '공동 물류는 정산 규칙을 초반에 확실히 해두는 게 핵심이더라고요.']], lk: 3 },
  { c: 'COLLABORATION', t: '전시 부스를 반씩 나눠 쓸 파트너 찾습니다', b: '다음 달 산업 박람회 부스 비용이 부담돼서, 타깃 고객이 겹치지 않는 회사와 부스를 공유하면 어떨까 합니다. 상호 리드 교환도 가능할 것 같고요.', cm: [[3, '작년에 비슷하게 해봤는데 만족도 높았습니다. 부스 위치가 관건이에요.']], lk: 2 },
  { c: 'BUSINESS_CONCERN', t: '창업 3년차, 성장이 정체됐을 때 다들 어떻게 돌파하셨나요', b: '월 매출이 1년째 제자리입니다. 제품은 안정됐는데 새 고객 유입이 늘지 않네요. 가격을 내릴지, 신규 라인을 만들지, 영업을 늘릴지... 비슷한 시기를 지나오신 대표님들의 경험담이 듣고 싶습니다.', cm: [[0, '정체기엔 기존 고객 심층 인터뷰부터 다시 했습니다. 의외로 답이 안에 있더라고요.'], [1, '저는 가격 인하 대신 상위 플랜을 만들었는데 오히려 객단가가 올랐습니다.']], lk: 3 },
  { c: 'BUSINESS_CONCERN', t: '공동창업자와 지분 재조정, 경험담 부탁드립니다', b: '초기에 50:50으로 시작했는데 실제 기여도가 많이 달라졌습니다. 관계를 깨지 않고 지분을 조정한 사례가 있다면 조언 부탁드립니다.', cm: [[2, '변호사 끼고 베스팅 조건을 다시 짰습니다. 감정이 아니라 규칙으로 푸는 게 맞더라고요.']], lk: 1 },
  { c: 'INVESTMENT_FUNDING', t: '시드 IR 덱, 트랙션 없이 어디까지 설득이 될까요', b: '프리시드로 버티다가 시드 라운드 준비 중입니다. 유의미한 매출이 아직 없는데, 시장 크기와 팀 역량만으로 어디까지 설득이 가능할까요? 최근에 라운드 도신 분들 분위기가 궁금합니다.', cm: [[0, '요즘은 작더라도 유료 전환 지표를 무조건 보시더라고요. PoC라도 만드는 걸 추천합니다.'], [3, '엔젤 몇 분 먼저 태우고 기관 가는 게 요즘 정석 같습니다.']], lk: 2 },
  { c: 'INVESTMENT_FUNDING', t: '정책자금 vs 벤처대출, 뭐부터 알아보는 게 좋을까요', b: '희석 없이 자금을 조달하고 싶어서 정책자금과 벤처대출을 비교 중입니다. 각각 실제로 받아보신 분들, 심사 난이도와 소요 기간이 어땠는지 공유해 주실 수 있을까요?', cm: [[1, '정책자금은 서류가 많지만 금리가 확실히 낫습니다. 두 달은 잡고 시작하세요.']], lk: 2 },
  { c: 'DEVELOPMENT_TECH', t: '외부 개발사 결과물 인수인계, 체크리스트 공유합니다', b: '외주로 만든 서비스를 내재화하면서 고생한 경험을 정리했습니다. 1) 인프라 계정 소유권 2) 배포 파이프라인 문서 3) 시크릿 목록 4) 미해결 이슈 리스트. 이 네 가지는 계약서에 명시하는 걸 추천합니다.', cm: [[2, '시크릿 목록은 정말 공감합니다. 퇴사한 외주 개발자만 아는 키가 있어서 고생했어요.']], lk: 3 },
  { c: 'DEVELOPMENT_TECH', t: '비개발자 대표인데 CTO 없이 어디까지 갈 수 있을까요', b: '노코드와 외주로 MVP까지는 왔습니다. 다음 단계로 정식 개발이 필요한데, CTO 영입이 먼저인지 개발팀 구축이 먼저인지 고민입니다.', cm: [[0, '초기엔 풀타임 CTO보다 기술 자문 + 시니어 계약직 조합도 괜찮았습니다.']], lk: 1 },
  { c: 'MARKETING_SALES', t: 'B2B 콜드메일 회신율 7% 만든 템플릿 구조', b: '반년간 콜드메일을 돌리며 정리한 구조입니다. ① 첫 줄에 상대 회사의 최근 소식 ② 우리가 해결하는 문제 한 문장 ③ 비슷한 회사 성과 숫자 ④ 15분 통화 제안. 길게 쓸수록 회신율이 떨어졌습니다.', cm: [[3, '첫 줄 개인화가 핵심이네요. 저희도 템플릿 다시 짜봐야겠습니다.'], [1, '보내는 시간대도 영향이 크더라고요. 화·수 오전이 제일 좋았습니다.']], lk: 3 },
  { c: 'MARKETING_SALES', t: '전시회 리드, 어떻게 후속 관리하시나요', b: '박람회에서 명함 200장을 받아왔는데 후속 연락 체계가 없어 다 식어버립니다. 리드 관리 프로세스나 도구 추천 부탁드립니다.', cm: [[0, '전시 당일 저녁에 첫 메일이 나가야 합니다. 하루만 지나도 반응이 절반으로 떨어져요.']], lk: 2 },
  { c: 'GOVERNMENT_SUPPORT', t: '창업도약패키지 서류 준비 팁 (작년 선정 후기)', b: '작년에 선정됐던 경험을 공유합니다. 사업계획서는 심사 항목 순서 그대로 목차를 잡는 게 좋고, 매출 계획은 근거 수식을 각주로 달았더니 질문이 줄었습니다. 발표는 데모 영상 30초가 슬라이드 열 장보다 낫습니다.', cm: [[2, '심사 항목 순서대로 목차 잡는 건 몰랐네요. 올해 꼭 써먹겠습니다.'], [3, '가점 항목 미리 챙기는 것도 중요합니다. 특허 출원 중인 것도 인정되더라고요.']], lk: 3 },
  { c: 'GOVERNMENT_SUPPORT', t: 'R&D 과제 정산, 회계 처리 어디까지 직접 하시나요', b: '정부 R&D 과제를 처음 수행 중인데 정산 증빙이 생각보다 까다롭습니다. 전담 회계사무소를 쓰시는지, 내부에서 처리하시는지 궁금합니다.', cm: [[1, '첫 과제는 무조건 대행 추천합니다. 실격 사유를 모르는 상태로 직접 하면 위험해요.']], lk: 1 },
  { c: 'HIRING_HR', t: '초기 스타트업 첫 영업 인력, 어떤 사람을 뽑아야 할까요', b: '대표인 제가 영업을 전담해왔는데 한계가 왔습니다. 첫 영업 채용 시 대기업 출신 경력자와 스타트업 경험자 중 어느 쪽이 좋았는지, 보상 구조는 어떻게 설계하셨는지 궁금합니다.', cm: [[0, '프로세스가 없는 단계라면 스스로 만들어본 사람이 맞습니다. 대기업 출신은 지원 조직이 없으면 힘들어하더라고요.'], [2, '기본급을 낮추고 인센티브를 높이면 초기엔 좋은 사람이 안 옵니다. 반대로 가세요.']], lk: 3 },
  { c: 'HIRING_HR', t: '수습 기간 평가 기준, 문서로 만들어 두시나요', b: '수습 종료를 앞두고 평가 기준이 없어 곤란했던 적이 있습니다. 다들 수습 평가를 어떤 형식으로 운영하시는지 궁금합니다.', cm: [[3, '입사 첫 주에 90일 목표를 서면으로 합의합니다. 분쟁 예방에도 도움이 됩니다.']], lk: 2 },
  { c: 'ORG_CULTURE', t: '10명 넘어가니 소통이 갑자기 어려워졌습니다', b: '전원이 한 방에 앉던 시절엔 회의가 필요 없었는데, 10명을 넘기니 정보가 새기 시작합니다. 주간 전체 회의를 만들었는데 형식적이 된 느낌이고요. 이 시기를 지나오신 대표님들은 어떻게 하셨나요?', cm: [[1, '주간 회의는 공유가 아니라 결정만 하는 자리로 바꾸고, 공유는 문서로 옮겼더니 나아졌습니다.'], [0, '10명 근처가 제일 어렵습니다. 파트 리드 두 명만 세워도 숨통이 트여요.']], lk: 3 },
  { c: 'ORG_CULTURE', t: '재택과 출근, 하이브리드 규칙 어떻게 정하셨나요', b: '자율 재택을 운영 중인데 협업 밀도가 떨어지는 게 느껴집니다. 주 2일 출근 같은 규칙을 만들자니 반발이 걱정이고요. 하이브리드 규칙을 정착시킨 경험담 부탁드립니다.', cm: [[2, '요일을 회사가 정하지 말고 팀별로 코어데이를 고르게 했더니 수용도가 높았습니다.']], lk: 1 },
  { c: 'OUTSOURCING', t: '디자인 외주, 에이전시와 프리랜서 비용 차이만큼 결과도 다를까요', b: '브랜드 리뉴얼을 앞두고 에이전시 견적(3천만원대)과 프리랜서 견적(800만원대)을 받았습니다. 실제 결과물 차이를 경험해보신 분들의 이야기가 궁금합니다.', cm: [[3, '관리 리소스를 우리가 쓸 수 있으면 프리랜서, 없으면 에이전시입니다. 결국 PM 비용이에요.'], [0, '중간 산출물 검수 일정을 계약서에 박아두면 프리랜서도 충분히 안정적입니다.']], lk: 2 },
  { c: 'OUTSOURCING', t: 'CS 아웃소싱 써보신 분, 품질 관리 어떻게 하시나요', b: '문의량이 늘어 CS 외주를 검토 중입니다. 브랜드 톤이 무너질까 걱정인데, 아웃소싱 품질을 유지하는 노하우가 있을까요?', cm: [[1, '초기 두 달은 모든 답변을 우리가 검수했습니다. 그 뒤로 FAQ 스크립트가 쌓이니 안정되더라고요.']], lk: 1 },
  { c: 'BURNOUT_MENTAL', t: '대표의 번아웃, 다들 어떻게 버티고 계신가요', b: '3년을 쉼 없이 달렸더니 아침에 일어나는 게 두렵습니다. 직원들 앞에서는 티를 낼 수 없고, 가족에게도 걱정 끼치기 싫어 혼자 삭이게 되네요. 비슷한 시기를 겪으신 대표님들은 어떻게 회복하셨는지 궁금합니다.', cm: [[2, '대표 모임에서 솔직하게 털어놓는 것만으로도 절반은 회복됐습니다. 혼자 버티지 마세요.'], [3, '주 1회 반나절은 회사 생각을 끊는 시간을 강제로 만들었습니다. 처음엔 불안했는데 오히려 판단이 맑아졌어요.'], [1, '전문 상담 받는 대표님들 생각보다 많습니다. 저도 그중 하나고요.']], lk: 3 },
  { c: 'BURNOUT_MENTAL', t: '중요한 결정 앞에서 잠이 안 올 때 루틴이 있으신가요', b: '큰 계약이나 채용 결정을 앞두면 며칠씩 잠을 설칩니다. 결정의 무게를 다루는 각자의 루틴이 있다면 공유해 주세요.', cm: [[0, '최악의 시나리오를 종이에 끝까지 써보면 오히려 별거 아니게 느껴질 때가 많습니다.']], lk: 2 },
  { c: 'ETC', t: '법인카드 지출 규정, 몇 명부터 만드셨나요', b: '지금은 제가 다 승인하는데 팀이 커지니 병목이 됩니다. 지출 규정을 도입한 시점과 실무 팁이 궁금합니다.', cm: [[1, '한도별 자동 승인 규칙만 만들어도 대표 승인 건수가 80% 줄었습니다.']], lk: 1 },
  { c: 'ETC', t: '사무실 이전 시 챙겨야 할 것 총정리 (경험담)', b: '최근 이전을 마치고 정리합니다. 1) 등기·사업자 주소 변경 순서 2) 인터넷 회선은 한 달 전 신청 3) 우편물 전송 서비스 4) 직원 통근 변화 사전 조사. 특히 4번을 놓치면 퇴사 리스크가 생깁니다.', cm: [[2, '통근 조사 공감합니다. 이전 후 두 명이 흔들렸던 경험이 있어요.']], lk: 2 },
];

// ── 협업 공고 11건 — 업종 11종 × 1 ────────────────────────────────────
const COLLAB = [
  { ind: '제조', t: '스마트팩토리 센서 데이터 분석 파트너를 찾습니다', d: '공장 설비에 센서는 깔았는데 데이터를 활용하지 못하고 있습니다. 이상 감지와 예지보전 모델을 함께 만들 데이터 분석 역량을 가진 팀을 찾습니다. 현장 데이터 접근과 도메인 지식은 저희가 제공합니다.', region: '경기', budget: [30000, 60000], deadline: 21, pt: ['데이터 분석사', 'AI 솔루션사'] },
  { ind: 'IT·소프트웨어', t: '자사 SaaS와 연동할 결제·정산 모듈 공동 개발', d: 'B2B 구독 SaaS를 운영 중입니다. 파트너사 정산 기능을 붙여야 하는데 결제 도메인 경험이 있는 개발사와 공동 개발 또는 모듈 제휴를 원합니다. API 스펙은 정리돼 있습니다.', region: '서울', budget: [20000, 40000], deadline: 14, pt: ['핀테크 개발사'] },
  { ind: '금융·핀테크', t: '소상공인 대출 비교 서비스, 제휴 금융사·데이터사 모집', d: '소상공인 대상 대출 비교 플랫폼을 준비 중입니다. 매출 데이터 스크래핑 또는 신용평가 모델을 보유한 회사, 그리고 입점 의향이 있는 2금융권 파트너를 찾습니다.', region: '서울', budget: null, deadline: 30, pt: ['신용평가사', '데이터 제공사'] },
  { ind: '의료·헬스케어·바이오', t: '만성질환 관리 앱, 임상 자문 및 콘텐츠 감수 파트너', d: '당뇨 관리 앱의 식단·운동 콘텐츠를 의학적으로 감수해 줄 의료 전문 파트너를 찾습니다. 장기적으로는 병원 연계 실증도 함께 하고 싶습니다.', region: '무관', budget: [5000, 15000], deadline: 28, pt: ['의료 자문', '임상시험 기관'] },
  { ind: '도소매·유통', t: '지역 특산물 공동 소싱·PB 상품 개발 파트너', d: '온라인 식품 유통을 하고 있습니다. 지역 특산물을 함께 소싱해 PB 상품으로 개발할 생산자 또는 가공 파트너를 찾습니다. 판로와 마케팅은 저희가 책임집니다.', region: '전국', budget: [10000, 30000], deadline: 25, pt: ['식품 제조사', '농수산 생산자'] },
  { ind: '물류·운송', t: '수도권 새벽배송 라스트마일 공동 운영', d: '자체 새벽배송망의 유휴 캐파가 있습니다. 물량을 합쳐 단가를 낮출 화주사, 또는 권역을 나눠 맡을 배송 파트너를 모집합니다.', region: '수도권', budget: null, deadline: 18, pt: ['화주사', '배송대행사'] },
  { ind: '식음료·외식', t: '프랜차이즈 밀키트화, 함께할 식품 제조 파트너', d: '직영 3호점까지 검증된 메뉴를 밀키트로 만들려 합니다. HACCP 시설을 보유한 제조 파트너와 레시피 상품화를 함께하고 싶습니다. 수익 셰어 구조도 열려 있습니다.', region: '충청', budget: [20000, 50000], deadline: 35, pt: ['HACCP 제조사'] },
  { ind: '건설·부동산', t: '중소 현장용 안전관리 솔루션 실증 현장 제공', d: '건설 현장 안전관리 SaaS의 실증 현장을 제공할 수 있습니다. 반대로 저희 현장의 디지털 전환을 도울 솔루션사를 찾는 것이기도 합니다. 상호 윈윈 구조를 제안합니다.', region: '부산', budget: null, deadline: 40, pt: ['건설테크 솔루션사'] },
  { ind: '전문서비스', t: '스타트업 대상 노무·법무 패키지 공동 상품화', d: '회계법인으로서 스타트업 고객이 많습니다. 노무·법무 파트너와 묶음 상품을 만들어 상호 고객을 교차 소개하는 구조를 만들고 싶습니다.', region: '서울', budget: null, deadline: 30, pt: ['노무법인', '법률사무소'] },
  { ind: '교육', t: '직무교육 콘텐츠, 기업 고객사에 함께 공급할 파트너', d: '실무자 대상 온라인 강의 라이브러리를 보유하고 있습니다. B2B 영업망을 가진 HR 솔루션사와 번들 공급 제휴를 원합니다. 콘텐츠 커스터마이징 가능합니다.', region: '무관', budget: [5000, 20000], deadline: 22, pt: ['HR 솔루션사', 'B2B 영업사'] },
  { ind: '미디어·콘텐츠·광고', t: '버티컬 커머스 브랜드 전속 콘텐츠 제작 파트너십', d: '월 30편 이상 숏폼을 소화할 수 있는 제작사입니다. 성장 중인 커머스 브랜드와 성과 연동형 전속 계약을 맺고 싶습니다. 포트폴리오 보유, 스튜디오 자체 운영.', region: '서울', budget: [10000, 25000], deadline: 15, pt: ['커머스 브랜드사'] },
];

// ── 실행 ──────────────────────────────────────────────────────────────
const authors = await prisma.user.findMany({
  where: { email: { endsWith: '@demo.mungsan.dev' }, approvedAt: { not: null }, withdrawnAt: null },
  orderBy: { email: 'asc' },
  select: { id: true, email: true },
});
if (authors.length < 2) throw new Error('승인된 데모 계정이 부족합니다');
const industries = await prisma.industry.findMany({ select: { id: true, name: true } });
const indByName = new Map(industries.map((i) => [i.name, i.id]));

let created = { posts: 0, comments: 0, likes: 0, collabs: 0 };

// 라운지 글·댓글·좋아요
for (const [i, post] of LOUNGE.entries()) {
  const author = authors[i % authors.length];
  let row = await prisma.loungePost.findFirst({ where: { authorId: author.id, title: post.t }, select: { id: true } });
  if (!row) {
    row = await prisma.loungePost.create({
      data: { title: post.t, content: post.b, category: post.c, authorId: author.id, createdAt: daysFromNow(-(i % 14) - 1) },
      select: { id: true },
    });
    created.posts++;
  }
  for (const [offset, content] of post.cm) {
    const commenter = authors[(i + offset + 1) % authors.length];
    const exists = await prisma.loungeComment.findFirst({ where: { postId: row.id, authorId: commenter.id, content }, select: { id: true } });
    if (!exists) {
      await prisma.$transaction([
        prisma.loungeComment.create({ data: { postId: row.id, authorId: commenter.id, content } }),
        prisma.loungePost.update({ where: { id: row.id }, data: { commentCount: { increment: 1 } } }),
      ]);
      created.comments++;
    }
  }
  for (let l = 0; l < post.lk; l++) {
    const liker = authors[(i + l + 1) % authors.length];
    if (liker.id === author.id) continue;
    const exists = await prisma.loungePostLike.findFirst({ where: { postId: row.id, userId: liker.id }, select: { id: true } });
    if (!exists) {
      await prisma.$transaction([
        prisma.loungePostLike.create({ data: { postId: row.id, userId: liker.id } }),
        prisma.loungePost.update({ where: { id: row.id }, data: { likeCount: { increment: 1 } } }),
      ]);
      created.likes++;
    }
  }
}

// 협업 공고
for (const [i, c] of COLLAB.entries()) {
  const author = authors[i % authors.length];
  const exists = await prisma.collaborationPost.findFirst({ where: { authorId: author.id, title: c.t }, select: { id: true } });
  if (exists) continue;
  const industryId = indByName.get(c.ind);
  await prisma.collaborationPost.create({
    data: {
      title: c.t,
      description: c.d,
      isPublic: true,
      region: c.region === '무관' ? null : c.region,
      minBudgetInCheonwon: c.budget?.[0] ?? null,
      maxBudgetInCheonwon: c.budget?.[1] ?? null,
      applicationDeadline: daysFromNow(c.deadline),
      requiredSkillIds: [],
      industryTagIds: industryId ? [industryId] : [],
      partnerTypes: c.pt,
      authorId: author.id,
      createdAt: daysFromNow(-(i % 10) - 1),
    },
  });
  created.collabs++;
}

console.log('created:', JSON.stringify(created));
const totals = {
  loungePosts: await prisma.loungePost.count({ where: { deletedAt: null, hiddenAt: null } }),
  collabPosts: await prisma.collaborationPost.count({ where: { isPublic: true, deletedAt: null, hiddenAt: null } }),
};
console.log('totals:', JSON.stringify(totals));
await prisma.$disconnect();
