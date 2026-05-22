import { useEffect } from 'react';
import { useGarageStore } from '@/store/garage';
import { useDiaryStore } from '@/store/diary';
import { todayISO } from '@/utils/formatDate';

export function useVehicleInference() {
  const vehicles = useGarageStore((s) => s.vehicles);
  const { inferredVehicleId, setInferredVehicle } = useDiaryStore();

  useEffect(() => {
    if (vehicles.length === 0 || inferredVehicleId) return;

    const today = todayISO();
    const dayOfWeek = new Date().toLocaleDateString('en-IN', { weekday: 'long' });
    const isWeekend = ['Saturday', 'Sunday'].includes(dayOfWeek);

    let inferred: string | null = null;
    let reason = '';

    const commuters = vehicles.filter((v) => v.usageRole === 'daily_commute');
    const weekenders = vehicles.filter((v) => v.usageRole === 'weekend');

    if (!isWeekend && commuters.length > 0) {
      inferred = commuters[0].id;
      reason = `It's a weekday and this is your daily commute vehicle.`;
    } else if (isWeekend && weekenders.length > 0) {
      inferred = weekenders[0].id;
      reason = `It's the weekend — looks like a day for your ${weekenders[0].make}.`;
    } else if (vehicles.length > 0) {
      const sorted = [...vehicles].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
      inferred = sorted[0].id;
      reason = `Based on your recent activity.`;
    }

    setInferredVehicle(inferred, reason);
  }, [vehicles.length]);

  return { inferredVehicleId };
}
