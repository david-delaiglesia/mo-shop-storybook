import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react'

import { TextArea } from './TextArea'

// TextArea is not HOC-wrapped, so we pass t from useTranslation
import { useTranslation } from 'react-i18next'

const TextAreaWithI18n = (props: any) => {
  const { t } = useTranslation()
  return <TextArea {...props} t={t} />
}

const meta: Meta<typeof TextAreaWithI18n> = {
  title: 'System UI/TextArea',
  component: TextAreaWithI18n,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text',
    },
    maxLength: {
      control: 'number',
      description: 'Maximum character length',
    },
    rows: {
      control: 'number',
      description: 'Number of visible rows',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof TextAreaWithI18n>

export const Default: Story = {
  args: {
    label: 'Comments',
    name: 'comments',
    maxLength: 200,
    rows: 4,
    value: '',
    onChange: () => {},
  },
}

export const WithValue: Story = {
  args: {
    label: 'Comments',
    name: 'comments',
    maxLength: 200,
    rows: 4,
    value: 'This is some pre-filled text in the textarea.',
    onChange: () => {},
  },
}

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('')
    const { t } = useTranslation()
    return (
      <div style={{ width: '400px' }}>
        <TextArea
          label="Write your feedback"
          name="feedback"
          maxLength={150}
          rows={4}
          value={value}
          onChange={(e: any) => setValue(e.target.value)}
          t={t}
        />
      </div>
    )
  },
}
