import { useQuery } from '@tanstack/react-query';
import { fetchFuelPrices } from '@/lib/api';
import { useUserStore } from '@/store/user';
import { ApiConfig } from '@/config/api.config';

export function useFuelPrice() {
  const { city, fuelPrices, fuelPricesLastFetched, setFuelPrices } = useUserStore();

  const isCacheValid = fuelPricesLastFetched
    ? Date.now() - new Date(fuelPricesLastFetched).getTime() < ApiConfig.fuelPrice.cacheTtlMs
    : false;

  const query = useQuery({
    queryKey: ['fuelPrice', city],
    queryFn: async () => {
      const prices = await fetchFuelPrices(city);
      if (prices) setFuelPrices(prices);
      return prices;
    },
    enabled: !isCacheValid,
    staleTime: ApiConfig.fuelPrice.cacheTtlMs,
    initialData: isCacheValid ? fuelPrices ?? undefined : undefined,
  });

  return {
    prices: query.data ?? fuelPrices,
    isLoading: query.isLoading,
    petrol: query.data?.petrol ?? fuelPrices?.petrol,
    diesel: query.data?.diesel ?? fuelPrices?.diesel,
    cng: query.data?.cng ?? fuelPrices?.cng,
    city,
    date: query.data?.date ?? fuelPrices?.date,
  };
}
