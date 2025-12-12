<template>
  <q-page class="q-pa-md">
    <div class="column q-gutter-md" style="max-width: 640px; margin: 0 auto">
      <div class="text-h5 text-weight-bold">문의 / 피드백</div>

      <div class="text-body1 text-grey-8">
        Pokerly를 더 좋게 만들고 싶어요. 사용 중 불편한 점, 버그 제보, 계산기가 이상하게 느껴졌던
        순간 등 편하게 알려주세요 🙂
      </div>

      <q-card flat bordered class="q-pa-md">
        <div class="text-subtitle1 text-weight-medium q-mb-sm">오픈카톡으로 제보하기</div>
        <div class="text-body2 text-grey-7 q-mb-md">
          아래 버튼을 누르면 오픈카톡 방으로 이동합니다. 닉네임만 남기고 자유롭게 말씀해 주세요.
        </div>

        <q-btn color="primary" unelevated icon="chat" label="오픈카톡 열기" @click="goKakao" />
      </q-card>

      <div class="text-caption text-grey-6">
        * 제보 내용은 Pokerly 개선 외 다른 용도로 사용하지 않습니다. * 답변이 조금 늦어질 수 있지만,
        모든 메시지는 꼭 읽어봅니다.
      </div>
    </div>
  </q-page>
</template>

<script setup>
const goKakao = () => {
  window.open('https://open.kakao.com/o/spDdBMXh', '_blank')
}
</script>
