import type { SFSymbol } from "expo-symbols";
import type { DerivedValue, SharedValue } from "react-native-reanimated";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";

import type { QueueSwipeState } from "./use-queue-swipe";
import { SymbolIcon } from "~/components/symbol-icon";
import { QUEUE_ROW_HEIGHT as ROW } from "./queue-row";
import { actionFrames, ACTION_HEIGHT as HEIGHT } from "./swipe-layout";

/** The capsule's padding either side of its symbol and label. */
const PADDING = 16;
/** The capsule's middle, scaled to whatever length it needs. */
const MIDDLE = 100;
const RADIUS = HEIGHT / 2;

type Side = "leading" | "trailing";

interface CapsuleFrame {
  left: number;
  length: number;
  opacity: number;
  scale: number;
}

interface SwipeAction {
  label: string;
  icon: SFSymbol;
  fillClassName: string;
  textClassName: string;
  tintClassName: string;
}

/** Outermost first, in the order of `LEADING_ACTIONS`. */
const ACTIONS = {
  leading: [
    {
      fillClassName: "bg-accent",
      icon: "text.line.last.and.arrowtriangle.forward",
      label: "Add to Queue",
      textClassName: "text-on-accent",
      tintClassName: "accent-on-accent",
    },
    {
      fillClassName: "bg-action",
      icon: "text.line.first.and.arrowtriangle.forward",
      label: "Play Next",
      textClassName: "text-foreground",
      tintClassName: "accent-foreground",
    },
  ],
  trailing: [
    {
      fillClassName: "bg-destructive",
      icon: "trash.fill",
      label: "Delete",
      textClassName: "text-foreground",
      tintClassName: "accent-foreground",
    },
  ],
} satisfies Record<Side, SwipeAction[]>;

/**
 * The capsules a swipe uncovers on one side of the row being swiped, as
 * iOS 27 draws a table view's swipe actions. Taps on them reach the list's
 * tap gesture (`use-queue-swipe.ts`), so these only draw.
 */
export function SwipeActions({
  side,
  swipe,
  width,
  onMeasure,
}: {
  side: Side;
  swipe: QueueSwipeState;
  width: SharedValue<number>;
  onMeasure: (side: Side, at: number, size: number) => void;
}) {
  const { index, x } = swipe;
  const style = useAnimatedStyle(() => {
    const showing = side === "leading" ? x.get() > 0 : x.get() < 0;
    return {
      opacity: index.get() !== -1 && showing ? 1 : 0,
      transform: [{ translateY: Math.max(index.get(), 0) * ROW }],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="absolute inset-x-0 top-0"
      style={[{ height: ROW }, style]}
    >
      {ACTIONS[side].map((action, at) => (
        <Capsule
          key={action.label}
          action={action}
          at={at}
          side={side}
          swipe={swipe}
          width={width}
          onMeasure={(size) => onMeasure(side, at, size)}
        />
      ))}
    </Animated.View>
  );
}

function Capsule({
  action,
  at,
  side,
  swipe: { armedProgress, leadingWidths, trailingWidths, x },
  width,
  onMeasure,
}: {
  action: SwipeAction;
  at: number;
  side: Side;
  swipe: QueueSwipeState;
  width: SharedValue<number>;
  onMeasure: (size: number) => void;
}) {
  const widths = side === "leading" ? leadingWidths : trailingWidths;
  const frame = useDerivedValue((): CapsuleFrame => {
    const revealed = side === "leading" ? x.get() : -x.get();
    const frames = actionFrames(
      widths.get(),
      Math.max(revealed, 0),
      armedProgress.get(),
    );
    const { length, opacity, scale, start } = frames[at] ?? {
      length: HEIGHT,
      opacity: 0,
      scale: 1,
      start: 0,
    };
    const left = side === "leading" ? start : width.get() - start - length;
    return { left, length: Math.max(length, HEIGHT), opacity, scale };
  });

  const capsule = useAnimatedStyle(() => {
    const { left, length, opacity, scale } = frame.get();
    return {
      opacity,
      // About the capsule's center.
      transform: [
        { translateX: left + length / 2 },
        { scale },
        { translateX: -length / 2 },
      ],
    };
  });
  const content = useAnimatedStyle(() => {
    const natural = (widths.get()[at] ?? 0) - PADDING * 2;
    return {
      transform: [{ translateX: (frame.get().length - natural) / 2 }],
    };
  });

  return (
    <Animated.View
      className="absolute left-0"
      style={[{ height: HEIGHT, top: (ROW - HEIGHT) / 2, width: 0 }, capsule]}
    >
      <CapsuleFill frame={frame} className={action.fillClassName} />
      <Animated.View
        className="absolute top-0 left-0 flex-row items-center gap-1.5"
        style={[{ height: HEIGHT }, content]}
        onLayout={(event) =>
          onMeasure(Math.ceil(event.nativeEvent.layout.width) + PADDING * 2)
        }
      >
        <SymbolIcon
          name={action.icon}
          size={15}
          weight="semibold"
          tintColorClassName={action.tintClassName}
        />
        <Text
          numberOfLines={1}
          className={`text-subhead font-semibold ${action.textClassName}`}
        >
          {action.label}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

/**
 * A capsule of any length without animating layout: a round end at each side
 * of a middle that scales, so the ends stay round as it stretches.
 */
function CapsuleFill({
  frame,
  className,
}: {
  frame: DerivedValue<CapsuleFrame>;
  className: string;
}) {
  const middle = useAnimatedStyle(() => ({
    transform: [{ scaleX: (frame.get().length - HEIGHT) / MIDDLE }],
  }));
  const end = useAnimatedStyle(() => ({
    transform: [{ translateX: frame.get().length - HEIGHT }],
  }));
  return (
    <>
      <View
        className={`absolute top-0 left-0 ${className}`}
        style={{ borderRadius: RADIUS, height: HEIGHT, width: HEIGHT }}
      />
      <Animated.View
        className={`absolute top-0 ${className}`}
        style={[
          {
            height: HEIGHT,
            left: RADIUS,
            transformOrigin: "left",
            width: MIDDLE,
          },
          middle,
        ]}
      />
      <Animated.View
        className={`absolute top-0 left-0 ${className}`}
        style={[{ borderRadius: RADIUS, height: HEIGHT, width: HEIGHT }, end]}
      />
    </>
  );
}
