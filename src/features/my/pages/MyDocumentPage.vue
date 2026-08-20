<template>
  <q-page class="document-page">
    <header class="detail-topbar">
      <button type="button" aria-label="뒤로 가기" @click="router.back()"><q-icon name="chevron_left" size="28px" /></button>
      <h1>오픈소스 라이선스</h1>
      <span aria-hidden="true"></span>
    </header>

    <article class="document license-document">
      <p class="license-intro">Pokerly는 다음 오픈소스 소프트웨어를 사용합니다. 항목을 누르면 저작권 및 라이선스 고지를 확인할 수 있습니다.</p>
      <details v-for="license in openSourceLicenses" :key="license.name" class="license-item">
        <summary>
          <span><strong>{{ license.name }}</strong><small>{{ license.license }}</small></span>
          <q-icon name="expand_more" size="20px" />
        </summary>
        <div class="license-content">
          <p>{{ license.copyright }}</p>
          <a :href="license.url" target="_blank" rel="noopener noreferrer">프로젝트 홈페이지</a>
          <pre>{{ license.text }}</pre>
        </div>
      </details>
    </article>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
import apexChartsLicense from 'apexcharts/LICENSE?raw'
import pretendardLicense from 'pretendard/dist/LICENSE.txt?raw'

const router = useRouter()
const mitLicense = `Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`
const openSourceLicenses = [
  { name: 'phe', license: 'MIT License', copyright: 'Copyright (c) 2017 Thorsten Lorenz', url: 'https://github.com/thlorenz/phe', text: mitLicense },
  { name: 'Vue.js', license: 'MIT License', copyright: 'Copyright (c) 2018-present Yuxi (Evan) You', url: 'https://github.com/vuejs/core', text: mitLicense },
  { name: 'Vue Router', license: 'MIT License', copyright: 'Copyright (c) 2019-present Eduardo San Martin Morote', url: 'https://github.com/vuejs/router', text: mitLicense },
  { name: 'Pinia', license: 'MIT License', copyright: 'Copyright (c) 2019-present Eduardo San Martin Morote', url: 'https://github.com/vuejs/pinia', text: mitLicense },
  { name: 'Quasar Framework', license: 'MIT License', copyright: 'Copyright (c) 2015-present Razvan Stoenescu', url: 'https://github.com/quasarframework/quasar', text: mitLicense },
  { name: 'Quasar Extras', license: 'MIT License', copyright: 'Copyright (c) 2017-present Razvan Stoenescu', url: 'https://github.com/quasarframework/quasar', text: mitLicense },
  { name: 'Axios', license: 'MIT License', copyright: 'Copyright (c) 2014-present Matt Zabriskie & Collaborators', url: 'https://github.com/axios/axios', text: mitLicense },
  { name: 'ApexCharts / Vue3 ApexCharts', license: 'ApexCharts Community License', copyright: 'Copyright ApexCharts', url: 'https://apexcharts.com/license', text: apexChartsLicense },
  { name: 'Pretendard', license: 'SIL Open Font License 1.1', copyright: 'Copyright (c) 2021 Kil Hyung-jin. Reserved Font Name: Pretendard.', url: 'https://github.com/orioncactus/pretendard', text: pretendardLicense },
]
</script>

<style scoped>
.document-page {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: 12px;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 100px;
}
.document-page > * { flex: 0 0 auto; }
.document-page > .detail-topbar {
  display: grid;
  height: var(--v2-detail-topbar-height);
  min-height: var(--v2-detail-topbar-height);
  max-height: var(--v2-detail-topbar-height);
  grid-template-columns: 40px minmax(0,1fr) 40px;
  align-items: center;
  background: var(--v2-page-bg);
}
.detail-topbar button { display: grid; width: 36px; height: 36px; place-items: center; padding: 0; border: 0; background: transparent; color: var(--v2-text-main); }
.detail-topbar h1 { margin: 0; font-size: 18px; font-weight: 620; line-height: 1.2; text-align: center; }
.document { padding: 18px; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; }
.license-document { padding: 0; overflow: hidden; }
.license-intro { padding: 18px; border-bottom: 1px solid var(--v2-border); background: #faf9fd; }
.license-item { border-bottom: 1px solid var(--v2-border); }
.license-item:last-child { border-bottom: 0; }
.license-item summary { display: grid; min-height: 58px; grid-template-columns: minmax(0,1fr) auto; align-items: center; gap: 12px; padding: 10px 16px; cursor: pointer; list-style: none; }
.license-item summary::-webkit-details-marker { display: none; }
.license-item summary > span { display: grid; gap: 4px; }
.license-item summary strong { font-size: 13px; font-weight: 600; }
.license-item summary small { color: var(--v2-text-sub); font-size: 11px; }
.license-item[open] summary .q-icon { transform: rotate(180deg); }
.license-content { padding: 0 16px 18px; }
.license-content a { display: inline-block; margin-top: 8px; color: var(--v2-primary); font-size: 12px; text-decoration: none; }
.license-content pre { overflow-x: auto; margin: 14px 0 0; padding: 12px; border-radius: var(--v2-radius-sm); background: #f7f6fb; color: #4f4a5e; font-family: inherit; font-size: 10px; line-height: 1.55; white-space: pre-wrap; word-break: break-word; }
</style>
