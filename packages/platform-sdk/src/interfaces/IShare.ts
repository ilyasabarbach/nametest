export type SharePayload = {
  text: string;
  title?: string;
  imageDataUrl?: string;
  filename?: string;
};

export interface IShare {
  share(payload: SharePayload): Promise<void>;
}
