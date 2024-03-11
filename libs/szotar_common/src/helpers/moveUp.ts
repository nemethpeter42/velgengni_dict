export const moveUp = <T>(arr: T[], idx: number): T[] => {
  const res = [...arr];
  if (idx > 0 && idx < res.length) {
    [res[idx-1], res[idx]] = [res[idx], res[idx-1]];
  }
  return res;
}
