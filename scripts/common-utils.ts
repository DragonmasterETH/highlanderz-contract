export abstract class CommonUtils {
    public static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Generates a random number between min and max (inclusive of min and exclusive of max).
     *
     * @param {number} min - Minimum value.
     * @param {number} max - Maximum value.
     * @returns {number} - Random number between min and max.
     */
    public static randomInRange(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    public static numberToPureString(num: number): string {
        return num.toLocaleString('fullwide', {useGrouping: false});
    }
}
