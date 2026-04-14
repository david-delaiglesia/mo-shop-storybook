import { englishProductBase, productBase } from './product'

const season = {
  title: 'Para tu San Valentín',
  source: 'season',
  source_code: 'SN',
  items: [
    {
      ...productBase,
    },
  ],
}

const dynamicSeason = {
  title: 'Perfecto para tu fryerdora',
  source: 'perfecto-para-tu-fryerdora',
  source_code: 'PS',
  items: [
    {
      ...productBase,
    },
  ],
}

const englishSeason = {
  title: 'For your Valentine',
  source: 'season',
  source_code: 'SN',
  items: [
    {
      ...englishProductBase,
    },
  ],
}

export { season, dynamicSeason, englishSeason }
