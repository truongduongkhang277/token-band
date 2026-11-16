// The figures the band draws, as the status line has them; null where the
// engine has none yet (before the first response, or with no cost ledger).
export type Usage = {
  tokens: number | null
  window: number
  percent: number | null
  usd: number | null
}

declare module 'claude-code' {
  interface PluginState {
    'token-band': { usage: Usage | null }
  }
}
