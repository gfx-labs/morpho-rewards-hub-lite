module.exports = {
  trailingComma: "es5",
  tabWidth: 2,
  printWidth: 80,
  semi: true,
  bracketSpacing: true,
  singleQuote: false,

  importOrder: [
    "^react.*",
    "^(?![@\\.]).*",
    "^@(?!morpho|/).*",
    "^@morpho.*",
    "^@",
    "^\\.\\.",
    "^\\.",
  ],
  importOrderSeparation: true,
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  plugins: [require("@trivago/prettier-plugin-sort-imports")],
};
