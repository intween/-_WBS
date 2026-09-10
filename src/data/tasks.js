/**
 * 업무 원본 데이터 (총 67건) — 정적 정의.
 * id 규칙: {streamId}_{periodId}_{index}
 * 완료 여부 / 메모 / 담당자 등 진행 상태는 여기에 두지 않는다.
 */
export const TASKS = [
  // A. 프로그램 기획 (6)
  { id: 'a_w1_0', stream: 'a', period: 'w1', title: '세부 일정 확정' },
  { id: 'a_w1_1', stream: 'a', period: 'w1', title: '운영 계획서 정리' },
  { id: 'a_w2_0', stream: 'a', period: 'w2', title: '협조 공문 발송' },
  { id: 'a_w2_1', stream: 'a', period: 'w2', title: '파트너 컨펌 공유' },
  { id: 'a_w3_0', stream: 'a', period: 'w3', title: '오리엔테이션 개최' },
  { id: 'a_w3_1', stream: 'a', period: 'w3', title: '안내 자료 배포' },

  // B. 기업 진단 컨설팅 (11)
  { id: 'b_w1_0', stream: 'b', period: 'w1', title: '설문지 검토' },
  { id: 'b_w1_1', stream: 'b', period: 'w1', title: '5개사 설문 배포' },
  { id: 'b_w1_2', stream: 'b', period: 'w1', title: '마감일 공지' },
  { id: 'b_w2_0', stream: 'b', period: 'w2', title: '응답 수합 분석' },
  { id: 'b_w2_1', stream: 'b', period: 'w2', title: '컨설팅 방향 도출' },
  { id: 'b_w2_2', stream: 'b', period: 'w2', title: '컨설턴트 매칭' },
  { id: 'b_w3_0', stream: 'b', period: 'w3', title: '컨설팅 1회차 진행' },
  { id: 'b_w3_1', stream: 'b', period: 'w3', title: '후속 과제 부여' },
  { id: 'b_w4_0', stream: 'b', period: 'w4', title: '컨설팅 2회차 진행' },
  { id: 'b_wf_0', stream: 'b', period: 'wf', title: '현장 밀착 지원' },
  { id: 'b_wf_1', stream: 'b', period: 'wf', title: '팀프로젝트 코칭' },

  // C. 현지 섭외 대관 (12)
  { id: 'c_w2_0', stream: 'c', period: 'w2', title: '통역 코디 섭외' },
  { id: 'c_w2_1', stream: 'c', period: 'w2', title: '대관 1차 완료' },
  { id: 'c_w3_0', stream: 'c', period: 'w3', title: '대관 최종 확정' },
  { id: 'c_w3_1', stream: 'c', period: 'w3', title: '방문 기관 재확인' },
  { id: 'c_w4_0', stream: 'c', period: 'w4', title: '섭외 80퍼센트 확정' },
  { id: 'c_w4_1', stream: 'c', period: 'w4', title: '미확정 Follow-up' },
  { id: 'c_w4_2', stream: 'c', period: 'w4', title: '협조 컨펌 완료' },
  { id: 'c_w5_0', stream: 'c', period: 'w5', title: '섭외 100퍼센트 확정' },
  { id: 'c_w5_1', stream: 'c', period: 'w5', title: '섭외 결과 점검' },
  { id: 'c_w5_2', stream: 'c', period: 'w5', title: '최종 일정 공유' },
  { id: 'c_w8_0', stream: 'c', period: 'w8', title: '섭외 최종 점검' },
  { id: 'c_w8_1', stream: 'c', period: 'w8', title: '중요사항 공유' },

  // D. 디자인 홍보 (8)
  { id: 'd_w2_0', stream: 'd', period: 'w2', title: '키비주얼 시안 요청' },
  { id: 'd_w2_1', stream: 'd', period: 'w2', title: '키비주얼 피드백' },
  { id: 'd_w2_2', stream: 'd', period: 'w2', title: '키비주얼 최종 확정' },
  { id: 'd_w3_0', stream: 'd', period: 'w3', title: '행사 디자인 기획' },
  { id: 'd_w3_1', stream: 'd', period: 'w3', title: '1차 시안 완성' },
  { id: 'd_w4_0', stream: 'd', period: 'w4', title: '피드백 반영' },
  { id: 'd_w4_1', stream: 'd', period: 'w4', title: '고도화 작업' },
  { id: 'd_w5_0', stream: 'd', period: 'w5', title: '디자인물 최종 확정' },

  // E. IR 고도화 (8)
  { id: 'e_w4_0', stream: 'e', period: 'w4', title: 'IR 컨설팅 1회차' },
  { id: 'e_w4_1', stream: 'e', period: 'w4', title: '피치덱 초안 검토' },
  { id: 'e_w4_2', stream: 'e', period: 'w4', title: '보완 과제 부여' },
  { id: 'e_w5_0', stream: 'e', period: 'w5', title: 'IR 고도화 수행' },
  { id: 'e_w5_1', stream: 'e', period: 'w5', title: '피치덱 디자인 완료' },
  { id: 'e_w5_2', stream: 'e', period: 'w5', title: '최종본 기업 전달' },
  { id: 'e_wf_0', stream: 'e', period: 'wf', title: 'IR 발표 진행' },
  { id: 'e_wf_1', stream: 'e', period: 'wf', title: '시상 수료증 수여' },

  // F. 운영 준비 물품 (13)
  { id: 'f_w5_0', stream: 'f', period: 'w5', title: '체크리스트 구축' },
  { id: 'f_w5_1', stream: 'f', period: 'w5', title: '담당자별 배분' },
  { id: 'f_w6_0', stream: 'f', period: 'w6', title: '물품 구매 완료' },
  { id: 'f_w6_1', stream: 'f', period: 'w6', title: '체크리스트 70프로' },
  { id: 'f_w6_2', stream: 'f', period: 'w6', title: '유의사항 1차 안내' },
  { id: 'f_w7_0', stream: 'f', period: 'w7', title: '체크리스트 90프로' },
  { id: 'f_w7_1', stream: 'f', period: 'w7', title: '준비사항 2차 안내' },
  { id: 'f_w7_2', stream: 'f', period: 'w7', title: '출발 전 점검' },
  { id: 'f_w8_0', stream: 'f', period: 'w8', title: '체크리스트 100프로' },
  { id: 'f_w8_1', stream: 'f', period: 'w8', title: '수화물 확인' },
  { id: 'f_w8_2', stream: 'f', period: 'w8', title: '비상매뉴얼 배포' },
  { id: 'f_wf_0', stream: 'f', period: 'wf', title: '현장 운영 총괄' },
  { id: 'f_wf_1', stream: 'f', period: 'wf', title: '물품 세팅 철수' },

  // G. 현지 일정 Day별 (9)
  { id: 'g_wf_0', stream: 'g', period: 'wf', title: 'D1 출발 도착 체크인' },
  { id: 'g_wf_1', stream: 'g', period: 'wf', title: 'D1 킥오프 팀빌딩' },
  { id: 'g_wf_2', stream: 'g', period: 'wf', title: 'D2 기관 세미나 SECC' },
  { id: 'g_wf_3', stream: 'g', period: 'wf', title: 'D2 밋업데이 개최' },
  { id: 'g_wf_4', stream: 'g', period: 'wf', title: 'D3 NIPA 팀프로젝트' },
  { id: 'g_wf_5', stream: 'g', period: 'wf', title: 'D3 Coffee Expo 탐방' },
  { id: 'g_wf_6', stream: 'g', period: 'wf', title: 'D3 실습 리허설' },
  { id: 'g_wf_7', stream: 'g', period: 'wf', title: 'D4 아이디어 발표회' },
  { id: 'g_wf_8', stream: 'g', period: 'wf', title: 'D4 시상 리셉션 귀국' },
];

/** 전체 업무 수 (67) */
export const TASK_COUNT = TASKS.length;

/** 업무 id 목록 */
export const TASK_IDS = TASKS.map((task) => task.id);
