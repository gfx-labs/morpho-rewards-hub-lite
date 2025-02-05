// eslint-plugin-custom-hooks/index.js

function traverse(node, identifiers, componentScope) {
  switch (node.type) {
    case "Identifier":
      if (
        componentScope.variables.some((variable) => variable.name === node.name)
      ) {
        identifiers.add(node.name);
      }
      break;
    case "MemberExpression":
      traverse(node.object, identifiers, componentScope);
      if (node.computed) {
        traverse(node.property, identifiers, componentScope);
      }
      break;
    case "CallExpression":
      traverse(node.callee, identifiers, componentScope);
      node.arguments.forEach((arg) =>
        traverse(arg, identifiers, componentScope)
      );
      break;
    case "BinaryExpression":
    case "LogicalExpression":
      traverse(node.left, identifiers, componentScope);
      traverse(node.right, identifiers, componentScope);
      break;
    case "ConditionalExpression":
      traverse(node.test, identifiers, componentScope);
      traverse(node.consequent, identifiers, componentScope);
      traverse(node.alternate, identifiers, componentScope);
      break;
    case "ChainExpression":
      traverse(node.expression, identifiers, componentScope);
      break;
    // Add cases for other types of expressions as needed
    default:
      break;
  }
}

module.exports = {
  meta: {
    docs: {
      description: "Enforce exhaustive dependencies in custom hooks",
      category: "Best Practices",
      recommended: true,
    },
    schema: [
      {
        type: "object",
        properties: {
          hooks: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingDeps:
        "Dependency list is missing the following dependencies: {{missingDeps}}",
    },
    fixable: "code", // Declare that this rule is fixable
  },
  create(context) {
    const configHooks = context.options[0]?.hooks || [];

    return {
      CallExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          configHooks.includes(node.callee.name) &&
          node.arguments.length >= 2
        ) {
          const depsArg = node.arguments[1];
          if (
            depsArg.type === "ArrayExpression" &&
            node.arguments.length >= 1 &&
            [
              "MemberExpression",
              "CallExpression",
              "LogicalExpression",
              "ChainExpression",
              "ConditionalExpression",
              "Identifier",
              "BinaryExpression",
            ].includes(node.arguments[0].type)
          ) {
            const declaredDeps = depsArg.elements.map((param) => param.name);
            const usedDeps = new Set();

            const componentScope = context.getScope(); // Assuming the component scope is the first child scope
            traverse(node.arguments[0], usedDeps, componentScope);

            const missingDeps = [...usedDeps].filter(
              (dep) => !declaredDeps.includes(dep)
            );
            if (missingDeps.length > 0) {
              context.report({
                node: depsArg,
                messageId: "missingDeps",
                data: { missingDeps: missingDeps.join(", ") },
                fix: (fixer) => {
                  return fixer.replaceText(
                    depsArg,
                    `[${[...usedDeps].join(", ")}]`
                  );
                },
              });
            }
          }
        }
      },
    };
  },
};
