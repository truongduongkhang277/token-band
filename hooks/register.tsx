import { atom, read, update } from 'claude-code'
import type {
  EngineInterface,
  Register,
  SessionContextUsage,
  SessionCost,
} from 'claude-code'

import type { Usage } from '../types'

const usage = atom({ plugin: 'token-band', key: 'usage' } as const, null)

function toUsage(
  context: SessionContextUsage,
  cost: SessionCost | undefined,
): Usage {
  return {
    tokens: context.tokens ?? null,
    window: context.window,
    percent: context.percent ?? null,
    usd: cost?.usd ?? null,
  }
}

// 439_900 -> "439.9k", 1_000_000 -> "1.00M"
function compact(n: number): string {
  if (n >= 999_950) {
    return `${(n / 1_000_000).toFixed(2)}M`
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1)}k`
  }
  return String(n)
}

// "Tokens: 439.9k / 1.00M (44%) · $14.50"
function line(u: Usage): string {
  const used = u.tokens === null ? '—' : compact(u.tokens)
  const percent = u.percent === null ? '' : ` (${u.percent}%)`
  const cost = u.usd === null ? '' : ` · $${u.usd.toFixed(2)}`

  return `Tokens: ${used} / ${compact(u.window)}${percent}${cost}`
}

async function refresh($: EngineInterface): Promise<void> {
  try {
    const now = await $.session.usage()
    await update($, usage, () => toUsage(now.context, now.cost))
  } catch {
    // The band keeps its last figures; the next measurement brings new ones.
  }
}

export const register: Register = on => {
  // A resumed session, or a reload of this mod, shows its figures at once.
  on('session.start', async ($, e, next) => {
    await refresh($)

    return next(e)
  })

  // After each main-thread turn: the figures the status line reads.
  on('session.measure', async ($, e, next) => {
    await update($, usage, () => toUsage(e.context, e.cost))

    return next(e)
  })

  // Mid-turn: a tool call follows a model response, so a long turn moves too.
  // It never judges the call: should it fail, the call goes on untouched.
  on('tool.call', async ($, e, next) => {
    await refresh($)

    return next(e)
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const u = await read($, usage)

    if (e.props.hasSurvey || u === null) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box>
        <Text dimColor>{line(u)}</Text>
      </Box>
    )
  })
}
