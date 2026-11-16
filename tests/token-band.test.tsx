import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'token-band',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 9 },
    view: {},
  },
} as const

test('a measurement after a turn shows in the band, on every surface', async ($, on) => {
  // Nothing sits beneath the plugin: each hook here stands for the engine.
  on('session.measure', (_, e) => ({ changed: e.changed }))

  await $.session.measure({
    context: { tokens: 439_900, window: 1_000_000, percent: 44 },
    rateLimits: [],
    cost: { usd: 14.5 },
    changed: ['context', 'cost'],
  })

  for (const surface of ['terminal', 'desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface })
    const row = await ui.find({ type: 'Text', text: /Tokens/ })

    expect(row?.text).toBe('Tokens: 439.9k / 1.00M (44%) · $14.50')
    await ui.unmount()
  }
})

test('a resumed session shows its figures from the start', async ($, on) => {
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('session.usage', () => ({
    value: {
      startedAt: 0,
      context: { tokens: 52_300, window: 200_000, percent: 26 },
      rateLimits: [],
      cost: { usd: 0.8 },
    },
  }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

  expect((await ui.find({ type: 'Text', text: /Tokens/ }))?.text).toBe(
    'Tokens: 52.3k / 200.0k (26%) · $0.80',
  )
  await ui.unmount()
})

test('a tool call mid-turn moves the figures', async ($, on) => {
  on('tool.call', () => ({ result: {} }))
  on('session.usage', () => ({
    value: {
      startedAt: 0,
      context: { tokens: 612_400, window: 1_000_000, percent: 61 },
      rateLimits: [],
      cost: { usd: 20.1 },
    },
  }))

  await $.tool.call({ tool: 'Bash', command: 'ls' })

  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

  expect((await ui.find({ type: 'Text', text: /Tokens/ }))?.text).toBe(
    'Tokens: 612.4k / 1.00M (61%) · $20.10',
  )
  await ui.unmount()
})

test('before the first response the window still shows', async ($, on) => {
  on('session.measure', (_, e) => ({ changed: e.changed }))

  await $.session.measure({
    context: { window: 1_000_000 },
    rateLimits: [],
    cost: { usd: 0 },
    changed: ['cost'],
  })

  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

  expect((await ui.find({ type: 'Text', text: /Tokens/ }))?.text).toBe(
    'Tokens: — / 1.00M · $0.00',
  )
  await ui.unmount()
})

test('with no figures yet, or a survey up, the band is left to the engine', async ($, on) => {
  on('session.measure', (_, e) => ({ changed: e.changed }))
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)

    return <Text>engine</Text>
  })

  const empty = await $.ui.mount({ ...BAND, surface: 'desktop' })

  expect((await empty.find({ type: 'Text' }))?.text).toBe('engine')
  await empty.unmount()

  await $.session.measure({
    context: { tokens: 1_000, window: 200_000, percent: 1 },
    rateLimits: [],
    cost: { usd: 0.01 },
    changed: ['context'],
  })

  const survey = await $.ui.mount({
    ...BAND,
    props: { ...BAND.props, hasSurvey: true },
    surface: 'desktop',
  })

  expect((await survey.find({ type: 'Text' }))?.text).toBe('engine')
  await survey.unmount()
})
