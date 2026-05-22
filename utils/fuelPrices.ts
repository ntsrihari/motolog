import type { FuelPrice } from '@/types';

// Static Indian city fuel prices (₹/litre). Source: PPAC / iocl.com.
// Last updated: May 2025. Update monthly from https://www.iocl.com/dealer-locator/petrol-diesel-price.aspx
const CITY_PRICES: Record<string, { petrol: number; diesel: number; cng?: number }> = {
  'delhi':        { petrol: 94.77,  diesel: 87.67,  cng: 74.09 },
  'new delhi':    { petrol: 94.77,  diesel: 87.67,  cng: 74.09 },
  'mumbai':       { petrol: 103.44, diesel: 89.97,  cng: 66.00 },
  'bangalore':    { petrol: 102.86, diesel: 88.94 },
  'bengaluru':    { petrol: 102.86, diesel: 88.94 },
  'chennai':      { petrol: 100.80, diesel: 92.38 },
  'hyderabad':    { petrol: 107.41, diesel: 95.65 },
  'kolkata':      { petrol: 104.95, diesel: 91.76,  cng: 56.50 },
  'pune':         { petrol: 104.31, diesel: 90.15,  cng: 68.00 },
  'ahmedabad':    { petrol: 96.63,  diesel: 92.38,  cng: 74.00 },
  'jaipur':       { petrol: 104.88, diesel: 90.36 },
  'lucknow':      { petrol: 94.65,  diesel: 87.76,  cng: 78.00 },
  'kanpur':       { petrol: 94.65,  diesel: 87.76 },
  'nagpur':       { petrol: 104.10, diesel: 90.50 },
  'surat':        { petrol: 96.50,  diesel: 92.20 },
  'bhopal':       { petrol: 108.64, diesel: 93.44 },
  'indore':       { petrol: 108.65, diesel: 93.45 },
  'patna':        { petrol: 105.90, diesel: 92.42 },
  'chandigarh':   { petrol: 94.24,  diesel: 82.40,  cng: 73.00 },
  'noida':        { petrol: 94.77,  diesel: 87.67,  cng: 74.09 },
  'gurgaon':      { petrol: 94.92,  diesel: 87.81,  cng: 76.59 },
  'gurugram':     { petrol: 94.92,  diesel: 87.81,  cng: 76.59 },
  'faridabad':    { petrol: 94.92,  diesel: 87.81 },
  'ghaziabad':    { petrol: 94.77,  diesel: 87.67 },
  'kochi':        { petrol: 107.58, diesel: 96.31 },
  'cochin':       { petrol: 107.58, diesel: 96.31 },
  'thiruvananthapuram': { petrol: 107.64, diesel: 96.34 },
  'coimbatore':   { petrol: 100.79, diesel: 92.38 },
  'madurai':      { petrol: 100.80, diesel: 92.38 },
  'visakhapatnam':{ petrol: 108.20, diesel: 96.00 },
  'vijayawada':   { petrol: 109.56, diesel: 97.35 },
  'mangalore':    { petrol: 102.80, diesel: 88.90 },
  'hubli':        { petrol: 102.74, diesel: 88.84 },
  'mysore':       { petrol: 102.87, diesel: 88.95 },
  'mysuru':       { petrol: 102.87, diesel: 88.95 },
  'nashik':       { petrol: 104.20, diesel: 90.08 },
  'aurangabad':   { petrol: 104.35, diesel: 90.20 },
  'kolhapur':     { petrol: 104.15, diesel: 90.05 },
  'amritsar':     { petrol: 97.83,  diesel: 84.94 },
  'ludhiana':     { petrol: 97.78,  diesel: 84.90 },
  'jalandhar':    { petrol: 97.80,  diesel: 84.92 },
  'agra':         { petrol: 94.71,  diesel: 87.73 },
  'varanasi':     { petrol: 94.81,  diesel: 87.82 },
  'allahabad':    { petrol: 94.79,  diesel: 87.80 },
  'prayagraj':    { petrol: 94.79,  diesel: 87.80 },
  'meerut':       { petrol: 94.74,  diesel: 87.70 },
  'ranchi':       { petrol: 99.85,  diesel: 95.04 },
  'bhubaneswar':  { petrol: 102.20, diesel: 94.76 },
  'guwahati':     { petrol: 101.70, diesel: 89.10 },
  'raipur':       { petrol: 100.66, diesel: 93.23 },
  'dehradun':     { petrol: 95.40,  diesel: 88.99 },
  'shimla':       { petrol: 98.45,  diesel: 88.68 },
  'srinagar':     { petrol: 96.20,  diesel: 81.86 },
};

// Fallback for cities not in the list (national average approx.)
const NATIONAL_AVERAGE = { petrol: 101.50, diesel: 90.00 };

export function getStaticFuelPrice(city: string): FuelPrice {
  const key = city.toLowerCase().trim();
  const prices = CITY_PRICES[key] ?? NATIONAL_AVERAGE;
  return {
    city,
    petrol: prices.petrol,
    diesel: prices.diesel,
    cng: prices.cng,
    date: new Date().toISOString().split('T')[0],
    source: 'static',
  };
}

export function getAvailableCities(): string[] {
  return Object.keys(CITY_PRICES).map((c) => c.split(' ').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')).sort();
}
