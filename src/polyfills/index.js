import 'react-app-polyfill/ie9'

import './randomUUID'
import 'core-js/features/array/find'
import 'core-js/features/array/find-index'
import 'core-js/features/array/includes'
import 'core-js/features/object/entries'
import 'core-js/features/object/values'
import 'core-js/features/string/ends-with'
import 'core-js/features/string/includes'
import 'core-js/features/string/repeat'
import 'core-js/features/string/starts-with'
import 'core-js/features/string/trim-start'
import 'core-js/features/symbol/iterator'
import cssVars from 'css-vars-ponyfill'
import smoothscroll from 'smoothscroll-polyfill'
import 'url-search-params-polyfill'

smoothscroll.polyfill()
cssVars()
