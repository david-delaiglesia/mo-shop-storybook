const cookies = {
  [import.meta.env.VITE_ACCEPTED_COOKIES]: {
    thirdParty: true,
    necessary: true,
    version: 1,
  },
  [import.meta.env.VITE_DELIVERY_COOKIE]: {
    postalCode: '46010',
    warehouse: 'vlc1',
  },
  [import.meta.env.VITE_USER_INFO]: { language: 'en' },
}

const cookiesWithVaiLang = {
  ...cookies,
  [import.meta.env.VITE_USER_INFO]: { language: 'vai' },
}

const cookiesWithoutDeliveryInfo = {
  [import.meta.env.VITE_ACCEPTED_COOKIES]: {
    thirdParty: true,
    necessary: true,
    version: 1,
  },
  [import.meta.env.VITE_USER_INFO]: { language: 'en' },
}

const cookiesWithMadWarehouse = {
  [import.meta.env.VITE_ACCEPTED_COOKIES]: {
    thirdParty: true,
    necessary: true,
    version: 1,
  },
  [import.meta.env.VITE_DELIVERY_COOKIE]: {
    postalCode: '28001',
    warehouse: 'mad1',
  },
  [import.meta.env.VITE_USER_INFO]: { language: 'en' },
}

export {
  cookies,
  cookiesWithoutDeliveryInfo,
  cookiesWithVaiLang,
  cookiesWithMadWarehouse,
}
