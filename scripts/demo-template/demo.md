---
title: Product name — what this demo shows
summary: One sentence under the title. What they'll see and what they can try.
updated: 2026-09-19
# Filename of the walkthrough video sitting next to this file. Delete the
# line for a demo with no video.
video: walkthrough.mp4
# Who may open this demo. Full addresses, or a bare @domain for everyone
# at that company. Owners (DEMO_OWNER_EMAILS) always can.
access:
  - ana@example.com
  - "@example.com"
# Buttons above the write-up. https:// only.
links:
  - label: Open the live app
    href: https://example.com
  - label: MCP endpoint
    href: https://example.com/mcp
---

## What you're looking at

Two or three sentences of context: what the product does, what stage it's
at, and what to pay attention to in the video.

## Try it yourself

1. Open the live app with the button above and sign in with the credentials
   below.
2. Do the thing the video shows.
3. Then try breaking it.

| | |
|---|---|
| Username | `demo@example.com` |
| Password | `sent separately` |

## Connect the MCP

Add this to your client's MCP config:

```json
{
  "mcpServers": {
    "product": { "url": "https://example.com/mcp" }
  }
}
```

## What I'd love to hear

- Where did the flow feel wrong?
- What would you need to see before using this for real?
