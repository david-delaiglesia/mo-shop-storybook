import { SlotsItemHoneycomb } from 'app/delivery-area/components/slots-item-honeycomb'
import { Slot } from 'app/shared/slot'

import './SlotsDetailHoneycomb.css'

interface SlotsDetailHoneycombProps {
  daySlots: Slot[]
  selectedSlot: Slot | null
  onSelectSlot: (slot: Slot) => void
  timezone: string
}

export const SlotsDetailHoneycomb = ({
  daySlots,
  onSelectSlot,
  selectedSlot,
  timezone,
}: SlotsDetailHoneycombProps) => {
  return (
    <div
      className="slots-detail-honeycomb"
      role="group"
      aria-labelledby="slots-detail-description"
    >
      {daySlots.map((slot) => (
        <SlotsItemHoneycomb
          key={slot.id}
          slot={slot}
          onSelect={() => onSelectSlot(slot)}
          isSelected={selectedSlot?.start === slot.start}
          timezone={timezone}
        />
      ))}
    </div>
  )
}
