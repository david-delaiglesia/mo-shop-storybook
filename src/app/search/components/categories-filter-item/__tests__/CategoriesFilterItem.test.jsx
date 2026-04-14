import CategoriesFilterItem from '..'
import { vi } from 'vitest'

const createInstance = (overrideProps = {}) => {
  const props = {
    category: {},
    selectCategory: vi.fn(),
    ...overrideProps,
  }
  const instance = new CategoriesFilterItem(props)
  instance.props = props
  return { instance }
}

describe('<CategoriesFilterItem />', () => {
  it('should render correctly', () => {
    const { instance } = createInstance()
    expect(instance.render()).toBeDefined()
  })

  describe('getStatusClass method', () => {
    it('should return the selected class name if the category is selected', () => {
      const category = { id: 1, level: 2 }
      const { instance } = createInstance()
      instance.isSelected = vi.fn().mockReturnValue(true)

      const className = instance.getStatusClass(category)

      const expectedClassName = 'categories-level-2--selected'
      expect(className).toContain(expectedClassName)
    })

    it('should return the visible class name if the category is visible', () => {
      const category = { id: 1, level: 1 }
      const { instance } = createInstance()
      instance.isVisible = vi.fn().mockReturnValue(true)

      const className = instance.getStatusClass(category)

      const expectedClassName = 'categories-level-1--visible'
      expect(className).toContain(expectedClassName)
    })

    it('should return the default class name if the category is not selected or visible', () => {
      const category = { id: 1, level: 1 }
      const { instance } = createInstance()

      const className = instance.getStatusClass(category)

      const expectedClassName = 'categories-level-1'
      expect(className).toContain(expectedClassName)
    })
  })

  describe('isVisible method', () => {
    it('should return true if the category is visible', () => {
      const selectedCategory = { id: 2 }
      const category = { id: 1, categories: [selectedCategory] }
      const { instance } = createInstance({ category, selectedCategory })

      const result = instance.isVisible(category)

      expect(result).toBeTruthy()
    })

    it('should return false if the category does not have child categories', () => {
      const category = { id: 1 }
      const { instance } = createInstance({
        category,
        selectedCategory: { id: 2 },
      })

      const result = instance.isVisible(category)

      expect(result).toBeFalsy()
    })

    it('should return false if the category does not have selected child categories', () => {
      const category = { id: 1, categories: [] }
      const { instance } = createInstance({
        category,
        selectedCategory: { id: 2 },
      })

      const result = instance.isVisible(category)

      expect(result).toBeFalsy()
    })
  })

  describe('hasSelectedChild method', () => {
    it('should return false if the category does not exists', () => {
      const { instance } = createInstance()

      const result = instance.hasSelectedChild()

      expect(result).toBeFalsy()
    })

    it('should return true if the category is selected', () => {
      const selectedCategory = { id: 2 }
      const category = { id: 1, categories: [selectedCategory] }
      const { instance } = createInstance({ category, selectedCategory })

      const result = instance.hasSelectedChild(category)

      expect(result).toBeTruthy()
    })

    it('should return false if the category is a leaf node', () => {
      const selectedCategory = { id: 2 }
      const category = { id: 1 }
      const { instance } = createInstance({ category, selectedCategory })

      const result = instance.hasSelectedChild(category)

      expect(result).toBeFalsy()
    })
  })

  describe('isSelected method', () => {
    it('should return true if the category is selected', () => {
      const category = { id: 1 }
      const { instance } = createInstance({
        category,
        selectedCategory: category,
      })

      const result = instance.isSelected(category)

      expect(result).toBeTruthy()
    })

    it('should return false if the category is not selected', () => {
      const category = { id: 1 }
      const { instance } = createInstance({
        category,
        selectedCategory: { id: 2 },
      })

      const result = instance.isSelected(category)

      expect(result).toBeFalsy()
    })
  })

  describe('selectCategory method', () => {
    it('should call selectCategory with the current category', () => {
      const category = { id: 1, level: 2 }
      const selectCategory = vi.fn()
      const { instance } = createInstance({ category, selectCategory })

      instance.selectCategory()

      expect(selectCategory).toHaveBeenCalledWith(category)
    })
  })
})
