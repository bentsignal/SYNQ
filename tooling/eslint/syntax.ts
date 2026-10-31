import type { Linter } from "eslint";
import { defineConfig } from "eslint/config";

const envSyntaxSelector = {
  selector:
    "MemberExpression[object.type='MetaProperty'][object.meta.name='import'][object.property.name='meta'][property.name='env']",
  message:
    "Use `import { env } from '~/env'` instead to ensure validated types.",
} as const;

const envPropertyRestriction = {
  object: "process",
  property: "env",
  message:
    "Use `import { env } from '~/env'` instead to ensure validated types.",
} as const;

const envImportRestriction = {
  name: "process",
  importNames: ["env"],
  message:
    "Use `import { env } from '~/env'` instead to ensure validated types.",
} as const;

const strictTsSyntaxSelectors = [
  {
    selector:
      ":matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)[params.length>4]",
    message:
      "If a function requires more than 4 parameters, use a single object parameter instead.",
  },
  {
    selector:
      "FunctionDeclaration[returnType]:not([returnType.typeAnnotation.type='TSTypePredicate'])",
    message:
      "Do not annotate return types. Let TypeScript infer them so the types stay in sync with the implementation.",
  },
  {
    selector:
      "ArrowFunctionExpression[returnType][parent.type='VariableDeclarator']:not([returnType.typeAnnotation.type='TSTypePredicate'])",
    message:
      "Do not annotate return types. Let TypeScript infer them so the types stay in sync with the implementation.",
  },
  {
    selector:
      "VariableDeclarator[init][id.type='Identifier'][id.typeAnnotation]",
    message:
      "Do not annotate variable types when the initializer already provides the type. Let TypeScript infer it so the types stay in sync with the implementation.",
  },
] as const;

const strictReactSyntaxSelectors = [
  {
    selector: "TryStatement[finalizer]",
    message:
      "Do not use `finally` blocks. The React Compiler cannot optimize components and hooks that use `finally` with try/catch blocks.",
  },
  {
    selector:
      "CallExpression:matches([callee.name='useSuspenseQuery'], [callee.property.name='useSuspenseQuery']):not(:has(Property[key.name='select']))",
    message:
      "useSuspenseQuery must include a `select` option so the component only subscribes to the data it needs.",
  },
  {
    selector:
      "CallExpression:matches([callee.name='useQuery'], [callee.property.name='useQuery']):not(:has(Property[key.name='select']))",
    message:
      "useQuery must include a `select` option so the component only subscribes to the data it needs.",
  },
  {
    selector: "JSXAttribute[name.name='disabled'] Identifier[name='isPending']",
    message:
      "Don't disable a control while its mutation is in flight. Respond right away: update the affected query data in the mutation's `onMutate` (rolled back in `onError`), then close or navigate immediately. See AGENTS.md → User actions respond instantly.",
  },
  {
    selector:
      "AwaitExpression > CallExpression[callee.property.name='mutateAsync']",
    message:
      "Don't wait for a write to finish before responding to a user action. Start the mutation with an optimistic `onMutate`, handle failure with `.catch`, and close or navigate immediately. See AGENTS.md → User actions respond instantly.",
  },
  {
    selector: "CallExpression[callee.name='useContext']",
    message:
      "useContext does not support fine-grained selection and causes re-renders on every context change. Read shared state through a store with a selector instead (TanStack Query with `select`, or `useSyncExternalStore` over a small store).",
  },
  {
    selector: "CallExpression[callee.name='useEffect']",
    message:
      "useEffect is banned by default. If you genuinely need an effect to sync with an external system and no better solution exists, add an eslint-disable comment with an explanation of why an effect is necessary. For more information on why you should typically avoid useEffect, see: https://react.dev/learn/you-might-not-need-an-effect",
  },
  {
    selector:
      ":function VariableDeclarator[init.type='JSXElement'], :function VariableDeclarator[init.type='JSXFragment']",
    message:
      "Do not assign JSX to a variable inside a component or hook. Extract it to its own component function so the React Compiler can optimize it.",
  },
] as const;

const reactImportRestrictions = [
  {
    name: "react",
    importNames: ["useMemo", "useCallback", "memo"],
    message:
      "React Compiler handles memoization automatically. Only use manual memoization as an escape hatch with a comment explaining why.",
  },
  {
    name: "@tanstack/react-query",
    importNames: ["useQuery"],
    message:
      "Read the library with `useSuspenseQuery`: local SQLite answers in milliseconds, and a screen never renders half-loaded. Prefetch with `queryClient.prefetchQuery` before navigating when it helps. If `useQuery` is genuinely needed (searches go through `useSearchQuery`), add an eslint-disable comment explaining why.",
  },
] as const;

export function createStrictSyntax(options: {
  ts?: boolean;
  react?: boolean;
  env?: boolean;
}) {
  const syntaxSelectors = [];
  const importPaths = [];

  if (options.ts) {
    syntaxSelectors.push(...strictTsSyntaxSelectors);
  }

  if (options.react) {
    syntaxSelectors.push(...strictReactSyntaxSelectors);
    importPaths.push(...reactImportRestrictions);
  }

  if (options.env) {
    syntaxSelectors.push(envSyntaxSelector);
    importPaths.push(envImportRestriction);
  }

  const rules: Partial<Record<string, Linter.RuleEntry>> = {};

  if (syntaxSelectors.length > 0) {
    rules["no-restricted-syntax"] = ["error", ...syntaxSelectors];
  }

  if (importPaths.length > 0) {
    rules["no-restricted-imports"] = ["error", { paths: importPaths }];
  }

  if (options.env) {
    rules["no-restricted-properties"] = ["error", envPropertyRestriction];
  }

  return defineConfig(
    ...(options.env
      ? [
          {
            ignores: ["**/env.ts"],
          },
        ]
      : []),
    {
      files: ["**/*.js", "**/*.ts", "**/*.tsx"],
      rules,
    },
  );
}
