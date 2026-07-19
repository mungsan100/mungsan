// 시연용 데모 데이터 확충 시드 (2026-07-19, 지원사업 심사 MVP).
// - 순수 추가만 한다: 기존 데모 6곳·실계정·기존 글/공고/프로젝트는 일절 수정·삭제하지 않는다.
// - 멱등: 유저는 email, 글/공고는 (작성자, 제목), 댓글은 (글, 작성자, 내용), 좋아요·제안은
//   unique 제약으로 존재 확인 후 없을 때만 생성한다. 캐시 카운트(likeCount 등)는 항목을
//   "실제 생성했을 때만" 증가시켜 재실행해도 이중 증가가 없다.
// - 식별: 신규 데모 계정은 전용 이메일 도메인 @demo.mungsan.dev 를 쓴다(일괄 구분·정리용).
//   신규 데모 계정 공통 비밀번호: mungsan-demo-2026!
//
// 사용: node --env-file=.env scripts/seed-demo-data.mjs
import { scryptSync, randomBytes } from 'node:crypto';
import { PrismaClient } from '../../../packages/db/generated/client/index.js';
import { PrismaPg } from '@prisma/adapter-pg';

const url = new URL(process.env.DATABASE_URL);
const schema = url.searchParams.get('schema') ?? 'public';
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }, { schema }),
});

const DEMO_PASSWORD = 'mungsan-demo-2026!';
const now = Date.now();
const day = 24 * 60 * 60 * 1000;
const daysFromNow = (n) => new Date(now + n * day);

function hashPassword(plain) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(plain, salt, 64).toString('hex')}`;
}

// 제안 message 전문 합성 — service 의 composeProposalMessage 형식과 동일하게 유지할 것.
const PROPOSAL_LABELS = {
  introduction: '자기소개',
  interestReason: '관심 이유',
  contributionCapability: '기여 가능 역량',
  collaborationMethod: '협업 가능 방식',
  meetingAvailability: '미팅 가능 일정',
  contributionRole: '기여 역할',
};
function composeMessage(fields) {
  return Object.keys(PROPOSAL_LABELS)
    .filter((key) => fields[key])
    .map((key) => `[${PROPOSAL_LABELS[key]}]\n${fields[key]}`)
    .join('\n\n');
}

const created = { users: 0, loungePosts: 0, comments: 0, likes: 0, collabPosts: 0, proposals: 0, projects: 0 };

// ── 업종 id 조회 ──────────────────────────────────────────────────────────
const industries = await prisma.industry.findMany({ select: { id: true, name: true } });
const industryId = (name) => {
  const found = industries.find((i) => i.name === name);
  if (!found) throw new Error(`업종 없음: ${name} — update-industries.mjs 먼저 실행`);
  return found.id;
};

// ── 1. 신규 데모 회사 4곳 (업종 커버 확대) ─────────────────────────────────
const NEW_COMPANIES = [
  { email: 'urbantable@demo.mungsan.dev', name: '김나연', role: 'CEO', phone: '010-0000-0101', company: '어반테이블', brn: '9998100101', industry: '식음료·외식', nickname: '미식창업가K' },
  { email: 'spacebuild@demo.mungsan.dev', name: '오성민', role: 'CEO', phone: '010-0000-0102', company: '스페이스빌드', brn: '9998100102', industry: '건설·부동산', nickname: '공간개척자O' },
  { email: 'bridgepartners@demo.mungsan.dev', name: '유지혜', role: 'CEO', phone: '010-0000-0103', company: '브릿지파트너스', brn: '9998100103', industry: '전문서비스', nickname: '전략컨설턴트Y' },
  { email: 'creativewave@demo.mungsan.dev', name: '서준호', role: 'CMO', phone: '010-0000-0104', company: '크리에이티브웨이브', brn: '9998100104', industry: '미디어·콘텐츠·광고', nickname: '콘텐츠디렉터S' },
];

for (const spec of NEW_COMPANIES) {
  const existing = await prisma.user.findUnique({ where: { email: spec.email }, select: { id: true } });
  if (existing) continue;
  await prisma.user.create({
    data: {
      email: spec.email,
      passwordHash: hashPassword(DEMO_PASSWORD),
      name: spec.name,
      phone: spec.phone,
      executiveRole: spec.role,
      approvedAt: new Date(),
      company: { create: { name: spec.company, businessRegistrationNo: spec.brn, industryId: industryId(spec.industry) } },
      loungeProfile: { create: { nickname: spec.nickname } },
      consents: {
        createMany: {
          data: [
            { type: 'TERMS', version: '2026-07-18' },
            { type: 'PRIVACY', version: '2026-07-18' },
          ],
        },
      },
    },
  });
  created.users += 1;
}

// 데모 유저 id 맵 (기존 6 + 신규 4)
const DEMO_EMAILS = [
  'me@mungsan.dev', 'coo@commerceco.dev', 'cto@healthai.dev', 'ceo@payflow.dev',
  'cmo@makers.dev', 'founder@smartcargo.dev',
  ...NEW_COMPANIES.map((c) => c.email),
];
const demoUsers = await prisma.user.findMany({ where: { email: { in: DEMO_EMAILS } }, select: { id: true, email: true } });
const uid = (email) => {
  const found = demoUsers.find((u) => u.email === email);
  if (!found) throw new Error(`데모 유저 없음: ${email}`);
  return found.id;
};

// ── 2. 라운지 글 8개 + 댓글 + 좋아요 ──────────────────────────────────────
// likers/댓글 작성자는 글쓴이와 다른 데모 계정으로 분산. 캐시 카운트는 생성분만큼만 증가.
const LOUNGE_POSTS = [
  {
    by: 'ceo@payflow.dev', category: 'INVESTMENT_FUNDING',
    title: '시리즈A 앞두고 브릿지 라운드, 다들 어떻게 버티셨나요?',
    content: '본계약까지 6개월 남았는데 런웨이가 아슬아슬합니다. 기존 투자사 브릿지로 갈지, 매출채권 담보 대출로 버틸지 고민이네요. 비슷한 시기를 지나오신 대표님들 경험이 궁금합니다.',
    comments: [
      { by: 'bridgepartners@demo.mungsan.dev', content: '브릿지는 기존 투자사 리드가 제일 깔끔했습니다. 신규 투자사 소개받으면 실사만 두 달 갑니다.' },
      { by: 'me@mungsan.dev', content: '저희는 정책자금(창업성장자금)으로 버텼어요. 금리가 낮아서 후회 없는 선택이었습니다.' },
    ],
    likers: ['me@mungsan.dev', 'coo@commerceco.dev', 'bridgepartners@demo.mungsan.dev', 'urbantable@demo.mungsan.dev', 'cmo@makers.dev'],
  },
  {
    by: 'urbantable@demo.mungsan.dev', category: 'BUSINESS_CONCERN',
    title: '초기 멤버 채용, 연봉보다 지분이 통할까요?',
    content: '외식업 기반이라 개발자 채용이 특히 어렵습니다. 시장 연봉을 못 맞추는 대신 스톡옵션을 두껍게 제시하려는데, 요즘 분위기에 이게 먹히는지 모르겠네요. 지분 설계 기준도 궁금합니다.',
    comments: [
      { by: 'me@mungsan.dev', content: '요즘은 옵션만으로는 어렵고, 연봉 80% + 옵션이 현실적인 하한선 같습니다.' },
      { by: 'creativewave@demo.mungsan.dev', content: '초기 3명까지는 옵션보다 "권한과 성장"이 더 통했습니다. 채용 공고에 역할 범위를 크게 쓰세요.' },
      { by: 'ceo@payflow.dev', content: '행사가·베스팅 조건을 처음부터 문서로 정리해 두시면 나중에 분쟁이 없습니다.' },
    ],
    likers: ['ceo@payflow.dev', 'creativewave@demo.mungsan.dev', 'me@mungsan.dev', 'spacebuild@demo.mungsan.dev'],
  },
  {
    by: 'bridgepartners@demo.mungsan.dev', category: 'GOVERNMENT_SUPPORT',
    title: '팁스(TIPS) 추천사 받는 경로, 실제로 해보고 정리합니다',
    content: '운영사 콜드메일 30곳 → 미팅 4곳 → 추천 1곳으로 마무리했습니다. 결론은 운영사 포트폴리오와 우리 아이템의 결이 맞는 곳만 두드리는 게 시간을 아낍니다. 질문 주시면 아는 만큼 답변드릴게요.',
    comments: [
      { by: 'cto@healthai.dev', content: '운영사 미팅에서 기술 검증 질문 수준이 어느 정도였는지 궁금합니다.' },
      { by: 'urbantable@demo.mungsan.dev', content: '저장했습니다. 비수도권 운영사 반응도 궁금하네요.' },
    ],
    likers: ['cto@healthai.dev', 'urbantable@demo.mungsan.dev', 'me@mungsan.dev', 'founder@smartcargo.dev', 'coo@commerceco.dev', 'ceo@payflow.dev'],
  },
  {
    by: 'creativewave@demo.mungsan.dev', category: 'ETC',
    title: '주 1회 재택, 10명 이하 팀에도 괜찮을까요?',
    content: '제작 일정이 빡빡한 업이라 대면을 고수해 왔는데, 채용 경쟁력 때문에 주 1회 재택을 검토 중입니다. 초기 팀에서 운영해 보신 분들의 장단이 궁금합니다.',
    comments: [
      { by: 'coo@commerceco.dev', content: '저희는 수요일 고정 재택으로 1년째인데, 미팅을 그날 몰아넣으니 오히려 집중이 좋아졌습니다.' },
    ],
    likers: ['coo@commerceco.dev', 'bridgepartners@demo.mungsan.dev', 'me@mungsan.dev'],
  },
  {
    by: 'urbantable@demo.mungsan.dev', category: 'COLLABORATION',
    title: 'F&B 프랜차이즈 × 콜드체인 물류 협업 사례 있으실까요?',
    content: '가맹점 확장 단계에서 신선식품 배송 품질이 병목입니다. 콜드체인 물류사와 공동 시범사업 형태로 풀어보신 사례가 있다면 구조(비용 분담·데이터 공유)를 여쭙고 싶습니다.',
    comments: [
      { by: 'founder@smartcargo.dev', content: '저희가 딱 그 모델을 준비 중입니다. 협업 마켓에 공고 올려두었으니 제안 주세요!' },
      { by: 'cmo@makers.dev', content: '시범사업은 정산 기준을 초기에 문서화하는 게 핵심이었습니다.' },
    ],
    likers: ['founder@smartcargo.dev', 'cmo@makers.dev', 'me@mungsan.dev', 'creativewave@demo.mungsan.dev'],
  },
  {
    by: 'creativewave@demo.mungsan.dev', category: 'MARKETING_SALES',
    title: '퍼포먼스 광고 단가, 올해 들어 체감 얼마나 오르셨나요?',
    content: 'B2B 리드 확보 기준 CPL이 작년 대비 40% 올랐습니다. 채널 믹스를 콘텐츠·웨비나 쪽으로 옮기는 중인데, 다른 대표님들 요즘 어떤 채널이 효율 나오시는지 궁금합니다.',
    comments: [
      { by: 'me@mungsan.dev', content: '저희는 파트너사 공동 웨비나가 CPL 절반이었습니다. 준비는 힘들지만 리드 질이 다릅니다.' },
      { by: 'coo@commerceco.dev', content: '뉴스레터 스폰서십이 의외로 효율 좋았어요. 니치 매체 추천합니다.' },
    ],
    likers: ['me@mungsan.dev', 'coo@commerceco.dev', 'urbantable@demo.mungsan.dev', 'ceo@payflow.dev', 'spacebuild@demo.mungsan.dev'],
  },
  {
    by: 'me@mungsan.dev', category: 'DEVELOPMENT_TECH',
    title: 'MVP 외주 vs 인하우스, 6개월 써보고 내린 결론',
    content: '초기 MVP는 외주로 8주 만에 냈고, PMF 검증 후 인하우스로 전환했습니다. 결론: 검증 전엔 외주가 빠르지만, 전환 시점에 코드 인수인계 조건을 계약서에 못 박아두는 게 전부였습니다.',
    comments: [
      { by: 'spacebuild@demo.mungsan.dev', content: '인수인계 조건 구체적으로 어떤 항목을 넣으셨는지 궁금합니다.' },
      { by: 'cto@healthai.dev', content: '문서화 수준(아키텍처 다이어그램·배포 절차)까지 명시하는 걸 추천합니다.' },
    ],
    likers: ['spacebuild@demo.mungsan.dev', 'cto@healthai.dev', 'bridgepartners@demo.mungsan.dev', 'creativewave@demo.mungsan.dev'],
  },
  {
    by: 'spacebuild@demo.mungsan.dev', category: 'ETC',
    title: '대표 번아웃, 다들 어떻게 관리하세요?',
    content: '현장·계약·자금을 혼자 돌리다 보니 최근 판단력이 떨어지는 게 느껴집니다. 대표들끼리의 정기 모임이나 코칭 등 실제로 효과 본 방법이 있다면 공유 부탁드립니다.',
    comments: [
      { by: 'urbantable@demo.mungsan.dev', content: '월 1회 대표 모임에서 숫자 공유만 해도 훨씬 가벼워집니다. 라운지에서 모임 만들어봐도 좋겠네요.' },
      { by: 'ceo@payflow.dev', content: '주간 운동 루틴을 캘린더에 회의처럼 박아두는 게 저는 제일 효과 있었습니다.' },
    ],
    likers: ['urbantable@demo.mungsan.dev', 'ceo@payflow.dev', 'me@mungsan.dev', 'coo@commerceco.dev', 'creativewave@demo.mungsan.dev'],
  },
];

for (const spec of LOUNGE_POSTS) {
  const authorId = uid(spec.by);
  let post = await prisma.loungePost.findFirst({ where: { authorId, title: spec.title }, select: { id: true } });
  if (!post) {
    post = await prisma.loungePost.create({
      data: {
        title: spec.title, content: spec.content, category: spec.category, authorId,
        viewCount: 0, likeCount: 0, commentCount: 0, bookmarkCount: 0,
      },
      select: { id: true },
    });
    created.loungePosts += 1;
  }
  for (const comment of spec.comments) {
    const commentAuthorId = uid(comment.by);
    const exists = await prisma.loungeComment.findFirst({
      where: { postId: post.id, authorId: commentAuthorId, content: comment.content },
      select: { id: true },
    });
    if (exists) continue;
    await prisma.$transaction([
      prisma.loungeComment.create({ data: { postId: post.id, authorId: commentAuthorId, content: comment.content, likeCount: 0 } }),
      prisma.loungePost.update({ where: { id: post.id }, data: { commentCount: { increment: 1 } } }),
    ]);
    created.comments += 1;
  }
  for (const liker of spec.likers) {
    const userId = uid(liker);
    const exists = await prisma.loungePostLike.findUnique({
      where: { postId_userId: { postId: post.id, userId } },
      select: { id: true },
    });
    if (exists) continue;
    await prisma.$transaction([
      prisma.loungePostLike.create({ data: { postId: post.id, userId } }),
      prisma.loungePost.update({ where: { id: post.id }, data: { likeCount: { increment: 1 } } }),
    ]);
    created.likes += 1;
  }
}

// ── 3. 협업 공고 6개 (마감일 미래 분산 + 파트너사 유형) + 구조화 제안 ────────
const COLLAB_POSTS = [
  {
    by: 'urbantable@demo.mungsan.dev', title: '프랜차이즈 가맹점 공급망(SCM) 시스템 구축 파트너 모집',
    description: '직영 12개·가맹 30개 매장의 발주·재고·정산을 한 화면에서 관리할 SCM 시스템을 함께 구축할 파트너를 찾습니다. 1차는 발주·재고 모듈, 2차는 정산 자동화까지 단계적으로 진행합니다.',
    partnerTypes: ['SI 구축사', '물류 IT 개발사'], industryTags: ['IT·소프트웨어', '물류·운송'],
    minBudget: 30000, maxBudget: 60000, region: '서울', method: '위탁 개발 + 공동 운영', deadlineDays: 14,
  },
  {
    by: 'urbantable@demo.mungsan.dev', title: '신메뉴 런칭 브랜드 캠페인 공동 기획 파트너',
    description: '가을 신메뉴 라인업 런칭에 맞춰 숏폼 중심 브랜드 캠페인을 함께 기획·제작할 파트너를 찾습니다. 매장 촬영 협조와 메뉴 개발 비하인드 콘텐츠 소스를 제공합니다.',
    partnerTypes: ['광고대행사', '콘텐츠 제작사'], industryTags: ['미디어·콘텐츠·광고'],
    minBudget: 10000, maxBudget: 20000, region: '서울', method: '공동 기획', deadlineDays: 7,
  },
  {
    by: 'spacebuild@demo.mungsan.dev', title: '공유오피스 스마트 출입·에너지 관리 IoT 구축 협업',
    description: '운영 중인 공유오피스 3개 지점에 스마트 출입과 에너지 사용량 모니터링을 도입합니다. 하드웨어 설치부터 관제 대시보드까지 턴키로 진행할 파트너, 또는 영역별 컨소시엄 제안도 환영합니다.',
    partnerTypes: ['IoT 개발사', '보안 솔루션사'], industryTags: ['IT·소프트웨어', '건설·부동산'],
    minBudget: 50000, maxBudget: 90000, region: '경기', method: '턴키 위탁 또는 컨소시엄', deadlineDays: 25,
  },
  {
    by: 'bridgepartners@demo.mungsan.dev', title: '중소기업 정부지원사업 컨설팅 제휴 파트너 (지역·교육)',
    description: '정부지원사업 신청 컨설팅을 지역 거점과 교육 프로그램으로 확장합니다. 지역 창업지원기관 네트워크를 보유한 파트너, 실무 교육 커리큘럼을 함께 만들 교육 운영사를 찾습니다.',
    partnerTypes: ['교육 운영사', '지역 파트너'], industryTags: ['교육', '전문서비스'],
    minBudget: null, maxBudget: null, region: '전국', method: '제휴(수익 셰어)', deadlineDays: 33,
  },
  {
    by: 'creativewave@demo.mungsan.dev', title: 'B2B 세일즈 영상 콘텐츠 공동 제작 파트너',
    description: 'SaaS·제조 분야 B2B 기업의 세일즈 영상(제품 데모·고객 사례)을 패키지로 공동 제작할 파트너를 찾습니다. 저희는 기획·촬영을, 파트너는 모션그래픽·번역 납품을 맡는 분업 구조를 생각하고 있습니다.',
    partnerTypes: ['영상 제작사', 'B2B 영업사'], industryTags: ['미디어·콘텐츠·광고', 'IT·소프트웨어'],
    minBudget: 8000, maxBudget: 15000, region: '서울', method: '공동 제작(분업)', deadlineDays: 18,
  },
  {
    by: 'founder@smartcargo.dev', title: '콜드체인 신선식품 배송 시범사업 파트너 (F&B)',
    description: '수도권 콜드체인 라스트마일 인프라를 활용해 신선식품 정기 배송 시범사업을 함께할 F&B 파트너를 찾습니다. 3개월 시범 운영 후 데이터 기반으로 정식 계약 여부를 결정합니다.',
    partnerTypes: ['식음료 제조사', '프랜차이즈 본사'], industryTags: ['식음료·외식', '물류·운송'],
    minBudget: 20000, maxBudget: 40000, region: '수도권', method: '공동 시범사업', deadlineDays: 45,
  },
];

const collabPostIds = new Map();
for (const spec of COLLAB_POSTS) {
  const authorId = uid(spec.by);
  let post = await prisma.collaborationPost.findFirst({ where: { authorId, title: spec.title }, select: { id: true } });
  if (!post) {
    post = await prisma.collaborationPost.create({
      data: {
        title: spec.title, description: spec.description, authorId, isPublic: true,
        minBudgetInCheonwon: spec.minBudget, maxBudgetInCheonwon: spec.maxBudget,
        region: spec.region, collaborationMethod: spec.method,
        applicationDeadline: daysFromNow(spec.deadlineDays),
        requiredSkillIds: [], industryTagIds: spec.industryTags.map(industryId), partnerTypes: spec.partnerTypes,
        viewCount: 0, proposalCount: 0, bookmarkCount: 0,
      },
      select: { id: true },
    });
    created.collabPosts += 1;
  }
  collabPostIds.set(spec.title, post.id);
}

const PROPOSALS = [
  {
    postTitle: '프랜차이즈 가맹점 공급망(SCM) 시스템 구축 파트너 모집', by: 'me@mungsan.dev',
    fields: {
      introduction: 'B2B SaaS를 만드는 테크브릿지입니다. 유통·리테일 도메인의 재고 연동 API를 3년째 운영하고 있습니다.',
      interestReason: '가맹점 발주·재고 데이터는 저희가 이미 다뤄본 구조라, 초기 설계 리스크를 크게 줄여드릴 수 있다고 판단했습니다.',
      contributionCapability: '발주·재고 모듈 설계와 POS 연동 개발, 운영 대시보드 구축까지 자체 인력으로 가능합니다.',
      collaborationMethod: '1차 모듈 위탁 개발 후 성과 기준으로 2차 정산 자동화 공동 개발을 제안합니다.',
      meetingAvailability: '다음 주 화·목 오후 가능합니다.',
      contributionRole: 'SCM 시스템 설계·개발',
    },
  },
  {
    postTitle: '콜드체인 신선식품 배송 시범사업 파트너 (F&B)', by: 'urbantable@demo.mungsan.dev',
    fields: {
      introduction: '직영·가맹 40여 개 매장을 운영하는 F&B 기업 어반테이블입니다. 신선 식자재 당일 배송이 확장의 최우선 과제입니다.',
      interestReason: '콜드체인 라스트마일을 자체 구축하기엔 비용이 커서, 시범사업으로 검증 후 확장하는 구조가 저희 로드맵과 정확히 맞습니다.',
      contributionCapability: '수도권 22개 매장의 실주문 물량과 매장별 수요 데이터를 시범 운영에 제공할 수 있습니다.',
      collaborationMethod: '3개월 시범 후 물량 연동 정식 계약을 희망합니다.',
      meetingAvailability: '이번 주 금요일 오전 또는 다음 주 월요일 종일 가능합니다.',
      contributionRole: 'F&B 물량·수요 데이터 제공',
    },
  },
];

for (const spec of PROPOSALS) {
  const postId = collabPostIds.get(spec.postTitle);
  const proposerId = uid(spec.by);
  const exists = await prisma.collaborationProposal.findFirst({ where: { postId, proposerId }, select: { id: true } });
  if (exists) continue;
  await prisma.$transaction([
    prisma.collaborationProposal.create({
      data: {
        postId, proposerId, status: 'SUBMITTED',
        message: composeMessage(spec.fields),
        ...spec.fields,
      },
    }),
    prisma.collaborationPost.update({ where: { id: postId }, data: { proposalCount: { increment: 1 } } }),
  ]);
  created.proposals += 1;
}

// ── 4. 셰르파 샘플 (어반테이블) — 프로젝트 + 마일스톤 2 + 할일 5 ────────────
const sherpaOwnerId = uid('urbantable@demo.mungsan.dev');
const PROJECT_TITLE = '어반테이블 × 스마트카고 콜드체인 시범';
let project = await prisma.project.findFirst({ where: { userId: sherpaOwnerId, title: PROJECT_TITLE }, select: { id: true } });
if (!project) {
  project = await prisma.project.create({
    data: {
      title: PROJECT_TITLE,
      description: '수도권 22개 매장 신선 식자재 콜드체인 배송 3개월 시범 운영',
      userId: sherpaOwnerId,
      progressPercentage: 40, // 아래 할일 5개 중 완료 2개와 일치
      startDate: daysFromNow(-14), endDate: daysFromNow(60),
      milestones: {
        create: [
          { title: '파일럿 설계', startDate: daysFromNow(-14), endDate: daysFromNow(7) },
          { title: '시범 운영', startDate: daysFromNow(7), endDate: daysFromNow(60) },
        ],
      },
    },
    select: { id: true },
  });
  const milestones = await prisma.milestone.findMany({ where: { projectId: project.id }, orderBy: { startDate: 'asc' }, select: { id: true } });
  const [design, pilot] = milestones.map((m) => m.id);
  await prisma.task.createMany({
    data: [
      { projectId: project.id, milestoneId: design, title: '시범 대상 매장 22곳 확정', status: 'COMPLETED', completedAt: daysFromNow(-8), dueDate: daysFromNow(-7), sort: '1' },
      { projectId: project.id, milestoneId: design, title: '배송 단가·정산 기준 합의', status: 'COMPLETED', completedAt: daysFromNow(-2), dueDate: daysFromNow(-1), sort: '2' },
      { projectId: project.id, milestoneId: design, title: '매장별 발주 데이터 연동 테스트', status: 'IN_PROGRESS', dueDate: daysFromNow(4), sort: '3' },
      { projectId: project.id, milestoneId: pilot, title: '1주차 시범 배송 운영', status: 'IN_PROGRESS', dueDate: daysFromNow(10), sort: '4' },
      { projectId: project.id, milestoneId: pilot, title: '중간 점검 리포트 작성', status: 'PLANNED', dueDate: daysFromNow(21), sort: '5' },
    ],
  });
  created.projects += 1;
}

// ── 요약 ──────────────────────────────────────────────────────────────────
console.log('시드 완료(생성분만 집계):', JSON.stringify(created));
const totals = {
  demoUsers: await prisma.user.count({ where: { email: { in: DEMO_EMAILS } } }),
  loungePosts: await prisma.loungePost.count(),
  collabPosts: await prisma.collaborationPost.count({ where: { isPublic: true, deletedAt: null, hiddenAt: null } }),
};
console.log('전체 현황:', JSON.stringify(totals));
await prisma.$disconnect();
