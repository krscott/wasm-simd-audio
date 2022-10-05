// Type `{}` means "non-nullish". This is what I want, so disable lint.

import { assertEq } from "./assert";

// eslint-disable-next-line @typescript-eslint/ban-types
export class RingBuf<T extends {}> {
  _buffer: Array<T | undefined>;
  _w = 0;
  _r = 0;
  _count = 0;

  private inc(i: number): number {
    return (i + 1) % this._buffer.length;
  }

  constructor(size: number) {
    this._buffer = new Array(size);
  }

  fullSize(): number {
    return this._buffer.length;
  }

  count(): number {
    return this._count;
  }

  isFull(): boolean {
    return this._count === this._buffer.length;
  }

  clear() {
    this._count = 0;
    this._r = 0;
    this._w = 0;
    for (let i = 0; i < this._buffer.length; ++i) {
      this._buffer[i] = undefined;
    }
  }

  put(value: T) {
    this._buffer[this._w] = value;
    this._w = this.inc(this._w);
    if (this._w === this._r) {
      this._r = this.inc(this._r);
    }

    this._count = Math.min(this._count + 1, this._buffer.length);
  }

  take(): T | undefined {
    if (this._count === 0) {
      return undefined;
    }
    const out = this._buffer[this._r];
    if (out === undefined) throw new Error("expected value");
    this._buffer[this._r] = undefined;
    this._r = this.inc(this._r);
    this._count -= 1;
    return out;
  }

  reduce<U>(
    callback: (prevValue: U, value: T, index: number) => U,
    initialValue: U
  ) {
    if (this._count === 0) {
      return initialValue;
    }

    let acc = initialValue;

    for (let i = 0; i < this._count; ++i) {
      const out = this._buffer[(i + this._r) % this._buffer.length];
      if (out === undefined) throw new Error("expected value");
      acc = callback(acc, out, i);
    }

    return acc;
  }
}

export class NumericRingBuf extends RingBuf<number> {
  sum(): number {
    return this.reduce((acc, v) => acc + v, 0);
  }

  average() {
    const cnt = this.count();
    return cnt === 0 ? undefined : this.sum() / cnt;
  }
}

// Tests
if (import.meta.env.DEV) {
  const b = new NumericRingBuf(4);
  assertEq(b.count(), 0);
  assertEq(b.sum(), 0);
  assertEq(b.average(), undefined);
  b.put(2);
  assertEq(b.count(), 1);
  assertEq(b.sum(), 2);
  assertEq(b.average(), 2);

  b.put(4);
  b.put(6);
  assertEq(b.count(), 3);
  assertEq(b.sum(), 12);
  assertEq(b.average(), 4);

  assertEq(b.take(), 2);
  assertEq(b.take(), 4);
  assertEq(b.count(), 1);
  assertEq(b.sum(), 6);
  assertEq(b.average(), 6);

  assertEq(b.take(), 6);
  assertEq(b.count(), 0);
  assertEq(b.sum(), 0);
  assertEq(b.average(), undefined);

  b.put(10);
  b.put(11);
  b.put(12);
  b.put(13);
  assertEq(b.count(), 4);
  assertEq(b.sum(), 10 + 11 + 12 + 13);

  b.put(14);
  assertEq(b.count(), 4);
  assertEq(b.sum(), 11 + 12 + 13 + 14);

  console.debug("ringbuf tests pass");
}
