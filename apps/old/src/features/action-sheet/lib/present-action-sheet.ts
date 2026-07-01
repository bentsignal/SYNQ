import { TrueSheet } from "@lodev09/react-native-true-sheet";

type PresentActionSheetItemInput<Item, Payload> = {
  getPayload?: (item: Item) => Payload;
  getSheetName: (item: Item) => string;
  item: Item | null | undefined;
  sendHaptic: (type: "light") => void;
  setItem: (item: Payload) => void;
};

export function presentActionSheetItem<Item, Payload = Item>({
  getPayload,
  getSheetName,
  item,
  sendHaptic,
  setItem,
}: PresentActionSheetItemInput<Item, Payload>) {
  if (!item) {
    return;
  }

  sendHaptic("light");
  setItem(getPayload ? getPayload(item) : (item as unknown as Payload));

  try {
    TrueSheet.present(getSheetName(item));
  } catch {
    return;
  }
}
