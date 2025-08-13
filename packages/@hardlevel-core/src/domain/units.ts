/** Convert kilograms to pounds, 1 decimal */
export const kgToLbs = (kg: number): number => Number((kg * 2.2046226218).toFixed(1));

/** Convert pounds to kilograms, 1 decimal */
export const lbsToKg = (lbs: number): number => Number((lbs / 2.2046226218).toFixed(1));

