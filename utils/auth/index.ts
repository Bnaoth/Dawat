// Reverted: Amplify removed

export enum AUTH_ERRORS {
  UNKNOWN = 'UNKNOWN',
}

function mapAmplifyError(): AUTH_ERRORS {
  return AUTH_ERRORS.UNKNOWN;
}

export async function signInWithHostedUI() {
  return { ok: false, error: AUTH_ERRORS.UNKNOWN };
}

export async function signIn() {
  return { ok: false, error: AUTH_ERRORS.UNKNOWN };
}

export async function signUp() {
  return { ok: false, error: AUTH_ERRORS.UNKNOWN };
}

export async function confirmSignUp() {
  return { ok: false, error: AUTH_ERRORS.UNKNOWN };
}

export async function signOut() {
  return { ok: false, error: AUTH_ERRORS.UNKNOWN };
}

export async function getCurrentUser() {
  return { ok: false, error: AUTH_ERRORS.UNKNOWN };
}
