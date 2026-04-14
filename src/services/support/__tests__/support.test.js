import { hideButton, showButton } from '../zendesk'
import { vi } from 'vitest'

import { Support } from 'services/support'

vi.mock('../framework', () => ({}))
vi.unmock('services/support')
window.zE = vi.fn()

const zendeskLibraryLoaded = () => {
  window.zE.hide = vi.fn()
  window.zE.show = vi.fn()
  window.zE.setHelpCenterSuggestions = vi.fn()
  window.zE.setLocale = vi.fn()
}

it('should stop execution of the uncompleted functions', () => {
  hideButton()
  zendeskLibraryLoaded()
  showButton()

  expect(window.zE.hide).not.toHaveBeenCalled()
})

it('should call with en-us as defult language when the current language is English', () => {
  zendeskLibraryLoaded()
  Support.setLocale('en')

  expect(window.zE.setLocale).toHaveBeenCalledWith('en-us')
})

it('should call with es as defult language when the current language is Valencia', () => {
  zendeskLibraryLoaded()
  Support.setLocale('vai')

  expect(window.zE.setLocale).toHaveBeenCalledWith('es')
})

it('should call to update zendesk settings when call to updateSettings', () => {
  zendeskLibraryLoaded()
  Support.updateSettings({ foo: 'bar' })

  expect(window.zE).toHaveBeenCalledWith('webWidget', 'updateSettings', {
    foo: 'bar',
  })
})
