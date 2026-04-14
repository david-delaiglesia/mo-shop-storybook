import type { Meta, StoryObj } from '@storybook/react'
import { PopOver } from './PopOver'

const meta: Meta<typeof PopOver> = {
  title: 'Components / PopOver',
  component: PopOver,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    triggerLabel: 'Más información',
    title: 'Detalles del envío',
    content: 'Los envíos se realizan de lunes a sábado en horario de 9:00 a 21:00.',
    placement: 'bottom',
  },
}
export default meta
type Story = StoryObj<typeof PopOver>

export const Default: Story = {}

export const Top: Story = {
  args: {
    placement: 'top',
    triggerLabel: 'Ver arriba',
    title: 'Aviso',
    content: 'Este producto tiene disponibilidad limitada.',
  },
}

export const NoTitle: Story = {
  args: {
    title: undefined,
    content: 'Entrega estimada: 24-48 horas.',
  },
}

export const LongContent: Story = {
  args: {
    title: 'Política de devoluciones',
    content:
      'Dispones de 30 días desde la recepción del pedido para realizar devoluciones. Los productos deben estar en su embalaje original y sin abrir. El reembolso se realizará en el mismo método de pago utilizado.',
  },
}
