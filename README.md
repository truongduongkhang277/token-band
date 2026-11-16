# token-band

A Claude Code mod that shows the session's context tokens, context window and cost in a band above the prompt:

```
Tokens: 439.9k / 1.00M (44%) · $14.50
```

The figures update after each turn and after each tool call. A resumed session shows its figures from the start.

## Install

At the prompt of a Claude Code session in a terminal:

```
/plugin install token-band --marketplace truongduongkhang277/token-band
```

Answer `y` to add the marketplace, then press Enter to pick the user scope.

From a shell:

```
claude plugin install token-band --marketplace truongduongkhang277/token-band
```

In the desktop app, where `/plugin` does not run:
1. Click + next to the prompt box, then Plugins.
2. Add the marketplace `truongduongkhang277/token-band`.
3. Add the plugin.

## Development

```
claude plugin validate .
claude plugin test .
```

## Tiếng Việt

Mod cho Claude Code. Nó hiện số token context, cỡ cửa sổ context và chi phí của phiên trong một dải phía trên ô nhập.

Cài trong terminal: gõ `/plugin install token-band --marketplace truongduongkhang277/token-band` trong một phiên Claude Code. Trả lời `y` để thêm marketplace, rồi chọn phạm vi.

Cài trong app desktop:
1. Bấm + cạnh ô nhập, rồi chọn Plugins.
2. Thêm marketplace `truongduongkhang277/token-band`.
3. Thêm plugin.
