export interface SpotifyStatePayload {
  context: 'dashboard' | 'login';
  userId?: string;
}

export function encodeState(userId?: string): string {
  const payload: SpotifyStatePayload = {
    context: userId ? 'dashboard' : 'login',
    userId
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeState(raw: string): SpotifyStatePayload {
  const json = Buffer.from(raw, 'base64url').toString('utf-8');
  return JSON.parse(json) as SpotifyStatePayload;
}
