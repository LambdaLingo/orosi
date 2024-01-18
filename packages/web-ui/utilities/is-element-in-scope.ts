export function isElementInScope(
  element?: Element | null,
  scope?: Element[] | null
): boolean {
  if (!element) {
    return false;
  }
  if (!scope) {
    return false;
  }
  return scope.some((node) => node.contains(element));
}
