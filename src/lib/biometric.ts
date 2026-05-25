const CRED_KEY     = 'su_biometric_cred'
const EMAIL_KEY    = 'su_biometric_email'
const NAME_KEY     = 'su_biometric_name'
const UNLOCKED_KEY = 'su_session_unlocked'
const HIDDEN_KEY   = 'su_hidden_at'
const RELOCK_MS    = 5 * 60 * 1000

export function getBiometricEmail(): string { return localStorage.getItem(EMAIL_KEY) ?? '' }
export function getBiometricName(): string  { return localStorage.getItem(NAME_KEY)  ?? '' }
export function isBiometricEnrolled(): boolean { return !!localStorage.getItem(CRED_KEY) }

export function setUserInfo(email: string, name: string) {
  localStorage.setItem(EMAIL_KEY, email)
  localStorage.setItem(NAME_KEY, name)
}

export function isSessionUnlocked(): boolean {
  return sessionStorage.getItem(UNLOCKED_KEY) === '1'
}
export function markSessionUnlocked() {
  sessionStorage.setItem(UNLOCKED_KEY, '1')
  sessionStorage.removeItem(HIDDEN_KEY)
}
export function lockSession() {
  sessionStorage.removeItem(UNLOCKED_KEY)
}
export function recordHiddenAt() {
  if (isSessionUnlocked()) sessionStorage.setItem(HIDDEN_KEY, Date.now().toString())
}
export function shouldRelockAfterBackground(): boolean {
  const ts = parseInt(sessionStorage.getItem(HIDDEN_KEY) ?? '0', 10)
  return ts > 0 && Date.now() - ts > RELOCK_MS
}

export function clearBiometric() {
  localStorage.removeItem(CRED_KEY)
}

export async function canUseBiometric(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) return false
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch { return false }
}

export async function registerBiometric(userId: string, displayName: string): Promise<boolean> {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32))
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'Suivi', id: window.location.hostname },
        user: {
          id: new TextEncoder().encode(userId),
          name: displayName,
          displayName,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
      },
    }) as PublicKeyCredential | null
    if (!cred) return false
    localStorage.setItem(CRED_KEY, btoa(String.fromCharCode(...new Uint8Array(cred.rawId))))
    return true
  } catch { return false }
}

export async function verifyBiometric(): Promise<boolean> {
  const stored = localStorage.getItem(CRED_KEY)
  if (!stored) return false
  try {
    const idBytes = Uint8Array.from(atob(stored), c => c.charCodeAt(0))
    const challenge = crypto.getRandomValues(new Uint8Array(32))
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname,
        allowCredentials: [{ id: idBytes, type: 'public-key', transports: ['internal'] as AuthenticatorTransport[] }],
        userVerification: 'required',
        timeout: 60000,
      },
    })
    return !!assertion
  } catch { return false }
}
