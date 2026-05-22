export function formatOdometer(km: number): string {
  if (km >= 100000) {
    return `${(km / 1000).toFixed(0)}K km`;
  }
  if (km >= 10000) {
    const str = km.toString();
    return `${str.slice(0, -3)},${str.slice(-3)} km`;
  }
  return `${km.toLocaleString('en-IN')} km`;
}

export function formatOdometerShort(km: number): string {
  if (km >= 100000) return `${(km / 1000).toFixed(0)}K`;
  return km.toLocaleString('en-IN');
}

export function formatEfficiency(kmPerL: number): string {
  return `${kmPerL.toFixed(1)} km/l`;
}

export function odometerDelta(from: number, to: number): string {
  const delta = to - from;
  return `+${formatOdometerShort(delta)} km`;
}
