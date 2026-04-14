import { Component, ComponentType, FunctionComponent } from 'react'

import { I18nClient } from '../../client'
import { ReactOptions, TFunction } from 'i18next'

interface WithTranslateState {
  lastChangeWasMadeAt: Date | null
}

export function withTranslate<ComponentProps>(
  WrappedComponent:
    | ComponentType<ComponentProps>
    | FunctionComponent<ComponentProps>,
) {
  class WithTranslate extends Component<
    Omit<ComponentProps, 't'>,
    WithTranslateState
  > {
    readonly state: WithTranslateState = {
      lastChangeWasMadeAt: null,
    }

    private readonly i18n = I18nClient.getInstance()
    private readonly options: ReactOptions & { eventsToListen?: string[] } =
      this.getOptions()
    private translate: (key: string, options?: object) => string
    private mounted = false

    constructor(props: Omit<ComponentProps, 't'>) {
      super(props)

      this.onI18nChanged = this.onI18nChanged.bind(this)
      this.getI18nTranslate = this.getI18nTranslate.bind(this)
      this.translate = this.getTranslation.bind(this, this.getI18nTranslate())
    }

    componentDidMount() {
      this.mounted = true
      this.bindEvents()
    }

    componentWillUnmount() {
      this.mounted = false
      if (!this.onI18nChanged) {
        return
      }

      const events = this.options.eventsToListen
      if (!events) {
        return
      }

      events.forEach((event) => this.i18n.off(event, this.onI18nChanged))
    }

    bindEvents() {
      const events = this.options.eventsToListen
      if (!events || !this.i18n) {
        return
      }

      this.i18n.on(events.join(' '), this.onI18nChanged)
    }

    getOptions() {
      if (!this.i18n || !this.i18n.options || !this.i18n.options.react) {
        return {}
      }

      return this.i18n.options.react
    }

    onI18nChanged() {
      if (!this.mounted) {
        return
      }

      this.translate = this.getTranslation.bind(this, this.getI18nTranslate())
      this.setState({ lastChangeWasMadeAt: new Date() })
    }

    getI18nTranslate() {
      return this.i18n.getFixedT(this.i18n.language)
    }

    getTranslation(
      t: TFunction,
      translatable: string | { key: string; interpolation?: object },
      interpolation?: object,
    ) {
      if (typeof translatable === 'object') {
        return this.getTranslationFromTranslatable(translatable, t)
      }

      return t(translatable, interpolation)
    }

    getTranslationFromTranslatable(
      translatable: { key: string; interpolation?: object },
      t: TFunction,
    ) {
      return t(translatable.key, translatable.interpolation)
    }

    render() {
      return (
        <WrappedComponent
          {...(this.props as ComponentProps)}
          t={this.translate}
        />
      )
    }
  }

  return WithTranslate
}
