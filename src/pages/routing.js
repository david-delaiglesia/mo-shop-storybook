import { matchPath } from 'react-router'

import { PATHS } from 'pages/paths'

const PATH_SEPARATOR = '/'
const PARAM_IDENTIFIER = ':'
const OPTIONAL_IDENTIFIER = '?'

const getParamKey = (rawParam) =>
  rawParam.replace(PARAM_IDENTIFIER, '').replace(OPTIONAL_IDENTIFIER, '')
const removeOptionalParamsNotInterpolated = (param) => param !== undefined

/**
 * @deprecated Use `generatePath` from `react-router` instead
 */
export function interpolatePath(path, params = {}) {
  if (!path) return

  const pathSegments = path.split(PATH_SEPARATOR)

  const interpolatedSegments = pathSegments.map((pathSection) => {
    const isParam = pathSection.startsWith(PARAM_IDENTIFIER)

    if (isParam) {
      const key = getParamKey(pathSection)
      return params[key]
    }

    return pathSection
  })

  const interpolatedPath = interpolatedSegments
    .filter(removeOptionalParamsNotInterpolated)
    .join(PATH_SEPARATOR)

  return interpolatedPath
}

export function interpolateApiPathSections(apiPath, valueToSplit = '/home') {
  const apiPathSplitted = apiPath.split(valueToSplit)

  const sectionPath = apiPathSplitted[apiPathSplitted.length - 1]

  return `${valueToSplit}${sectionPath}`
}

export function getRoutePathName(path, routing = PATHS) {
  const pathFound = Object.entries(routing).find(([pathname]) =>
    comparePath(path, pathname),
  )

  return pathFound && pathFound[1]
}

export function comparePath(firstPath, secondPath, exact = true) {
  const match = matchPath(firstPath, { path: secondPath })

  if (!match) return
  if (!exact) return true

  return match.isExact
}
