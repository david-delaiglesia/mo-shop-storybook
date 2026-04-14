import type { Meta, StoryObj } from '@storybook/react'

import { ButtonPrimary } from './ButtonPrimary'
import { ButtonSecondary } from './ButtonSecondary'
import { ButtonTertiary } from './ButtonTertiary'
import { ButtonQuaternary } from './ButtonQuaternary'
import { ButtonQuinary } from './ButtonQuinary'
import { ButtonOval } from './ButtonOval'
import { ButtonRounded } from './ButtonRounded'

/**
 * Wrapper that simulates a real-app container.
 * Buttons use `width: 100%` so they need a parent with defined width.
 */
const ButtonContainer = ({ children, width = '280px' }: { children: React.ReactNode; width?: string }) => (
  <div style={{ width }}>{children}</div>
)

const meta: Meta<typeof ButtonPrimary> = {
  title: 'Components/Button',
  component: ButtonPrimary,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ButtonContainer>
        <Story />
      </ButtonContainer>
    ),
  ],
  argTypes: {
    text: {
      control: 'text',
      description: 'Button text (i18n key or plain text)',
    },
    size: {
      control: 'radio',
      options: ['small', 'default'],
      description: 'Button size (small = 32px, default = 40px)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    fit: {
      control: 'boolean',
      description: 'Auto-width (fit content)',
    },
    destructive: {
      control: 'boolean',
      description: 'Destructive/danger variant (red)',
    },
    activeFeedback: {
      control: 'boolean',
      description: 'Shows a loading spinner',
    },
  },
}

export default meta
type Story = StoryObj<typeof ButtonPrimary>

export const Primary: Story = {
  args: {
    text: 'Primary Button',
  },
}

export const PrimaryDisabled: Story = {
  args: {
    text: 'Disabled Primary',
    disabled: true,
  },
}

export const PrimaryLoading: Story = {
  args: {
    text: 'Loading...',
    activeFeedback: true,
  },
}

export const Secondary: Story = {
  render: (args) => <ButtonSecondary {...args} />,
  args: {
    text: 'Secondary Button',
  },
}

export const Tertiary: Story = {
  render: (args) => <ButtonTertiary {...args} />,
  args: {
    text: 'Tertiary Button',
  },
}

export const Quaternary: Story = {
  decorators: [],
  render: (args) => (
    <div style={{ width: '280px', background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
      <ButtonQuaternary {...args} />
    </div>
  ),
  args: {
    text: 'Quaternary Button',
    icon: 'big-chevron',
  },
}

export const Quinary: Story = {
  render: (args) => <ButtonQuinary {...args} />,
  args: {
    text: 'Quinary Button',
  },
}

export const Oval: Story = {
  render: (args) => <ButtonOval {...args} />,
  args: {
    icon: 'big-chevron',
  },
}

export const Rounded: Story = {
  render: (args) => <ButtonRounded {...args} />,
  args: {
    text: 'Rounded',
  },
}

export const SmallSize: Story = {
  args: {
    text: 'Small Primary',
    size: 'small',
  },
}

export const FitWidth: Story = {
  decorators: [],
  args: {
    text: 'Fit Width',
    fit: true,
  },
}

export const AllVariants: Story = {
  decorators: [],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '280px' }}>
      <ButtonPrimary text="Primary" />
      <ButtonSecondary text="Secondary" />
      <ButtonTertiary text="Tertiary" />
      <div style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
        <ButtonQuaternary text="Quaternary" icon="big-chevron" />
      </div>
      <ButtonQuinary text="Quinary" />
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <ButtonOval icon="big-chevron" />
        <ButtonRounded text="Rounded" />
      </div>
    </div>
  ),
}

export const AllSizes: Story = {
  decorators: [],
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      <div style={{ width: '200px' }}>
        <p style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>Small (32px)</p>
        <ButtonPrimary text="Small" size="small" />
      </div>
      <div style={{ width: '200px' }}>
        <p style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>Default (40px)</p>
        <ButtonPrimary text="Default" />
      </div>
    </div>
  ),
}

export const DestructiveVariants: Story = {
  decorators: [],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '280px' }}>
      <ButtonPrimary text="Destructive Primary" destructive />
      <ButtonSecondary text="Destructive Secondary" destructive />
    </div>
  ),
}
