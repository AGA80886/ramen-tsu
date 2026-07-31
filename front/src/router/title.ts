import type { Router } from 'vue-router'

const SITE_NAME = '拉麵通'
const DEFAULT_TITLE = SITE_NAME

export function setupDocumentTitle(router: Router): void {
  router.afterEach(to => {
    const pageTitle = to.meta.title

    document.title = pageTitle
      ? `${pageTitle}｜${SITE_NAME}`
      : DEFAULT_TITLE
  })
}
