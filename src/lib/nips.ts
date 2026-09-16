/** "nip-17" -> "17" for compact column headers. */
export function nipShort(id: string): string {
  return id.replace(/^nip-/i, '');
}
