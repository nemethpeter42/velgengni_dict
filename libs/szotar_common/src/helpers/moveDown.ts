export const moveDown = <T>(arr: T[], idx: number): T[] => {
  const res = [...arr];
  if (idx >= 0 && idx < res.length - 1) {
    [res[idx], res[idx+1]] = [res[idx+1], res[idx]];
  }
  return res;
}
