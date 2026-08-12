// The held payload belongs to whoever it was fetched for; a profile switch
// drops it rather than showing another person's board.
function heldFor<P>(
  held: { owner: string; payload: P } | null,
  profile: string,
): P | null {
  if (held?.owner === profile) {
    return held.payload;
  }
  return null;
}

export { heldFor };
