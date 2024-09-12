export class BigIntMath {

    static max(...values: bigint[]): bigint | null {
        if (values.length === 0) {
            return null;
        }

        if (values.length === 1) {
            return values[0];
        }

        let max = values[0];
        for (let i = 1; i < values.length; i++) {
            if (values[i] > max) {
                max = values[i];
            }
        }
        return max;
    }

    static min(...values: bigint[]): bigint | null {
        if (values.length === 0) {
            return null;
        }

        if (values.length === 1) {
            return values[0];
        }

        let min = values[0];
        for (let i = 1; i < values.length; i++) {
            if (values[i] < min) {
                min = values[i];
            }
        }
        return min;
    }

    static sign(value: bigint): bigint {
        if (value > 0n) {
            return 1n;
        }
        if (value < 0n) {
            return -1n;
        }
        return 0n;
    }

    static abs(value: bigint): bigint {
        if (this.sign(value) === -1n) {
            return -value;
        }
        return value;
    }

    // https://stackoverflow.com/questions/53683995/javascript-big-integer-square-root/58863398#58863398
    static rootNth(value: bigint, k: bigint = 2n): bigint {
        if (value < 0n) {
            throw new Error('negative number is not supported');
        }

        let o: bigint = 0n;
        let x: bigint = value;
        let limit: number = 100;

        while (x ** k !== k && x !== o && --limit) {
            o = x;
            x = ((k - 1n) * x + value / x ** (k - 1n)) / k;
        }

        return x;
    }

    static sqrt(value: bigint): bigint {
        return BigIntMath.rootNth(value);
    }

    static toNumber(value: bigint): number {
        if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
            throw new Error("BigInt value exceeds the safe integer limit for conversion to number.");
        }
        return Number(value);
    }
}
