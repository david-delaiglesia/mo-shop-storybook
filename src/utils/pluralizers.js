import { I18nClient } from 'app/i18n/client'

export function unitsPluralizer(size) {
  return size > 1 ? I18nClient.t('units_field') : I18nClient.t('unit_field')
}

export function packsPluralizer(size) {
  return size > 1 ? I18nClient.t('packs_field') : I18nClient.t('pack_field')
}
