import type { Meta, StoryObj } from '@storybook/react'
import { ButtonPicker } from './ButtonPicker'

const meta: Meta<typeof ButtonPicker> = {
  title: 'Components / ButtonPicker',
  component: ButtonPicker,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    label: 'Formato de envío',
    options: [
      { value: 'standard', label: 'Estándar' },
      { value: 'express', label: 'Express' },
      { value: 'same-day', label: 'Mismo día' },
    ],
  },
}
export default meta
type Story = StoryObj<typeof ButtonPicker>

export const Default: Story = {}

export const WithSelection: Story = {
  args: { value: 'express' },
}

export const WithDisabled: Story = {
  args: {
    options: [
      { value: 'standard', label: 'Estándar' },
      { value: 'express', label: 'Express' },
      { value: 'same-day', label: 'Mismo día', disabled: true },
    ],
  },
}

export const Multiple: Story = {
  args: {
    label: 'Alergenos',
    multiple: true,
    options: [
      { value: 'gluten', label: 'Gluten' },
      { value: 'lactose', label: 'Lactosa' },
      { value: 'nuts', label: 'Frutos secos' },
      { value: 'soy', label: 'Soja' },
      { value: 'eggs', label: 'Huevos' },
    ],
  },
}

export const Sizes: Story = {
  args: {
    label: 'Talla',
    options: [
      { value: 'xs', label: 'XS' },
      { value: 's', label: 'S' },
      { value: 'm', label: 'M' },
      { value: 'l', label: 'L' },
      { value: 'xl', label: 'XL' },
    ],
    value: 'm',
  },
}
