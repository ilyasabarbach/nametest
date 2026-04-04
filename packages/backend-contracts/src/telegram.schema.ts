import type { ArtifactRemixTemplate } from "./artifactRemix.schema";

export type TelegramMiniAppUser = {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  photoUrl?: string;
};

export type TelegramInitDataVerifyRequest = {
  initDataRaw: string;
};

export type TelegramInitDataVerifyResponse = {
  status: "verified" | "unverified" | "invalid";
  startParam?: string;
  user?: TelegramMiniAppUser;
};

export type TelegramStartAppState = {
  version: 1;
  testId: string;
  feedItemId?: string;
  template?: ArtifactRemixTemplate;
  resultKey?: string;
};

export type TelegramStartAppResolveResponse = {
  status: "ok" | "invalid";
  state?: TelegramStartAppState;
};

export type TelegramPrepareShareRequest = {
  text: string;
  title?: string;
  imageDataUrl?: string;
  filename?: string;
  userId?: string;
  state: TelegramStartAppState;
};

export type TelegramPrepareShareResponse = {
  status: "ok";
  deepLinkUrl: string;
  shareUrl: string;
  shareText: string;
  messageId?: string;
  storyMediaUrl?: string;
  storyWidgetLinkUrl?: string;
  storyWidgetLinkName?: string;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

export function isTelegramInitDataVerifyRequest(value: unknown): value is TelegramInitDataVerifyRequest {
  return isObjectRecord(value) && typeof value.initDataRaw === "string";
}

export function isTelegramInitDataVerifyResponse(value: unknown): value is TelegramInitDataVerifyResponse {
  return isObjectRecord(value) && ["verified", "unverified", "invalid"].includes(String(value.status));
}

export function isTelegramStartAppResolveResponse(value: unknown): value is TelegramStartAppResolveResponse {
  return isObjectRecord(value) && ["ok", "invalid"].includes(String(value.status));
}

export function isTelegramPrepareShareRequest(value: unknown): value is TelegramPrepareShareRequest {
  return isObjectRecord(value) && typeof value.text === "string" && isObjectRecord(value.state) && typeof value.state.testId === "string";
}

export function isTelegramPrepareShareResponse(value: unknown): value is TelegramPrepareShareResponse {
  return (
    isObjectRecord(value) &&
    value.status === "ok" &&
    typeof value.deepLinkUrl === "string" &&
    typeof value.shareUrl === "string" &&
    typeof value.shareText === "string"
  );
}
