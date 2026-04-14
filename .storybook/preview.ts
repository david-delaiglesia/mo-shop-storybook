import type { Preview } from '@storybook/react'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import 'normalize.css'
import '../src/system-ui/styles/index.css'

// Initialize i18n for Storybook with a passthrough t function
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: {
        translation: {
          // Button / form related
          dialog_close: 'Close',
          aria_loading: 'Loading',
          accessibility_see_password: 'Show password',
          no_results_default: 'No results found',
          'no_results.default': 'No results found',
          comments_max_length_hint: 'Max {{maxLength}} characters',
          comments_current_length_hint: '{{currentLength}} / {{maxLength}} characters',
          password_strength_strong_description: 'Strong password',
          password_strength_weak_description: 'Weak password',
          password_strength_invalid_description: 'Password too short',
          password_invalid_characters: 'Invalid characters',
          'chat.drag_and_drop.overlay.title': 'Drop your file here',
          'chat.drag_and_drop.overlay.subtitle': 'Supported formats: images and documents',
        },
      },
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      eventsToListen: ['languageChanged'],
    },
  })
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
}

export default preview
