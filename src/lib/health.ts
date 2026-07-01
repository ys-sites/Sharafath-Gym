import { supabase } from './supabase';

export interface HealthSummaryRow {
  user_id: string;
  day: string;
  type: string;
  value: number;
}

/**
 * Fetch latest synced metrics for today.
 */
export async function getTodayMetrics(userId: string): Promise<Record<string, number>> {
  if (!supabase) return {};
  
  const todayStr = new Date().toISOString().substring(0, 10);
  const { data, error } = await supabase
    .from('health_daily_summary')
    .select('type, value')
    .eq('user_id', userId)
    .gte('day', `${todayStr}T00:00:00.000Z`)
    .lte('day', `${todayStr}T23:59:59.999Z`);

  if (error) {
    console.error('Error fetching today metrics:', error);
    return {};
  }

  const result: Record<string, number> = {};
  if (data) {
    for (const row of data) {
      result[row.type] = Number(row.value);
    }
  }
  return result;
}

/**
 * Fetch daily time series metrics for charting.
 */
export async function getDailySeries(
  userId: string,
  type: string,
  days: number
): Promise<HealthSummaryRow[]> {
  if (!supabase) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('health_daily_summary')
    .select('user_id, day, type, value')
    .eq('user_id', userId)
    .eq('type', type)
    .gte('day', startDate.toISOString())
    .order('day', { ascending: true });

  if (error) {
    console.error(`Error fetching daily series for ${type}:`, error);
    return [];
  }

  return (data || []).map(row => ({
    user_id: row.user_id,
    day: row.day,
    type: row.type,
    value: Number(row.value)
  }));
}

/**
 * Calculate the average value of a metric over a trailing number of days.
 */
export async function getAverageMetric(
  userId: string,
  type: string,
  days: number
): Promise<number> {
  const series = await getDailySeries(userId, type, days);
  if (series.length === 0) return 0;
  const sum = series.reduce((acc, curr) => acc + curr.value, 0);
  return sum / series.length;
}
