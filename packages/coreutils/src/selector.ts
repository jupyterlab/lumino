/**
 * Remove :is() and :where() functional pseudo-classes so that
 * commas inside them do not count as top-level selector separators.
 */
export function stripIsWhere(selector: string): string {
  return selector.replace(
    /:(is|where)\(([^()]|\([^()]*\))*\)/g,
    ''
  );
}

/**
 * Returns true if the selector contains a top-level comma.
 */
export function hasTopLevelComma(selector: string): boolean {
  return stripIsWhere(selector).indexOf(',') !== -1;
}
