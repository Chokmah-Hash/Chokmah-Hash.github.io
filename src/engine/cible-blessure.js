function cibleBlessure(f, e) {
  if (f >= e * 2) return "2+";
  if (f > e) return "3+";
  if (f === e) return "4+";
  if (f <= e / 2) return "6+";
  return "5+";
}

