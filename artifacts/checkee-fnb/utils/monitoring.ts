/**
 * Returns true when monitoring is still active (within the expiry date or no expiry set).
 * Date format expected: 'dd/MM/yyyy'
 */
export function isMonitoringActive(monitoredUntil?: string): boolean {
  if (!monitoredUntil) return true;
  const [day, month, year] = monitoredUntil.split('/').map(Number);
  const expiry = new Date(year, month - 1, day, 23, 59, 59, 999);
  return expiry >= new Date();
}
