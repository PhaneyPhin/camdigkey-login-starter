export const toCamelCase = (str: string): string => {
  if (!str) return str;
  return str.replace(/([-_][a-z])/gi, ($1) =>
    $1.toUpperCase().replace("-", "").replace("_", "")
  );
};

export const toSnakeCase = (str: string): string => {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
};
