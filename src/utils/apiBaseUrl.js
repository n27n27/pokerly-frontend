const DEFAULT_NATIVE_API_BASE_URL = 'https://pokerly.kr/api'

export const isNativeAppOrigin = ({ protocol = '', hostname = '' } = {}) =>
  protocol === 'capacitor:' || (protocol === 'https:' && hostname === 'localhost')

export const resolveApiBaseUrl = ({
  configuredBaseUrl,
  nativeBaseUrl = DEFAULT_NATIVE_API_BASE_URL,
  location = {},
} = {}) => {
  if (isNativeAppOrigin(location) && (!configuredBaseUrl || configuredBaseUrl.startsWith('/'))) {
    return nativeBaseUrl
  }

  return configuredBaseUrl
}
