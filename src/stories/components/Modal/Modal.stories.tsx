import type { Meta, StoryObj } from '@storybook/react'
import { Modal } from './Modal'
import React from 'react'

const meta: Meta<typeof Modal> = {
  title: 'Components / Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    title: 'Confirmar acción',
    description: '¿Estás seguro de que quieres continuar con esta operación?',
    primaryLabel: 'Confirmar',
    secondaryLabel: 'Cancelar',
  },
}
export default meta
type Story = StoryObj<typeof Modal>

export const Default: Story = {}

export const WithContent: Story = {
  args: {
    title: 'Dirección de entrega',
    description: 'Introduce tu dirección para la entrega a domicilio.',
    primaryLabel: 'Guardar',
    secondaryLabel: 'Cancelar',
    children: React.createElement('div', { style: { display: 'flex', flexDirection: 'column' as const, gap: 12 } },
      React.createElement('input', {
        placeholder: 'Calle y número',
        style: { padding: '10px 12px', border: '1px solid #ccc', borderRadius: 8, fontSize: 14 },
      }),
      React.createElement('input', {
        placeholder: 'Código postal',
        style: { padding: '10px 12px', border: '1px solid #ccc', borderRadius: 8, fontSize: 14 },
      }),
      React.createElement('input', {
        placeholder: 'Ciudad',
        style: { padding: '10px 12px', border: '1px solid #ccc', borderRadius: 8, fontSize: 14 },
      }),
    ),
  },
}

export const TitleOnly: Story = {
  args: {
    title: 'Información',
    description: 'Tu pedido ha sido procesado correctamente.',
    primaryLabel: 'Aceptar',
    secondaryLabel: undefined,
  },
}

export const Danger: Story = {
  args: {
    title: 'Eliminar producto',
    description: '¿Estás seguro de que quieres eliminar este producto de tu lista? Esta acción no se puede deshacer.',
    primaryLabel: 'Eliminar',
    secondaryLabel: 'Cancelar',
  },
}
