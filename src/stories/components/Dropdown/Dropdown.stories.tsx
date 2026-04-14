import type { Meta, StoryObj } from '@storybook/react'
import { Dropdown } from './Dropdown'

const SAMPLE_OPTIONS = [
  { value: 'turismo', label: 'Turismo' },
  { value: 'furgoneta', label: 'Furgoneta' },
  { value: 'camion', label: 'Camión' },
  { value: 'moto', label: 'Motocicleta' },
]

const meta: Meta<typeof Dropdown> = {
  title: 'Components / Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    label: 'Tipo de vehículo',
    placeholder: 'Selecciona una opción',
    options: SAMPLE_OPTIONS,
  },
}
export default meta
type Story = StoryObj<typeof Dropdown>

export const Default: Story = {}
export const WithSelection: Story = { args: { value: 'turismo' } }
export const Disabled: Story = { args: { disabled: true } }
export const ManyOptions: Story = {
  args: {
    label: 'País',
    options: [
      { value: 'es', label: 'España' },
      { value: 'pt', label: 'Portugal' },
      { value: 'fr', label: 'Francia' },
      { value: 'it', label: 'Italia' },
      { value: 'de', label: 'Alemania' },
      { value: 'uk', label: 'Reino Unido' },
      { value: 'nl', label: 'Países Bajos' },
    ],
  },
}
