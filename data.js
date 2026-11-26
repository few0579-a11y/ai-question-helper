// 10번 논문(유지민, 2026-11-26)의 결과. 숫자는 논문 표 1~3과 4장에서 그대로 옮겼다.
window.PAPER = {
  title: "\"모르면 모른다고 답하라\"는 한 문장이 Claude의 가짜 논문 지어내기를 줄이는가",
  subtitle: "Claude Haiku 5.5를 대상으로 한 지시 문장 유무 비교 실험",
  date: "2026-11-26",
  pdf: "https://few0579-a11y.github.io/portfolio/works/paper.pdf",
  sentence: "확실하지 않으면 모른다고 답해 주세요.",
  verdict: "부분적으로 지지",
  fake: {
    n: 20,
    A: { fabricated: 2, speculated: 5, pure: 13 },
    B: { fabricated: 0, speculated: 1, pure: 19 },
    pValueContent: 0.044,
    itemsWithDifference: 4,
    itemsTotal: 10,
    plausibleItems: { label: "연구 주제와 가까운 그럴듯한 제목(F04·F10)", contentA: 4, nA: 4 },
    otherItems: { label: "나머지 8개 제목", contentA: 3, nA: 16 }
  },
  real: {
    n: 20,
    A: { correct: 20, refused: 0, hedged: 6 },
    B: { correct: 20, refused: 0, hedged: 16 },
    unverifiedDetails: 4
  },
  limits: [
    "Claude Haiku 5.5 한 모델만 시험했다. 다른 모델에는 그대로 적용할 수 없다.",
    "가짜 논문 10개 × 2회로 표본이 작고, 차이는 10문항 중 4문항에서만 나왔다.",
    "논문이 있다고 전제하고 지어낸 답(엄격 기준)만 세면 2건 대 0건으로 차이를 말하기 어렵다.",
    "지시가 있어도 20건 중 1건은 제목으로 내용을 짐작했다. 문장 하나로 지어내기가 사라지지는 않는다.",
    "실제 논문 답 4건에도 원문에서 확인되지 않은 세부 사항이 있었다."
  ]
};
