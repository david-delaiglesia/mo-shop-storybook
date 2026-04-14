import { render, screen } from '@testing-library/react'

import CategoriesFilterCollapse from '../../categories-filter-collapse'

describe('<CategoriesFilterCollapse />', () => {
  it('should render correctly', () => {
    render(<CategoriesFilterCollapse categories={[]} />)
    expect(screen.getByRole('list')).toBeInTheDocument()
  })

  it('should render CategoriesFilterItem if has categories', () => {
    render(<CategoriesFilterCollapse categories={[{ id: 1 }, { id: 2 }]} />)

    const items = screen.getAllByRole('listitem')

    expect(items).toHaveLength(2)
  })
})
