import { Helmet } from 'react-helmet'
import { Provider } from 'react-redux'
import { Redirect, Route, Router, Switch } from 'react-router-dom'

import { ConfigProvider } from './services/config-provider'
import { createBrowserHistory } from 'history'

import { AccessibilityFeedbackProvider } from 'app/accessibility'
import { AuthInitializer } from 'app/authentication/components/auth-initializer'
import { CartItemRemoved } from 'app/cart/components/cart-item-removed/CartItemRemoved'
import CartContainer from 'app/cart/containers/cart-container'
import { ProductModal } from 'app/catalog/components/product-modal'
import { ChatContainer } from 'app/chat/containers/chat-container'
import { DeliveryAreaContainer } from 'app/delivery-area/containers/delivery-area-container'
import { OnboardingContainer } from 'app/delivery-area/containers/onboarding-container'
import { I18nProvider } from 'app/i18n/containers/i18n-provider'
import { createReduxStore } from 'app/redux'
import { AccessibilityHandler } from 'app/shared/accessibility-handler'
import { Alert } from 'app/shared/alert/components/alert'
import { IEBlocker } from 'app/shared/ie-blocker'
import { ModalProvider } from 'app/shared/modal'
import { SkipLinkToContent } from 'app/shared/skip-link'
import { HeaderSwitch } from 'components/header-switch'
import { CookieBannerContainer } from 'containers/cookie-banner-container'
import MobileBlockerContainer from 'containers/mobile-blocker-container'
import NotificationsContainer from 'containers/notifications-container'
import { OfflineInspectorContainer } from 'containers/offline-inspector-container'
import OverlayContainer from 'containers/overlay-container'
import { NetworkErrorHandler } from 'errors/NetworkErrorHandler'
import { PATHS } from 'pages/paths'
import { rootRoutes } from 'pages/routes'
import { CleanOngoingCart } from 'services/clean-ongoing-cart'
import { ErrorBoundary } from 'services/error-boundary'
import {
  FeatureFlagFetchByRoute,
  FeatureFlagsProvider,
} from 'services/feature-flags'
import { EventsAuthConnector } from 'services/mo-analytics/EventsAuthConnector'
import { SystemUiConfigProvider } from 'system-ui/SystemUiConfigProvider'
import RouteHandler from 'wrappers/route-handler/RouteHandler'

export const history = createBrowserHistory()

const routesName = Object.keys(rootRoutes)
const { VITE_WEBSITE_NAME, VITE_WEBSITE_DESCRIPTION } = import.meta.env

const App = () => {
  return (
    <Provider store={createReduxStore()}>
      <FeatureFlagsProvider>
        <ErrorBoundary>
          <EventsAuthConnector />
          <I18nProvider>
            <SystemUiConfigProvider>
              <AccessibilityFeedbackProvider>
                <ConfigProvider />
                <Router history={history}>
                  <FeatureFlagFetchByRoute />
                  <Helmet>
                    <meta
                      property="og:url"
                      content="https://tienda.mercadona.es"
                    />
                    <meta
                      property="og:image"
                      content="https://tienda.mercadona.es/web-display-img.png"
                    />
                    <meta property="og:title" content={VITE_WEBSITE_NAME} />
                    <meta
                      property="og:description"
                      content={VITE_WEBSITE_DESCRIPTION}
                    />
                    <title>{VITE_WEBSITE_NAME}</title>
                    <meta
                      name="description"
                      content={VITE_WEBSITE_DESCRIPTION}
                    />
                  </Helmet>
                  <CleanOngoingCart />
                  <IEBlocker />
                  <AccessibilityHandler />
                  <SkipLinkToContent />
                  <ChatContainer>
                    <MobileBlockerContainer>
                      <OnboardingContainer>
                        <RouteHandler>
                          <ModalProvider>
                            <AuthInitializer>
                              <CookieBannerContainer />
                              <Alert />
                              <NotificationsContainer />
                              <OfflineInspectorContainer />
                              <NetworkErrorHandler />
                              <HeaderSwitch />
                              <Switch>
                                {routesName.map((route) => (
                                  <Route key={route} {...rootRoutes[route]} />
                                ))}

                                <Redirect from="*" to={PATHS.NOT_FOUND} />
                              </Switch>

                              <CartItemRemoved />
                              <OverlayContainer position="right">
                                <CartContainer />
                              </OverlayContainer>
                              <DeliveryAreaContainer />
                              <ProductModal />
                            </AuthInitializer>
                          </ModalProvider>
                        </RouteHandler>
                      </OnboardingContainer>
                    </MobileBlockerContainer>
                  </ChatContainer>
                </Router>
              </AccessibilityFeedbackProvider>
            </SystemUiConfigProvider>
          </I18nProvider>
        </ErrorBoundary>
      </FeatureFlagsProvider>
    </Provider>
  )
}

export { App }
