export type AuthRedirectState = {
  from?: string
}

export function getAuthRedirectPath(state: unknown): string {
  const from = (state as AuthRedirectState | null)?.from
  if (typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')) {
    return from
  }
  return '/'
}

export function authLoginState(from: string): AuthRedirectState {
  return { from }
}
