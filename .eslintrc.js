module.exports = {
  // By setting "root" to true, ESLint will stop looking up the tree
  root: true,

  // Optionally specify the environment
  env: {
    browser: true,
    node: true,
  },

  // If you have an extends array, remove it or replace it with an empty one
  extends: [],

  // Override or disable all rules
  rules: {
    // For example, to disable "no-console":
    "no-console": "off",
    // Similarly, you can turn off or remove additional rules here
  },
};
