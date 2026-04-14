import {
  englishProductBase,
  packProductWithDrainedWeight,
  productAvailableInVlcNotInMad,
  productBase,
  productBaseDetail,
  productListWithAllFormats,
  productWithBulk,
  productWithPack,
  waterProduct,
  waterProductWith100Liters,
} from './product'
import {
  confirmedWidget,
  delayedWidget,
  deliveredAndRatedWidget,
  deliveredWidget,
  deliveringWidget,
  nextToDeliveryWidget,
  paymentIssueWidget,
  preparedNotPaidWidget,
  preparedWidget,
  preparingWidget,
  userUnreachableWidget,
} from './widget'

const homeEmpty = {
  sections: [],
}

const homeWithInfo = {
  sections: [
    {
      layout: 'notification',
      content: {
        title: 'Siguiente fecha de entrega en 5 días naturales.',
        type: 'info',
        event_key: 'low_availability_alert',
      },
    },
  ],
}

const homeWithWarning = {
  sections: [
    {
      layout: 'notification',
      content: {
        title:
          'Sentimos las molestias, actualmente no hay tramos de reparto disponibles.',
        type: 'warning',
        event_key: 'no_availability_alert',
      },
    },
  ],
}

const homeWithDeferredInfo = {
  sections: [
    {
      layout: 'notification',
      content: {
        title: null,
        type: 'info',
        event_key: null,
        api_path: '/deferred-path-url/',
      },
    },
  ],
}

const homeWithWidgets = {
  sections: [
    {
      layout: 'widget',
      content: {
        title: 'Próxima entrega',
        items: [confirmedWidget, preparingWidget],
      },
    },
  ],
}

const homeWithWidgetsES = {
  sections: [
    {
      layout: 'widget',
      content: {
        title: 'Próxima entrega',
        items: [confirmedWidget, preparingWidget],
      },
    },
  ],
}

const homeWithWidgetsEN = {
  sections: [
    {
      layout: 'widget',
      content: {
        title: 'Next delivery',
        items: [confirmedWidget, preparingWidget],
      },
    },
  ],
}

const homeWithWidgetsCA = {
  sections: [
    {
      layout: 'widget',
      content: {
        title: 'Proper lliurament',
        items: [confirmedWidget, preparingWidget],
      },
    },
  ],
}

const homeWithWidgetsVAI = {
  sections: [
    {
      layout: 'widget',
      content: {
        title: 'Pròxima entrega',
        items: [confirmedWidget, preparingWidget],
      },
    },
  ],
}

const homeWithWidgetsEU = {
  sections: [
    {
      layout: 'widget',
      content: {
        title: 'Hurrengo entrega',
        items: [confirmedWidget, preparingWidget],
      },
    },
  ],
}

const homeWithManyWidgets = {
  sections: [
    {
      layout: 'widget',
      content: {
        title: 'Próxima entrega',
        items: [
          confirmedWidget,
          preparingWidget,
          preparedWidget,
          deliveringWidget,
        ],
      },
    },
  ],
}

const homeWithConfirmedWidget = {
  sections: [
    {
      layout: 'widget',
      content: {
        title: 'Próxima entrega',
        items: [confirmedWidget],
      },
    },
  ],
}

const homeWithPreparingWidget = {
  sections: [
    {
      layout: 'widget',
      content: {
        title: 'Próxima entrega',
        items: [preparingWidget],
      },
    },
  ],
}

const homeWithPreparedWidget = {
  sections: [
    {
      layout: 'widget',
      content: {
        title: 'Próxima entrega',
        items: [preparedWidget],
      },
    },
  ],
}

const homeWithPreparedNotPaidWidget = {
  sections: [
    {
      layout: 'widget',
      content: {
        title: 'Próxima entrega',
        items: [preparedNotPaidWidget],
      },
    },
  ],
}

const homeWithDeliveringWidget = {
  sections: [
    {
      layout: 'widget',
      content: {
        title: 'Próxima entrega',
        items: [deliveringWidget],
      },
    },
  ],
}

const homeWithNextToDeliveryWidget = {
  sections: [
    {
      layout: 'widget',
      content: {
        title: 'Próxima entrega',
        items: [nextToDeliveryWidget],
      },
    },
  ],
}

const homeWithDeliveredWidget = {
  sections: [
    {
      layout: 'widget',
      content: {
        title: 'Próxima entrega',
        items: [deliveredWidget],
      },
    },
  ],
}

const homeWithDeliveredAndRatedWidget = {
  sections: [
    {
      layout: 'widget',
      content: {
        title: 'Próxima entrega',
        items: [deliveredAndRatedWidget],
      },
    },
  ],
}

const homeWithPaymentIssueWidget = {
  sections: [
    {
      layout: 'widget',
      content: {
        title: 'Próxima entrega',
        items: [paymentIssueWidget],
      },
    },
  ],
}

const homeWithUserUnreachableWidget = {
  sections: [
    {
      layout: 'widget',
      content: {
        title: 'Próxima entrega',
        items: [userUnreachableWidget],
      },
    },
  ],
}

const homeWithDelayedWidget = {
  sections: [
    {
      layout: 'widget',
      content: {
        title: 'Próxima entrega',
        items: [delayedWidget],
      },
    },
  ],
}

const homeWithWidget = homeWithPreparedWidget

const homeWithBanner = {
  sections: [
    {
      layout: 'unknown_layout',
      content: {},
    },
    {
      layout: 'banner',
      content: {
        title: 'Productos del momento',
        subtitle: 'Selección de productos destacados',
        items: [
          {
            id: 99,
            title: 'Para tu San Valentín',
            image_url:
              'https://storage.googleapis.com/mercadona_online_prod_static/JUN20.jpg',
            text_color: 'rgba(255, 255, 255, 1.0)',
            bg_colors: ['rgba(0, 0, 0, 0.6)', 'rgba(255, 255, 255, 0.0)'],
            button_color: 'rgba(255, 201, 41, 1.0)',
            api_path: '/home/seasons/99',
            campaign_id: 'your-way-irresistible',
          },
        ],
      },
    },
  ],
}

const homeWithHighlightedGroup = {
  sections: [
    {
      layout: 'unknown_layout',
      content: {},
    },
    {
      layout: 'highlighted_group',
      content: {
        title: 'Dos productos destacados',
        subtitle: 'Aproveche',
        items: [
          {
            web_image_url:
              'https://sta-mercadona.imgix.net/images/26db68648970f989049016e551611aa9.jpg?',
            mobile_image_url:
              'https://sta-mercadona.imgix.net/images/4cf03f082ecc8a8635f24af5bc3f2d36.jpg?',
            product: productBase,
          },
          {
            web_image_url:
              'https://sta-mercadona.imgix.net/images/4cf03f082ecc8a8635f24af5bc3f2d36.jpg?',
            mobile_image_url:
              'https://sta-mercadona.imgix.net/images/4cf03f082ecc8a8635f24af5bc3f2d36.jpg?',
            product: productWithBulk,
          },
        ],
        source: 'vlc1-mad1-dos-productos-destacados',
        source_code: 'HLG',
      },
    },
  ],
}

const homeWithVideoSection = {
  sections: [
    {
      layout: 'video',
      content: {
        title: 'Recetas de verano',
        subtitle: 'Descubre nuestros productos de temporada',
        source: 'summer-recipes',
        source_code: 'VS',
        web_video_url: 'https://cdn.example.com/summer-recipes.mp4',
        mobile_video_url: 'https://cdn.example.com/summer-recipes-mobile.mp4',
        api_path: '/home/seasons/summer-recipes/',
        api_path_text: 'Ver todos los productos',
        show_more: false,
        items: [{ ...productBase }],
      },
    },
  ],
}

const homeWithVideoSectionWithThreeProducts = {
  sections: [
    {
      layout: 'video',
      content: {
        title: 'Recetas de verano',
        subtitle: 'Descubre nuestros productos de temporada',
        source: 'summer-recipes',
        source_code: 'VS',
        web_video_url: 'https://cdn.example.com/summer-recipes.mp4',
        mobile_video_url: 'https://cdn.example.com/summer-recipes-mobile.mp4',
        api_path: '/home/seasons/summer-recipes/',
        api_path_text: 'Ver todos los productos',
        show_more: false,
        items: [
          { ...productBase },
          {
            ...productBase,
            id: '8732',
            display_name: 'Producto 2 video section',
          },
          {
            ...productBase,
            id: '8733',
            display_name: 'Producto 3 video section',
          },
        ],
      },
    },
  ],
}

const homeWithVideoSectionWithManyProducts = {
  sections: [
    {
      layout: 'video',
      content: {
        title: 'Recetas de verano',
        subtitle: 'Descubre nuestros productos de temporada',
        source: 'summer-recipes',
        source_code: 'VS',
        web_video_url: 'https://cdn.example.com/summer-recipes.mp4',
        mobile_video_url: 'https://cdn.example.com/summer-recipes-mobile.mp4',
        api_path: '/home/seasons/summer-recipes/',
        api_path_text: 'Ver todos los productos',
        show_more: false,
        items: [
          { ...productBase },
          {
            ...productBase,
            id: '8732',
            display_name: 'Producto 2 video section',
          },
          {
            ...productBase,
            id: '8733',
            display_name: 'Producto 3 video section',
          },
          {
            ...productBase,
            id: '8734',
            display_name: 'Producto 4 video section',
          },
        ],
      },
    },
  ],
}

const homeWithMultipleBanners = {
  sections: [
    {
      layout: 'unknown_layout',
      content: {},
    },
    {
      layout: 'banner',
      content: {
        title: 'Productos del momento',
        subtitle: 'Selección de productos destacados',
        items: [
          {
            id: 99,
            title: 'Para tu San Valentín',
            image_url:
              'https://storage.googleapis.com/mercadona_online_prod_static/JUN20.jpg',
            text_color: 'rgba(255, 255, 255, 1.0)',
            bg_colors: ['rgba(0, 0, 0, 0.6)', 'rgba(255, 255, 255, 0.0)'],
            button_color: 'rgba(255, 201, 41, 1.0)',
            api_path: '/home/seasons/99',
          },
          {
            id: 152,
            title: 'Date un homenaje',
            image_url:
              'https://storage.googleapis.com/mercadona_online_prod_static/Homenaje.jpg',
            text_color: 'rgba(255, 255, 255, 1.0)',
            bg_colors: ['rgba(0, 0, 0, 0.6)', 'rgba(255, 255, 255, 0.0)'],
            button_color: 'rgba(255, 204, 69, 1.0)',
            api_path:
              '/customers/331685d0-6fa4-441e-8c24-09ba40be0407/home/seasons/152/',
          },
        ],
      },
    },
  ],
}

const homeWithBannerProduct = {
  sections: [
    {
      layout: 'unknown_layout',
      content: {},
    },
    {
      layout: 'highlighted',
      content: {
        web_image_url: 'http://images-server-url/image-file',
        mobile_image_url: 'str',
        title: 'Es tendencia',
        subtitle: 'Lo más buscado',
        source: 'producto-destacado',
        source_code: 'HL',
        items: [{ ...productBaseDetail }],
      },
    },
  ],
}

const homeWithGrid = {
  sections: [
    {
      layout: 'unknown_layout',
      content: {},
    },
    {
      layout: 'grid',
      content: {
        title: 'Novedades',
        subtitle: 'Productos recién añadidos o mejorados',
        api_path: '/home/new_arrivals/',
        source: 'new_arrivals',
        source_code: 'NA',
        items: [{ ...productBase }, { ...productWithBulk }],
      },
    },
  ],
}

const homeWithPackProduct = {
  sections: [
    {
      layout: 'unknown_layout',
      content: {},
    },
    {
      layout: 'grid',
      content: {
        title: 'Novedades',
        subtitle: 'Productos recién añadidos o mejorados',
        api_path: '/home/new_arrivals/',
        source: 'new_arrivals',
        source_code: 'NA',
        items: [{ ...productWithPack }],
      },
    },
  ],
}

const homeWithPackProductWithDrainedWeight = {
  sections: [
    {
      layout: 'unknown_layout',
      content: {},
    },
    {
      layout: 'grid',
      content: {
        title: 'Novedades',
        subtitle: 'Productos recién añadidos o mejorados',
        api_path: '/home/new_arrivals/',
        source: 'new_arrivals',
        source_code: 'NA',
        items: [{ ...packProductWithDrainedWeight }],
      },
    },
  ],
}

const homeWithGridAndProductNotAvailableInMad = {
  sections: [
    {
      layout: 'unknown_layout',
      content: {},
    },
    {
      layout: 'grid',
      content: {
        title: 'Novedades',
        subtitle: 'Productos recién añadidos o mejorados',
        api_path: '/home/new_arrivals/',
        source: 'new_arrivals',
        source_code: 'NA',
        items: [
          { ...productBase },
          { ...productWithBulk },
          { ...productAvailableInVlcNotInMad },
        ],
      },
    },
  ],
}

const homeWithRecommendations = {
  sections: [
    {
      layout: 'unknown_layout',
      content: {},
    },
    {
      layout: 'grid',
      content: {
        title: 'Recomendado para ti',
        subtitle: 'Selección personal basada en tus preferencias',
        api_path: '/home/recommendations/',
        source: 'recommendations',
        source_code: 'RE',
        items: [{ ...productBase }],
      },
    },
  ],
}

const englishHomeWithRecommendations = {
  sections: [
    {
      layout: 'unknown_layout',
      content: {},
    },
    {
      layout: 'grid',
      content: {
        title: 'Recommended for you',
        subtitle: 'Personal selection based on your preferences',
        api_path: '/home/recommendations/',
        source: 'recommendations',
        source_code: 'RE',
        items: [{ ...englishProductBase }],
      },
    },
  ],
}

const homeWithCarousel = {
  sections: [
    {
      layout: 'unknown_layout',
      content: {},
    },
    {
      layout: 'carousel',
      content: {
        title: 'Novedades',
        subtitle: 'Productos recién añadidos o mejorados',
        api_path: '/customers/1/home/new-arrivals/',
        api_path_text: 'Ver todas las novedades',
        source: 'new-arrivals',
        source_code: 'NA',
        items: [{ ...productBase }],
      },
    },
  ],
}

const homeWithLimitedProducts = {
  sections: [
    {
      layout: 'grid',
      content: {
        title: 'Novedades',
        subtitle: 'Productos recién añadidos o mejorados',
        api_path: '/home/new_arrivals/',
        source: 'new_arrivals',
        source_code: 'NA',
        items: [
          { ...productBase, limit: 1 },
          { ...waterProduct },
          { ...waterProductWith100Liters },
        ],
      },
    },
  ],
}

const homeWithProductFormats = {
  sections: [
    {
      layout: 'grid',
      content: {
        title: 'Novedades',
        subtitle: 'Productos recién añadidos o mejorados',
        api_path: '/home/new_arrivals/',
        source: 'new_arrivals',
        source_code: 'NA',
        items: [...productListWithAllFormats],
      },
    },
  ],
}

export {
  homeEmpty,
  homeWithInfo,
  homeWithWarning,
  homeWithDeferredInfo,
  homeWithWidget,
  homeWithWidgets,
  homeWithWidgetsES,
  homeWithWidgetsEN,
  homeWithWidgetsEU,
  homeWithWidgetsVAI,
  homeWithWidgetsCA,
  homeWithManyWidgets,
  homeWithConfirmedWidget,
  homeWithPreparingWidget,
  homeWithPreparedWidget,
  homeWithDeliveringWidget,
  homeWithNextToDeliveryWidget,
  homeWithDeliveredWidget,
  homeWithDeliveredAndRatedWidget,
  homeWithPaymentIssueWidget,
  homeWithUserUnreachableWidget,
  homeWithDelayedWidget,
  homeWithBanner,
  homeWithMultipleBanners,
  homeWithGrid,
  homeWithPackProduct,
  homeWithRecommendations,
  englishHomeWithRecommendations,
  homeWithCarousel,
  homeWithLimitedProducts,
  homeWithProductFormats,
  homeWithGridAndProductNotAvailableInMad,
  homeWithBannerProduct,
  homeWithPreparedNotPaidWidget,
  homeWithPackProductWithDrainedWeight,
  homeWithHighlightedGroup,
  homeWithVideoSection,
  homeWithVideoSectionWithManyProducts,
  homeWithVideoSectionWithThreeProducts,
}
