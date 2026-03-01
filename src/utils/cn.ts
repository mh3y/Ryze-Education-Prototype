type ClassValue = string | false | null | undefined;

export const cn = (...classes: ClassValue[]): string => {
  return classes.filter(Boolean).join(' ');
};

export default cn;
