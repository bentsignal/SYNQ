export type WifiBridgeRequest = {
  postData?: unknown;
};

export type WifiBridgeResponse = {
  html: (html: string) => void;
  json: (payload: object, status?: number) => unknown;
};
