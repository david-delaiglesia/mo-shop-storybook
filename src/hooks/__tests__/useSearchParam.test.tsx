import { act, renderHook } from '@testing-library/react-hooks'
import * as ReactRouter from 'react-router-dom'
import { MemoryRouter } from 'react-router-dom'

import { useSearchParam } from '../useSearchParam'

vi.mock('react-router-dom', async (importActual) => {
  {
    const actual = await importActual<typeof ReactRouter>()
    return {
      ...actual,
    }
  }
})

describe('useSearchParam', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  )

  it('should return the value of the specified search param', () => {
    const paramName = 'testParam'

    vi.spyOn(ReactRouter, 'useLocation').mockReturnValue({
      pathname: '/test',
      search: `?${paramName}=testValue`,
      hash: '',
      state: null,
      key: 'testKey',
    })

    const { result } = renderHook(() => useSearchParam(paramName), {
      wrapper,
    })

    const [value] = result.current

    expect(value).toBe('testValue')
  })

  it('should return null if the specified search param does not exist', () => {
    const paramName = 'nonExistentParam'

    vi.spyOn(ReactRouter, 'useLocation').mockReturnValue({
      pathname: '/test',
      search: `?testParam=testValue`,
      hash: '',
      state: null,
    })

    const { result } = renderHook(() => useSearchParam(paramName), {
      wrapper,
    })

    const [value] = result.current

    expect(value).toBeNull()
  })

  it('should update the search param when the setter function is called', () => {
    const paramName = 'updateParam'
    const initialValue = 'initialValue'
    const newValue = 'newValue'
    const historyReplaceMock = vi.fn()

    vi.spyOn(ReactRouter, 'useLocation').mockReturnValue({
      pathname: '/test',
      search: `?${paramName}=${initialValue}`,
      hash: '',
      state: null,
    })

    vi.spyOn(ReactRouter, 'useHistory').mockReturnValue({
      replace: historyReplaceMock,
    } as unknown as ReturnType<typeof ReactRouter.useHistory>)

    const { result } = renderHook(() => useSearchParam(paramName), {
      wrapper,
    })

    const [, setValue] = result.current

    act(() => {
      setValue(newValue)
    })

    expect(historyReplaceMock).toHaveBeenCalledWith({
      pathname: '/test',
      search: `${paramName}=${newValue}`,
    })
  })

  it('should remove the search param when the clear function is called', () => {
    const paramName = 'clearParam'
    const paramValue = 'valueToClear'

    const historyReplaceMock = vi.fn()

    vi.spyOn(ReactRouter, 'useLocation').mockReturnValue({
      pathname: '/test',
      search: `?${paramName}=${paramValue}&anotherParam=anotherValue`,
      hash: '',
      state: null,
    })

    vi.spyOn(ReactRouter, 'useHistory').mockReturnValue({
      replace: historyReplaceMock,
    } as unknown as ReturnType<typeof ReactRouter.useHistory>)

    const { result } = renderHook(() => useSearchParam(paramName), {
      wrapper,
    })

    const [, , clearValue] = result.current

    act(() => {
      clearValue()
    })

    expect(historyReplaceMock).toHaveBeenCalledWith({
      pathname: '/test',
      search: 'anotherParam=anotherValue',
    })
  })
})
