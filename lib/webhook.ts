import crypto from "crypto";

export function validateWebhookSignature(
  body: string,
  signature: string | undefined,
  appSecret: string
): boolean {
  if (!signature) return false;

  const hash = crypto
    .createHmac("sha256", appSecret)
    .update(body)
    .digest("hex");

  const expected = `sha256=${hash}`;
  return signature === expected;
}

export function matchesKeyword(text: string, keywords: string[], matchType: "contains" | "exact" | "any"): boolean {
  const lowerText = text.toLowerCase().trim();

  if (matchType === "any") {
    return keywords.length > 0;
  }

  return keywords.some((keyword) => {
    const lowerKeyword = keyword.toLowerCase().trim();
    if (matchType === "exact") {
      return lowerText === lowerKeyword;
    }
    return lowerText.includes(lowerKeyword);
  });
}

export function parseInstagramMessage(value: any) {
  return {
    from: value.from || null,
    message: value.message || null,
    comment_id: value.comment_id || null,
    post_id: value.post_id || null,
    recipient: value.recipient || null,
    reply_to: value.reply_to || null,
  };
}
