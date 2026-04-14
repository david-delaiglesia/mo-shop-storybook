export const getNumericAppVersion = (
  appVersion: ImportMetaEnv['VITE_APP_VERSION'],
): string => {
  if (!appVersion.startsWith('v')) {
    return appVersion
  }

  const cleanedVersion = appVersion.split('v')[1].split('-canary')[0]
  return cleanedVersion
}
