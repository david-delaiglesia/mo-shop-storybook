export const mockedSlots = [
  {
    id: '23768',
    start: '2018-01-26T06:00:00Z',
    end: '2018-01-26T07:00:00Z',
    available: true,
    open: true,
    price: '7.21',
  },
  {
    id: '23762',
    start: '2018-01-26T08:00:00Z',
    end: '2018-01-26T09:00:00Z',
    available: true,
    open: true,
    price: '7.21',
  },
  {
    id: '23760',
    start: '2018-01-27T07:00:00Z',
    end: '2018-01-27T08:00:00Z',
    available: true,
    open: true,
    price: '7.21',
  },
  {
    id: '23762',
    start: '2018-01-27T08:00:00Z',
    end: '2018-01-27T09:00:00Z',
    available: true,
    open: true,
    price: '7.21',
  },
  {
    id: '23782',
    start: '2018-01-27T06:00:00Z',
    end: '2018-01-27T07:00:00Z',
    available: true,
    open: true,
    price: '7.21',
  },
  {
    id: '23759',
    start: '2018-01-27T07:00:00Z',
    end: '2018-01-27T08:00:00Z',
    available: true,
    open: true,
    price: '7.21',
  },
  {
    id: '23770',
    start: '2018-02-01T07:00:00Z',
    end: '2018-02-01T08:00:00Z',
    available: true,
    open: true,
    price: '7.21',
  },
]

export const expectedGenerateAvailableSlots = [
  {
    day: '2018-01-27',
    activeSlots: true,
    slots: [
      {
        id: '23782',
        start: '2018-01-27T06:00:00Z',
        end: '2018-01-27T07:00:00Z',
        available: true,
        open: true,
        price: '7.21',
      },
      {
        id: '23760',
        start: '2018-01-27T07:00:00Z',
        end: '2018-01-27T08:00:00Z',
        available: true,
        open: false,
        price: '7.21',
      },
      {
        id: '23759',
        start: '2018-01-27T07:00:00Z',
        end: '2018-01-27T08:00:00Z',
        available: true,
        open: false,
        price: '7.21',
      },
      {
        id: '23762',
        start: '2018-01-27T08:00:00Z',
        end: '2018-01-27T09:00:00Z',
        available: true,
        open: false,
        price: '7.21',
      },
    ],
  },
  {
    day: '2018-01-28',
    activeSlots: false,
    slots: [],
  },
  {
    day: '2018-01-29',
    activeSlots: false,
    slots: [],
  },
  {
    day: '2018-01-30',
    activeSlots: false,
    slots: [],
  },
  {
    day: '2018-01-31',
    activeSlots: false,
    slots: [],
  },
  {
    day: '2018-02-01',
    activeSlots: true,
    slots: [
      {
        id: '23770',
        start: '2018-02-01T07:00:00Z',
        end: '2018-02-01T08:00:00Z',
        available: true,
        locked: false,
        price: '7.21',
      },
    ],
  },
  {
    day: '2018-02-02',
    activeSlots: false,
    slots: [],
  },
  {
    day: '2018-02-03',
    activeSlots: false,
    slots: [],
  },
  {
    day: '2018-02-04',
    activeSlots: false,
    slots: [],
  },
  {
    day: '2018-02-05',
    activeSlots: false,
    slots: [],
  },
]

export const expectedGetAvailableSlotsFromDay = {
  activeSlots: true,
  day: '2018-01-26',
  slots: [
    {
      end: '2018-01-26T07:00:00Z',
      id: '23768',
      start: '2018-01-26T06:00:00Z',
      available: true,
      open: true,
      price: '7.21',
    },
    {
      end: '2018-01-26T09:00:00Z',
      id: '23762',
      start: '2018-01-26T08:00:00Z',
      available: true,
      open: true,
      price: '7.21',
    },
  ],
}
