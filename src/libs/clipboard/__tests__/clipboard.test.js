import { copyTextToClipboard } from '../../clipboard'
import { vi } from 'vitest'

window.document.createRange = () => ({
  setStart: vi.fn(),
  setEnd: vi.fn(),
  selectNode: vi.fn(),
})

window.getSelection = () => ({
  addRange: vi.fn(),
  removeAllRanges: vi.fn(),
})

describe('copyTextToClipboard', () => {
  const text = 'Example text'

  beforeEach(() => {
    delete navigator.clipboard
    vi.resetAllMocks()
  })

  it('should use the fallback method if the clipboard not exists in the browser', () => {
    copyTextToClipboard(text)

    expect(document.execCommand).toHaveBeenCalledWith('copy')
  })

  describe('with navigation clipboard compatibility', () => {
    beforeEach(() => {
      navigator.clipboard = { writeText: vi.fn() }
    })

    it('should copy the text with the new browser api', () => {
      copyTextToClipboard(text)

      expect(document.execCommand).not.toHaveBeenCalledWith('copy')
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text)
    })
  })
})
