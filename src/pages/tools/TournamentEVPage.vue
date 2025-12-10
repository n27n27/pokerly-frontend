<template>
  <q-page class="q-pa-md">
    <div class="column q-gutter-md">
      <div>
        <div class="text-h5 text-weight-bold q-mb-xs">Tournament EV 계산기</div>
        <div class="text-body2 text-grey-7">
          GTD, 기준 엔트리, 현재/예상 엔트리, 바인 정보를 바탕으로 토너먼트 필드의 EV(수익성)를
          평가하는 계산기입니다.
        </div>
      </div>

      <q-card flat bordered class="q-pa-md">
        <div class="text-body1">
          이 페이지는 Tournament EV 계산기 전용 화면입니다.
          <br />
          - GTD / 기준 엔트리 / 오버레이 판단
          <br />
          - 플레이어 ROI 구간 기반 필드 추천/비추천
          <br />
          등의 기능이 추후 추가될 예정입니다.
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup></script>
