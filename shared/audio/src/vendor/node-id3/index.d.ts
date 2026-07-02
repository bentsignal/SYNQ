export type NodeId3PictureTag = {
  description?: string;
  imageBuffer: string;
  mime: string;
};

export type NodeId3Tags = {
  APIC?: NodeId3PictureTag;
  album?: string;
  artist?: string;
  title?: string;
};

export function writeExpo(buffer: Uint8Array, tags: NodeId3Tags): Uint8Array;
