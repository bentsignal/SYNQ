import { cva, type VariantProps } from "class-variance-authority";
import {
  Text,
  TextProps,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { cn } from "../lib/util";

const variants = cva("rounded-2xl", {
  variants: {
    variant: {
      primary: "bg-foreground text-background self-start",
    },
    size: {
      default: "px-4 py-2",
      icon: "p-2",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});

export default function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: TouchableOpacityProps &
  VariantProps<typeof variants> & {
    asChild?: boolean;
  }) {
  return (
    <TouchableOpacity
      activeOpacity={props.activeOpacity ?? 0.8}
      className={cn(
        variants({ variant, size, className }),
        props.disabled && "opacity-50",
      )}
      {...props}
    >
      {props.children}
    </TouchableOpacity>
  );
}

export const Label = ({ text, ...props }: { text: string } & TextProps) => {
  return <Text className="text-center text-lg font-bold">{text}</Text>;
};
