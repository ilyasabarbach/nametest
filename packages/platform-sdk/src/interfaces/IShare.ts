export type SharePayload = {
  text: string;
  title?: string;
  imageDataUrl?: string;
  filename?: string;
  linkUrl?: string;
  telegramShareUrl?: string;
  telegramMessageId?: string;
  storyMediaUrl?: string;
  storyWidgetLinkUrl?: string;
  storyWidgetLinkName?: string;
  storyText?: string;
};

export interface IShare {
  share(payload: SharePayload): Promise<void>;
  canShareToStory?(): boolean;
  shareToStory?(payload: SharePayload): Promise<void>;
}
