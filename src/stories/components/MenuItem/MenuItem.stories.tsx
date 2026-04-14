import type { Meta, StoryObj } from '@storybook/react'
import { MenuItem } from './MenuItem'
import React from 'react'

const meta: Meta<typeof MenuItem> = {
  title: 'Components / MenuItem',
  component: MenuItem,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) =>
      React.createElement('div', { style: { maxWidth: 360, border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' } },
        React.createElement(Story, null),
      ),
  ],
  args: {
    icon: '🛒',
    label: 'Mis pedidos',
    showArrow: true,
  },
}
export default meta
type Story = StoryObj<typeof MenuItem>

export const Default: Story = {}

export const WithSublabel: Story = {
  args: {
    icon: '📍',
    label: 'Dirección de entrega',
    sublabel: 'Calle Gran Vía 12, Madrid',
  },
}

export const WithBadge: Story = {
  args: {
    icon: '🔔',
    label: 'Notificaciones',
    badge: '3',
  },
}

export const Disabled: Story = {
  args: {
    icon: '🔒',
    label: 'Opciones bloqueadas',
    disabled: true,
  },
}

export const MenuList: Story = {
  render: () =>
    React.createElement('div', null,
      React.createElement(MenuItem, { icon: '🛒', label: 'Mis pedidos', badge: '2' }),
      React.createElement(MenuItem, { icon: '📍', label: 'Direcciones', sublabel: '3 direcciones guardadas' }),
      React.createElement(MenuItem, { icon: '💳', label: 'Métodos de pago' }),
      React.createElement(MenuItem, { icon: '🔔', label: 'Notificaciones', badge: '5' }),
      React.createElement(MenuItem, { icon: '⚙️', label: 'Configuración' }),
      React.createElement(MenuItem, { icon: '❓', label: 'Ayuda' }),
    ),
}
