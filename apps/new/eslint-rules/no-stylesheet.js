const message =
  "Use NativeWind/utility classes in the new app instead of StyleSheet.";

const isStyleSheetCreateCall = (node) =>
  node.callee?.type === "MemberExpression" &&
  !node.callee.computed &&
  node.callee.object?.type === "Identifier" &&
  node.callee.object.name === "StyleSheet" &&
  node.callee.property?.type === "Identifier" &&
  node.callee.property.name === "create";

module.exports = {
  meta: {
    docs: {
      description: "Disallow React Native StyleSheet usage in the new app.",
    },
    messages: {
      noStyleSheet: message,
    },
    schema: [],
    type: "problem",
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value !== "react-native") {
          return;
        }

        const styleSheetSpecifier = node.specifiers.find(
          (specifier) =>
            specifier.type === "ImportSpecifier" &&
            specifier.imported.type === "Identifier" &&
            specifier.imported.name === "StyleSheet",
        );

        if (styleSheetSpecifier) {
          context.report({
            messageId: "noStyleSheet",
            node: styleSheetSpecifier,
          });
        }
      },
      CallExpression(node) {
        if (!isStyleSheetCreateCall(node)) {
          return;
        }

        context.report({
          messageId: "noStyleSheet",
          node,
        });
      },
    };
  },
};
