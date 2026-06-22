export function Show({
  when,
  fallback,
  children,
}: {
  when: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  return when ? <>{children}</> : <>{fallback ?? null}</>;
}
