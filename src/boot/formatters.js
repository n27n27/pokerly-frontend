import { boot } from 'quasar/wrappers'
import { formatNumber, parseNumber } from 'src/utils/numberFormat'

export default boot(({ app }) => {
  app.config.globalProperties.$fmt = {
    num: formatNumber,
    parseNum: parseNumber,
  }
})
