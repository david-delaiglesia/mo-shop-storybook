import { getProductFormat } from 'app/accessibility'
import { productBase } from 'app/catalog/__scenarios__/product'
import { I18nClient } from 'app/i18n/client'
import { cloneDeep } from 'utils/objects'

const translations = {
  'accessibility.pack': 'Pack',
  'accessibility.unit': 'Unit',
  'accessibility.kg': 'Kilo',
  'accessibility.g': 'Grams',
  'accessibility.l': 'Litre',
  'accessibility.ml': 'Millilitres',
  'accessibility.kgs': 'Kilos',
  'accessibility.gs': 'Grams',
  'accessibility.ls': 'Litres',
  'accessibility.mls': 'Millilitres',
}

const t = (key) => translations[key]
const lang = 'es'
I18nClient.getCurrentLanguage = () => lang
I18nClient.t = t

describe('Product Format Accessible test', () => {
  it('should return empty format for undefined product', () => {
    expect(getProductFormat()).toBe('')
  })

  it('should return right format for pack product', () => {
    const product = cloneDeep(productBase)
    product.price_instructions.is_pack = true
    expect(getProductFormat(product.price_instructions)).toBe('Pack')
  })

  it('should return the same unit for a non-checked unit', () => {
    const product = cloneDeep(productBase)
    product.price_instructions = {
      size_format: 'gallons',
      selling_method: 1,
      min_bunch_amount: 15,
    }
    expect(getProductFormat(product.price_instructions)).toBe('15 gallons')
  })

  it('should return right format for unit product', () => {
    const product = cloneDeep(productBase)
    product.price_instructions.is_pack = false
    expect(getProductFormat(product.price_instructions)).toBe('Unit')
  })

  it('should return right format for bulk product for 1 KG', () => {
    const product = cloneDeep(productBase)
    product.price_instructions = {
      size_format: 'kg',
      selling_method: 1,
      min_bunch_amount: 1,
    }
    expect(getProductFormat(product.price_instructions)).toBe('1 Kilo')
  })

  it('should return right format for bulk product in KG', () => {
    const product = cloneDeep(productBase)
    product.price_instructions = {
      size_format: 'kg',
      selling_method: 1,
      min_bunch_amount: 15,
    }
    expect(getProductFormat(product.price_instructions)).toBe('15 Kilos')
  })

  it('should return right format for bulk product in grams', () => {
    const product = cloneDeep(productBase)
    product.price_instructions = {
      size_format: 'kg',
      selling_method: 1,
      min_bunch_amount: 0.15,
    }
    expect(getProductFormat(product.price_instructions)).toBe('150 Grams')
  })

  it('should return right format for bulk product in liters', () => {
    const product = cloneDeep(productBase)
    product.price_instructions = {
      size_format: 'l',
      selling_method: 1,
      min_bunch_amount: 15,
    }
    expect(getProductFormat(product.price_instructions)).toBe('15 Litres')
  })

  it('should return right format for bulk product for 1 Litre', () => {
    const product = cloneDeep(productBase)
    product.price_instructions = {
      size_format: 'l',
      selling_method: 1,
      min_bunch_amount: 1,
    }
    expect(getProductFormat(product.price_instructions)).toBe('1 Litre')
  })

  it('should return right format for bulk product in mililiters', () => {
    const product = cloneDeep(productBase)
    product.price_instructions = {
      size_format: 'l',
      selling_method: 1,
      min_bunch_amount: 0.15,
    }
    expect(getProductFormat(product.price_instructions)).toBe('150 Millilitres')
  })
})
