import 'server-only';

import { type Result, err, ok } from 'neverthrow';

// 협업 공고 작성 값 — 생성 시점의 불변식을 캡슐화한다. 커맨드가 검증 통과한 이 VO에서
// 영속화 데이터를 뽑아 쓴다. 시간·작성자·공개여부 등 경계 밖 사실은 커맨드가 주입한다(여기 없음).
type CollaborationPostErr =
  | { code: 'TITLE_REQUIRED'; message: string }
  | { code: 'DESCRIPTION_REQUIRED'; message: string }
  | { code: 'BUDGET_NEGATIVE'; message: string }
  | { code: 'BUDGET_RANGE'; message: string }
  | { code: 'DEADLINE_PAST'; message: string };

export type CreateCollaborationPostInput = {
  title: string;
  description: string;
  minBudgetInCheonwon: number | null;
  maxBudgetInCheonwon: number | null;
  region: string | null;
  collaborationMethod: string | null;
  startDate: Date | null;
  endDate: Date | null;
  applicationDeadline: Date | null;
  requiredSkillIds: string[];
  industryTagIds: string[];
};

export class CollaborationPost {
  public readonly title: string;
  public readonly description: string;
  public readonly minBudgetInCheonwon: number | null;
  public readonly maxBudgetInCheonwon: number | null;
  public readonly region: string | null;
  public readonly collaborationMethod: string | null;
  public readonly startDate: Date | null;
  public readonly endDate: Date | null;
  public readonly applicationDeadline: Date | null;
  public readonly requiredSkillIds: string[];
  public readonly industryTagIds: string[];

  private constructor(
    title: string,
    description: string,
    minBudgetInCheonwon: number | null,
    maxBudgetInCheonwon: number | null,
    region: string | null,
    collaborationMethod: string | null,
    startDate: Date | null,
    endDate: Date | null,
    applicationDeadline: Date | null,
    requiredSkillIds: string[],
    industryTagIds: string[],
  ) {
    this.title = title;
    this.description = description;
    this.minBudgetInCheonwon = minBudgetInCheonwon;
    this.maxBudgetInCheonwon = maxBudgetInCheonwon;
    this.region = region;
    this.collaborationMethod = collaborationMethod;
    this.startDate = startDate;
    this.endDate = endDate;
    this.applicationDeadline = applicationDeadline;
    this.requiredSkillIds = requiredSkillIds;
    this.industryTagIds = industryTagIds;
  }

  public static create(
    input: CreateCollaborationPostInput,
  ): Result<CollaborationPost, CollaborationPostErr> {
    const title = input.title.trim();
    const description = input.description.trim();
    if (!title) return err({ code: 'TITLE_REQUIRED', message: '제목을 입력해 주세요.' });
    if (!description) return err({ code: 'DESCRIPTION_REQUIRED', message: '내용을 입력해 주세요.' });

    const { minBudgetInCheonwon: min, maxBudgetInCheonwon: max } = input;
    if ((min != null && min < 0) || (max != null && max < 0))
      return err({ code: 'BUDGET_NEGATIVE', message: '예산은 0 이상이어야 합니다.' });
    if (min != null && max != null && min > max)
      return err({ code: 'BUDGET_RANGE', message: '최소 예산은 최대 예산보다 클 수 없습니다.' });

    const region = input.region?.trim() || null;
    const collaborationMethod = input.collaborationMethod?.trim() || null;

    // 마감일은 "그날 하루 종일 신청 가능"으로 해석 — 오늘 날짜 선택은 허용, 어제 이전만 거부.
    if (input.applicationDeadline != null) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (input.applicationDeadline < today)
        return err({ code: 'DEADLINE_PAST', message: '신청 마감일은 오늘 이후여야 합니다.' });
    }

    return ok(
      new CollaborationPost(
        title,
        description,
        min,
        max,
        region,
        collaborationMethod,
        input.startDate,
        input.endDate,
        input.applicationDeadline,
        [...input.requiredSkillIds],
        [...input.industryTagIds],
      ),
    );
  }
}
