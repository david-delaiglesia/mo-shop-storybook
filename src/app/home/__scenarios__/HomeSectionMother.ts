import { HomeSection, HomeSectionLayout } from '../interfaces'

import { OrderResponse } from 'app/order'
import { ProductMother } from 'app/products/__scenarios__/ProductMother'

export const HomeSectionMother = {
  gridNews: (): HomeSection => ({
    layout: HomeSectionLayout.GRID,
    content: {
      title: 'Novedades',
      subtitle: 'Productos recién añadidos o mejorados',
      api_path: '/home/new_arrivals/',
      source: 'new_arrivals',
      source_code: 'NA',
      items: [ProductMother.yakisobaNoodles()],
    },
  }),

  highlightedGroupWithoutSubtitle: (): HomeSection => ({
    layout: HomeSectionLayout.HIGHLIGHTED_GROUP,
    content: {
      title: 'Dos productos destacados',
      items: [
        {
          web_image_url:
            'https://sta-mercadona.imgix.net/images/26db68648970f989049016e551611aa9.jpg?',
          mobile_image_url:
            'https://sta-mercadona.imgix.net/images/4cf03f082ecc8a8635f24af5bc3f2d36.jpg?',
          product: ProductMother.yakisobaNoodles(),
        },
        {
          web_image_url:
            'https://sta-mercadona.imgix.net/images/4cf03f082ecc8a8635f24af5bc3f2d36.jpg?',
          mobile_image_url:
            'https://sta-mercadona.imgix.net/images/4cf03f082ecc8a8635f24af5bc3f2d36.jpg?',
          product: ProductMother.yakisobaNoodles(),
        },
      ],
      source: 'vlc1-mad1-dos-productos-destacados',
      source_code: 'HLG',
    },
  }),

  highlightedProductWithoutSubtitle: (): HomeSection => ({
    layout: HomeSectionLayout.HIGHLIGHTED,
    content: {
      title: 'Es tendencia',
      web_image_url:
        'https://sta-mercadona.imgix.net/images/26db68648970f989049016e551611aa9.jpg?',
      mobile_image_url:
        'https://sta-mercadona.imgix.net/images/4cf03f082ecc8a8635f24af5bc3f2d36.jpg?',
      source: 'producto-destacado',
      source_code: 'HL',
      items: [ProductMother.yakisobaNoodles()],
    },
  }),

  carouselWithoutSubtitle: (): HomeSection => ({
    layout: HomeSectionLayout.CAROUSEL,
    content: {
      title: 'Novedades',
      api_path: '/customers/1/home/new-arrivals/',
      api_path_text: 'Ver todas las novedades',
      source: 'new-arrivals',
      source_code: 'NA',
      items: [ProductMother.yakisobaNoodles()],
    },
  }),

  widgetOrders: (orders: OrderResponse[]): HomeSection => ({
    layout: HomeSectionLayout.WIDGET,
    content: {
      title: 'Próxima entrega',
      items: orders.map(
        ({
          id,
          start_date,
          end_date,
          status_ui,
          payment_status,
          timezone,
          changes_until,
          service_rating_token,
          warehouse_code,
          rescheduled_order,
        }) => ({
          id,
          start_date,
          end_date,
          status_ui,
          payment_status,
          timezone,
          changes_until,
          service_rating_token,
          warehouse_code,
          rescheduled_order,
        }),
      ),
    },
  }),
}
