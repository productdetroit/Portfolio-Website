/**
 * ⚠️  PLACEHOLDER — MUST BE REPLACED BEFORE DNS CUTOVER (PDW-10).
 *
 * productdetroit.com/messaging-terms and /privacy are cited in TopHand's
 * Twilio toll-free SMS registration. These routes must return 200 with the
 * real policy text at the identical paths, or SMS delivery is at risk.
 *
 * The current live copy is NOT in the static index.html that was ported —
 * it lives on the Google Sites property. Copy it across verbatim, then
 * delete `isPlaceholder`.
 */
export const legal = {
  messagingTerms: {
    title: "Messaging Terms & Conditions",
    updated: "TODO",
    isPlaceholder: true,
    body: [
      "TODO — paste the live messaging terms from the current Google Sites page verbatim.",
      "Must retain: program description, message frequency, message and data rates disclosure, HELP and STOP instructions, carrier liability language, and the support contact.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "TODO",
    isPlaceholder: true,
    body: [
      "TODO — paste the live privacy policy from the current Google Sites page verbatim.",
      "Must retain: data collected, purpose of processing, the subprocessors table (Twilio, Pendo, Neon, Vercel), retention, and the contact for data requests.",
    ],
  },
} as const;
