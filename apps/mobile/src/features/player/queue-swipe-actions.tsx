import type { SFSymbol } from "expo-symbols";
import type { DerivedValue, SharedValue } from "react-native-reanimated";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";

import type { QueueDragValues } from "./use-queue-drag";
import type { QueueSwipeState } from "./use-queue-swipe";
import { SymbolIcon } from "~/components/symbol-icon";
import { easeInOut } from "./queue-layout";
import { QUEUE_ROW_HEIGHT as ROW } from "./queue-row";
import { actionFrames, ACTION_SIZE as SIZE } from "./swipe-layout";
import { ACTION_WIDTHS } from "./use-queue-swipe";

/** The capsule's middle, scaled to whatever length it needs. */
const MIDDLE = 100;
const RADIUS = SIZE / 2;

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
  tintClassName: string;
}

/** Outermost first, in the order of `LEADING_ACTIONS`. */
const ACTIONS = {
  leading: [
    {
      fillClassName: "bg-accent",
      icon: "text.line.last.and.arrowtriangle.forward",
      label: "Add to Queue",
      tintClassName: "accent-on-accent",
    },
    {
      fillClassName: "bg-action",
      icon: "text.line.first.and.arrowtriangle.forward",
      label: "Play Next",
      tintClassName: "accent-foreground",
    },
  ],
  trailing: [
    {
      fillClassName: "bg-destructive",
      icon: "trash.fill",
      label: "Delete",
      tintClassName: "accent-foreground",
    },
  ],
} satisfies Record<Side, SwipeAction[]>;

/**
 * The circles a swipe uncovers on one side of the row being swiped, as iOS 27
 * draws a table view's swipe actions. Taps on them reach the list's tap
 * gesture (`use-queue-swipe.ts`), so these only draw. A row just deleted
 * keeps its Delete, full, until the rows below move up, then it shrinks with
 * the gap they close, as a deleted table row does.
 */
export function SwipeActions({
  side,
  swipe,
  width,
  orderProgress,
}: {
  side: Side;
  swipe: QueueSwipeState;
  width: SharedValue<number>;
  orderProgress: QueueDragValues["orderProgress"];
}) {
  const { index, removedClosing, removedIndex, x } = swipe;
  const style = useAnimatedStyle(() => {
    const swiped = index.get();
    if (swiped === -1) {
      const removed = side === "trailing" ? removedIndex.get() : -1;
      const gap = removedClosing.get()
        ? 1 - easeInOut(Math.min(Math.max(orderProgress.get(), 0), 1))
        : 1;
      return {
        opacity: removed === -1 || gap === 0 ? 0 : 1,
        transform: [
          { translateY: Math.max(removed, 0) * ROW },
          { scaleY: Math.max(gap, 0.001) },
        ],
      };
    }
    const showing = side === "leading" ? x.get() > 0 : x.get() < 0;
    return {
      opacity: showing ? 1 : 0,
      transform: [{ translateY: swiped * ROW }, { scaleY: 1 }],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="absolute inset-x-0 top-0"
      style={[{ height: ROW, transformOrigin: "top" }, style]}
    >
      {ACTIONS[side].map((action, at) => (
        <Capsule
          key={action.label}
          action={action}
          at={at}
          side={side}
          swipe={swipe}
          width={width}
        />
      ))}
    </Animated.View>
  );
}

function Capsule({
  action,
  at,
  side,
  swipe: { armedProgress, index, x },
  width,
}: {
  action: SwipeAction;
  at: number;
  side: Side;
  swipe: QueueSwipeState;
  width: SharedValue<number>;
}) {
  const frame = useDerivedValue((): CapsuleFrame => {
    // A deleted row's Delete stays as it was when the row went: full.
    const removed = index.get() === -1;
    const revealed = removed
      ? width.get()
      : side === "leading"
        ? x.get()
        : -x.get();
    const frames = actionFrames(
      ACTION_WIDTHS[side],
      Math.max(revealed, 0),
      removed ? 1 : armedProgress.get(),
    );
    const { length, opacity, scale, start } = frames[at] ?? {
      length: SIZE,
      opacity: 0,
      scale: 1,
      start: 0,
    };
    const left = side === "leading" ? start : width.get() - start - length;
    return { left, length: Math.max(length, SIZE), opacity, scale };
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
  // The symbol stays at the end beside the row, as the capsule stretches.
  const symbol = useAnimatedStyle(() => ({
    transform: [
      { translateX: side === "leading" ? frame.get().length - SIZE : 0 },
    ],
  }));

  return (
    <Animated.View
      className="absolute left-0"
      style={[{ height: SIZE, top: (ROW - SIZE) / 2, width: 0 }, capsule]}
    >
      <CapsuleFill frame={frame} className={action.fillClassName} />
      <Animated.View
        className="absolute top-0 left-0 items-center justify-center"
        style={[{ height: SIZE, width: SIZE }, symbol]}
      >
        <SymbolIcon
          name={action.icon}
          size={18}
          weight="semibold"
          tintColorClassName={action.tintClassName}
        />
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
    transform: [{ scaleX: (frame.get().length - SIZE) / MIDDLE }],
  }));
  const end = useAnimatedStyle(() => ({
    transform: [{ translateX: frame.get().length - SIZE }],
  }));
  return (
    <>
      <View
        className={`absolute top-0 left-0 ${className}`}
        style={{ borderRadius: RADIUS, height: SIZE, width: SIZE }}
      />
      <Animated.View
        className={`absolute top-0 ${className}`}
        style={[
          {
            height: SIZE,
            left: RADIUS,
            transformOrigin: "left",
            width: MIDDLE,
          },
          middle,
        ]}
      />
      <Animated.View
        className={`absolute top-0 left-0 ${className}`}
        style={[{ borderRadius: RADIUS, height: SIZE, width: SIZE }, end]}
      />
    </>
  );
}
