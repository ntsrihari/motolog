export function formatINR(amount: number, compact = false): string {
  if (compact && Math.abs(amount) >= 100000) {
    const lakhs = amount / 100000;
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(2)}L`;
  }
  if (compact && Math.abs(amount) >= 1000) {
    const thousands = amount / 1000;
    return `₹${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}K`;
  }

  const abs = Math.abs(Math.round(amount));
  const str = abs.toString();
  let result = '';

  if (str.length <= 3) {
    result = str;
  } else {
    result = str.slice(-3);
    let remaining = str.slice(0, -3);
    while (remaining.length > 2) {
      result = remaining.slice(-2) + ',' + result;
      remaining = remaining.slice(0, -2);
    }
    if (remaining.length > 0) {
      result = remaining + ',' + result;
    }
  }

  return `₹${amount < 0 ? '-' : ''}${result}`;
}

export function formatINRDecimal(amount: number): string {
  const formatted = formatINR(Math.floor(amount));
  const paise = Math.round((Math.abs(amount) % 1) * 100);
  if (paise === 0) return formatted;
  return `${formatted}.${paise.toString().padStart(2, '0')}`;
}
