import { getProductAccessibleText } from 'app/accessibility'
import { I18nClient } from 'app/i18n/client'

const translations = {
  'accessibility.unit': 'Unidad',
  'accessibility.units': 'Unidades',
  'accessibility.l': 'Litre',
}

const t = (key) => translations[key]
const lang = 'es'
I18nClient.getCurrentLanguage = () => lang
I18nClient.t = t

describe('Product Quantity Accessible test', () => {
  it('should return "" for empty text', () => {
    expect(getProductAccessibleText()).toBe('')
  })

  it('should return "Unidad" for "ud."', () => {
    expect(getProductAccessibleText('1 ud.')).toBe('1 Unidad')
  })

  it('should return "Unidades" for "uds."', () => {
    expect(getProductAccessibleText('2 uds.')).toBe('2 Unidades')
  })

  it('should return "Unidad" for "u."', () => {
    expect(getProductAccessibleText('1 u.')).toBe('1 Unidad')
  })

  it('should return "Unidades" for "u." in plural (valenciano and catalan)', () => {
    expect(getProductAccessibleText('2 u.')).toBe('2 Unidades')
  })

  it('should return "Unidades" for "ud." if number is in plural', () => {
    expect(getProductAccessibleText('2 ud.')).toBe('2 Unidades')
  })

  it('should return "Unidad" for "ud." in Add to Cart Text', () => {
    expect(getProductAccessibleText('Añadir 1 ud. al carro')).toBe(
      'Añadir 1 Unidad al carro',
    )
  })

  it('should return "Litro" for "/L"', () => {
    expect(getProductAccessibleText('€/L')).toBe('€/Litre')
  })
})
