<template>
  <q-page class="q-pa-md">
    <div class="column q-gutter-md">
      <div>
        <div class="text-h5 text-weight-bold q-mb-xs">SPR 계산기</div>
        <div class="text-body2 text-grey-7">
          히어로/상대 스택과 팟 크기를 이용해 Stack-to-Pot Ratio(SPR)를 계산하고, SPR 구간에 따른
          기본 전략 방향을 확인하는 계산기입니다.
        </div>
      </div>

      <q-card flat bordered class="q-pa-md">
        <div class="text-body1">
          이 페이지는 SPR 계산기 전용 화면입니다.
          <br />
          - SPR 값 계산
          <br />
          - SPR 구간별 추천 전략 (공격 / 밸런스 / 컨트롤)
          <br />
          같은 내용이 추후 이 영역에 노출될 예정입니다.
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup></script>
