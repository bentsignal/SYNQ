import type { ColorValue, ProcessedColorValue, ViewProps } from "react-native";
import { processColor } from "react-native";
import { requireNativeView } from "expo";

export type RoutePickerButtonProps = ViewProps & {
  /** The AirPlay symbol's color. */
  color?: ColorValue;
  /** Its color while audio plays on another device. */
  activeColor?: ColorValue;
};

type NativeProps = ViewProps & {
  color?: ProcessedColorValue | null;
  activeColor?: ProcessedColorValue | null;
};

const NativeRoutePicker = requireNativeView<NativeProps>("SynqAudio");

/**
 * iOS's AirPlay button (`AVRoutePickerView`): a tap opens the system's
 * route picker, and the symbol takes `activeColor` while another device
 * plays. Give it a size (28 pt fits a row of player controls).
 */
export function RoutePickerButton({
  color,
  activeColor,
  ...props
}: RoutePickerButtonProps) {
  return (
    <NativeRoutePicker
      {...props}
      color={color === undefined ? undefined : processColor(color)}
      activeColor={
        activeColor === undefined ? undefined : processColor(activeColor)
      }
    />
  );
}
