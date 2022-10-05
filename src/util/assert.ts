export const assert = (cond: boolean, msg?: string) => {
  if (!cond) {
    if (msg) {
      throw new Error(`Assertion: ${msg}`);
    } else {
      throw new Error(`Assertion`);
    }
  }
};

export const assertEq = <T>(left: T, right: T, msg?: string) => {
  if (left !== right) {
    const s = `Assertion: ${left} !== ${right}`;

    if (msg) {
      throw new Error(`${s} ${msg}`);
    } else {
      throw new Error(s);
    }
  }
};
