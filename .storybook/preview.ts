import type { Preview } from '@storybook/react'
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
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

/**
 * Custom viewports based on Apple HIG and industry standards.
 * Touch targets: 44×44pt minimum (Apple HIG)
 * Font minimum: 16px on mobile (prevents iOS auto-zoom)
 * Spacing: 8px grid system
 */
const customViewports = {
  iphoneSE: {
    name: 'iPhone SE (375×667)',
    styles: { width: '375px', height: '667px' },
    type: 'mobile' as const,
  },
  iphone15: {
    name: 'iPhone 15 (393×852)',
    styles: { width: '393px', height: '852px' },
    type: 'mobile' as const,
  },
  iphone15ProMax: {
    name: 'iPhone 15 Pro Max (430×932)',
    styles: { width: '430px', height: '932px' },
    type: 'mobile' as const,
  },
  androidCompact: {
    name: 'Android Compact (360×800)',
    styles: { width: '360px', height: '800px' },
    type: 'mobile' as const,
  },
  iPadMini: {
    name: 'iPad Mini (744×1133)',
    styles: { width: '744px', height: '1133px' },
    type: 'tablet' as const,
  },
  iPad: {
    name: 'iPad (1024×1366)',
    styles: { width: '1024px', height: '1366px' },
    type: 'tablet' as const,
  },
  desktop: {
    name: 'Desktop (1280×800)',
    styles: { width: '1280px', height: '800px' },
    type: 'desktop' as const,
  },
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
    viewport: {
      viewports: {
        ...customViewports,
        ...INITIAL_VIEWPORTS,
      },
      defaultViewport: 'responsive',
    },
  },
}

export default preview
