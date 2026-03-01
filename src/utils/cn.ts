type ClassValue = string | false | null | undefined | ClassValue[];

const flattenClassValues = (classes: ClassValue[]): string[] => {
  const flattened: string[] = [];

  for (const value of classes) {
    if (!value) continue;

    if (Array.isArray(value)) {
      flattened.push(...flattenClassValues(value));
      continue;
    }

    flattened.push(value);
  }

  return flattened;
};

export const cn = (...classes: ClassValue[]): string => {
  return flattenClassValues(classes).join(' ');
};
