type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | ClassValue[];

const flattenClasses = (value: ClassValue, result: string[]) => {
  if (!value) return;

  if (Array.isArray(value)) {
    for (const item of value) {
      flattenClasses(item, result);
    }
    return;
  }

  if (typeof value === "string" || typeof value === "number") {
    result.push(String(value));
  }
};

export const cn = (...inputs: ClassValue[]) => {
  const values: string[] = [];
  for (const input of inputs) {
    flattenClasses(input, values);
  }
  return values.join(" ");
};
