import { render } from 'react-dom'

import { App } from './app'
import { AppConfig } from './config'
import './polyfills'
import { monitoring } from 'monitoring'
import 'normalize.css'

import { MOAnalytics } from 'services/mo-analytics'

import './system-ui/styles/index.css'

monitoring.init()
MOAnalytics.init(AppConfig.MO_ANALYTICS_URL)

render(<App />, document.getElementById('root'))
