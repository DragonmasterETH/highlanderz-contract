export abstract class GameConfig {
    public static readonly RevenuePercent = 10.25;

    // E.g. 1025 is 10.25%
    public static get RevenuePercentFixedPoint2() {
        return this.RevenuePercent * 100;
    }
}