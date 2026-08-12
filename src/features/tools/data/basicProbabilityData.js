export const basicProbabilitySections = [
  {
    id: 'starting-hands',
    category: '시작 핸드 확률',
    order: 1,
    items: [
      { title: '포켓페어', probability: '5.88%', description: '같은 숫자의 카드 2장', order: 1 },
      {
        title: '특정 포켓페어',
        probability: '0.45%',
        secondaryLabel: '약 221핸드에 1번',
        description: '예: AA를 받을 확률',
        order: 2,
      },
      { title: 'AA 또는 KK', probability: '0.90%', order: 3 },
      { title: 'QQ+', probability: '1.36%', order: 4 },
      { title: 'JJ+', probability: '1.81%', order: 5 },
      { title: 'AK 전체', probability: '1.21%', description: 'AKs + AKo', order: 6 },
      { title: 'AKs', probability: '0.30%', order: 7 },
      { title: 'AKo', probability: '0.90%', order: 8 },
      {
        title: '아무 수딧 핸드',
        probability: '23.53%',
        description: '서로 다른 숫자의 같은 무늬 카드',
        order: 9,
      },
    ],
  },
  {
    id: 'flop-hit',
    category: '플랍에서 맞을 확률',
    order: 2,
    groups: [
      {
        title: '포켓페어를 들었을 때',
        items: [
          {
            title: '셋 이상을 맞을 확률',
            probability: '약 11.8%',
            description: '평균 약 8.5번에 한 번',
            order: 1,
          },
          { title: '바로 풀하우스', probability: '약 0.73%', order: 2 },
          { title: '포카드', probability: '약 0.24%', order: 3 },
        ],
      },
      {
        title: '서로 다른 숫자 2장을 들었을 때',
        items: [
          { title: '홀카드 중 하나 이상이 플랍에 맞을 확률', probability: '약 32.4%', order: 1 },
          {
            title: '두 홀카드가 각각 플랍에 맞을 확률',
            probability: '약 2.0%',
            description: '예: AK → A-K-x',
            order: 2,
          },
          { title: '홀카드 한 장으로 트립스를 맞을 확률', probability: '약 1.35%', order: 3 },
        ],
      },
      {
        title: '수딧 핸드를 들었을 때',
        items: [
          { title: '플랍에서 바로 플러시', probability: '약 0.84%', order: 1 },
          { title: '정확히 플러시 드로우가 될 확률', probability: '약 10.9%', order: 2 },
        ],
        note: '같은 무늬 카드가 플랍에 2장 나오면 턴 또는 리버에 같은 무늬 한 장이 더 필요합니다.',
      },
    ],
  },
  {
    id: 'outs',
    category: '아웃과 드로우 확률',
    order: 3,
    columns: ['아웃', '다음 한 장', '리버까지'],
    probabilityColumns: [1, 2],
    rows: [
      ['2', '4.3%', '8.4%'],
      ['4', '8.5%', '16.5%'],
      ['5', '10.6%', '20.4%'],
      ['6', '12.8%', '24.1%'],
      ['8', '17.0%', '31.5%'],
      ['9', '19.1%', '35.0%'],
      ['12', '25.5%', '45.0%'],
      ['15', '31.9%', '54.1%'],
    ],
    tableNote: '리버까지는 플랍에서 턴과 리버 두 장을 모두 볼 수 있는 상황 기준입니다.',
    commonOuts: [
      { label: '거샷', value: '보통 4아웃' },
      { label: '원페어 → 투페어/트립스', value: '보통 5아웃' },
      { label: '오픈엔디드', value: '보통 8아웃' },
      { label: '플러시 드로우', value: '보통 9아웃' },
      { label: 'OESD + 플러시 드로우', value: '최대 15아웃' },
    ],
    tips: [
      {
        title: '빠른 암산',
        lines: ['다음 한 장: 아웃 × 2 ≈ %', '플랍에서 리버까지: 아웃 × 4 ≈ %'],
        description: '빠른 계산을 위한 근사치이며 아웃 수가 많아질수록 오차가 커집니다.',
      },
    ],
    note: '중복 아웃과 상대에게 더 강한 핸드를 만들어주는 더티 아웃은 제외해야 합니다.',
  },
  {
    id: 'made-hand',
    category: '메이드핸드 개선 확률',
    order: 4,
    subtitle: '플랍에서 리버까지 기준',
    items: [
      { title: '트립스 → 풀하우스 또는 포카드', probability: '약 33.4%', order: 1 },
      { title: '투페어 → 풀하우스', probability: '약 16.5%', order: 2 },
      {
        title: '원페어 → 투페어 또는 트립스',
        probability: '약 20.4%',
        description: '홀카드 기준 단순 아웃 계산',
        order: 3,
      },
    ],
    note: '스트레이트나 플러시 이후의 발전 확률은 보드와 홀카드 구성에 따라 달라집니다.',
  },
  {
    id: 'board-shapes',
    category: '보드 텍스처 확률',
    order: 5,
    items: [
      { title: '페어 보드', probability: '약 17.0%', description: '같은 숫자가 2장 이상 있는 플랍', order: 1 },
      { title: '모노톤', probability: '5.18%', description: '세 장 모두 같은 무늬', order: 2 },
      { title: '투톤', probability: '55.06%', description: '두 장만 같은 무늬', order: 3 },
      { title: '레인보우', probability: '39.76%', description: '세 장의 무늬가 모두 다름', order: 4 },
    ],
  },
]
