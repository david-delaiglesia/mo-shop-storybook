import { Link, useHistory } from 'react-router-dom'

import classNames from 'classnames'
import { monitoring } from 'monitoring'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { VideoSectionMetrics } from 'app/catalog/VideoSectionMetrics'
import { ProductImpression } from 'app/catalog/components/product-impression/ProductImpression'
import { useWindowWidth } from 'app/catalog/components/product-impression/useWindowWidth'
import {
  HOME_SECTION_TYPES,
  LAYOUTS,
  sendHomeSectionClickMetrics,
} from 'app/catalog/metrics'
import { HomeSectionLayout } from 'app/home/interfaces/HomeSectionLayout'
import { ProductMetricsContext } from 'app/shared/product-metrics-context'
import { VideoSectionProductCardSwitch } from 'components/video-section/VideoSectionProductCard'
import { useVideoMetrics } from 'components/video-section/useVideoMetrics'
import { useVideoMirror } from 'components/video-section/useVideoMirror'
import { interpolateApiPathSections } from 'pages/routing'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { TAB_INDEX } from 'utils/constants'

import './VideoSection.css'

interface VideoSectionProps {
  title: string
  subtitle: string
  webVideoUrl: string
  apiPath: string
  apiPathText: string
  source: string
  sourceCode: string
  products: string[]
  sectionPosition: number
}

export const VideoSection = ({
  title,
  subtitle,
  webVideoUrl,
  apiPath,
  apiPathText,
  source,
  sourceCode,
  products,
  sectionPosition,
}: VideoSectionProps) => {
  const history = useHistory()
  const { sectionRef, videoRef, mirrorRef } = useVideoMirror()
  const { handleLoadStart, handleCanPlay } = useVideoMetrics({
    sectionRef,
    source,
  })
  const sectionPath = `${interpolateApiPathSections(apiPath)}?home_section_type=${HOME_SECTION_TYPES.VIDEO_SECTION}`

  const isHomeSectionWithoutSubtitleEnabled = useFlag(
    knownFeatureFlags.WEB_HOME_SECTION_WITHOUT_SUBTITLE,
  )

  const handleVideoError = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget
    monitoring.captureError(
      // @ts-expect-error -- Error cause option requires ES2022 lib, remove when tsconfig is updated
      new Error('[VideoSection] video load failed', {
        cause: { networkState: video.networkState, error: video.error?.code },
      }),
    )
  }

  const handleVideoClick = () => {
    const second = Math.round(videoRef.current?.currentTime ?? 0)
    VideoSectionMetrics.videoSectionVideoClick({ second, source })
    history.push(interpolateApiPathSections(apiPath))
  }

  const sendClickMetrics = () => {
    sendHomeSectionClickMetrics({
      id: undefined,
      title,
      campaignId: source,
      homeSectionType: HOME_SECTION_TYPES.VIDEO_SECTION,
    })
  }
  const { width } = useWindowWidth()

  const maxVisibleProducts = width < 1200 ? 2 : 3
  const shouldShowViewMoreProductsLink = products.length > maxVisibleProducts

  return (
    <section ref={sectionRef} className="section-video">
      <div className="video-section__header">
        <div>
          <h2
            className={classNames('headline1-b', {
              'video-section__title': subtitle,
              'video-section__title-no-subtitle':
                isHomeSectionWithoutSubtitleEnabled && !subtitle,
            })}
            tabIndex={TAB_INDEX.ENABLED}
          >
            {title}
          </h2>
          <p className="video-section__subtitle footnote1-r">{subtitle}</p>
        </div>

        {shouldShowViewMoreProductsLink && (
          <Link
            className="video-section__link"
            to={sectionPath}
            onClick={sendClickMetrics}
          >
            {apiPathText}
            <Icon icon="chevron-right" />
          </Link>
        )}
      </div>

      <div className="video-section__video-wrapper">
        <video
          className="video-section__video"
          ref={videoRef}
          autoPlay
          muted
          loop
          src={webVideoUrl}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
          onError={handleVideoError}
          onClick={handleVideoClick}
        />

        <div className="video-section__products-area">
          <canvas
            ref={mirrorRef}
            className="video-section__mirror"
            aria-hidden="true"
          />
          <ProductMetricsContext.Provider
            value={{
              sourceCode,
              source,
              layout: LAYOUTS.VIDEO,
              sectionPosition,
            }}
          >
            <div className="video-section__products">
              {products.slice(0, 3).map((productId, index) => (
                <ProductImpression
                  key={productId}
                  productId={productId}
                  order={index}
                  source={source}
                  layout={HomeSectionLayout.VIDEO}
                  sectionPosition={sectionPosition}
                >
                  <VideoSectionProductCardSwitch
                    key={productId}
                    productId={productId}
                    order={index}
                  />
                </ProductImpression>
              ))}
            </div>
          </ProductMetricsContext.Provider>
        </div>
      </div>

      <hr className="video__separator" />
    </section>
  )
}
