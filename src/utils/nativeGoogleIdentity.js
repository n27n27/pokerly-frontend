import { SocialLogin } from '@capgo/capacitor-social-login'

let initialized = false

const GOOGLE_WEB_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GOOGLE_IOS_CLIENT_ID = import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID

const requireGoogleClientIds = () => {
  if (!GOOGLE_WEB_CLIENT_ID || !GOOGLE_IOS_CLIENT_ID) {
    throw new Error('GOOGLE_NATIVE_CLIENT_ID_MISSING')
  }
}

export const loginWithNativeGoogle = async () => {
  requireGoogleClientIds()

  if (!initialized) {
    await SocialLogin.initialize({
      google: {
        webClientId: GOOGLE_WEB_CLIENT_ID,
        iOSClientId: GOOGLE_IOS_CLIENT_ID,
        iOSServerClientId: GOOGLE_WEB_CLIENT_ID,
        mode: 'online',
      },
    })
    initialized = true
  }

  const response = await SocialLogin.login({
    provider: 'google',
    options: { scopes: ['email', 'profile'] },
  })
  const idToken = response.result?.idToken

  if (!idToken) throw new Error('GOOGLE_NATIVE_ID_TOKEN_MISSING')
  return idToken
}

export const logoutFromNativeGoogle = async () => {
  requireGoogleClientIds()

  if (!initialized) {
    await SocialLogin.initialize({
      google: {
        webClientId: GOOGLE_WEB_CLIENT_ID,
        iOSClientId: GOOGLE_IOS_CLIENT_ID,
        iOSServerClientId: GOOGLE_WEB_CLIENT_ID,
        mode: 'online',
      },
    })
    initialized = true
  }

  await SocialLogin.logout({ provider: 'google' })
}
