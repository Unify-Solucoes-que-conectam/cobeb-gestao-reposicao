// Versão do app (package.json) e data/hora do build, injetadas pelo vite.config.ts.
// A data do build muda a cada publicação, mesmo que a versão do package.json não mude.
export const APP_VERSION = __APP_VERSION__
export const APP_BUILD_DATE = __APP_BUILD_DATE__

const buildDate = new Date(APP_BUILD_DATE)

export const APP_BUILD_LABEL = Number.isNaN(buildDate.getTime())
  ? ''
  : buildDate.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

// Ex.: "v0.1.0 (24/11/2026 15:30)"
export const APP_VERSION_LABEL = APP_BUILD_LABEL
  ? `v${APP_VERSION} (${APP_BUILD_LABEL})`
  : `v${APP_VERSION}`
