const fifaToIso: Record<string, string> = {
  MEX: "mx", RSA: "za", KOR: "kr", CZE: "cz",
  CAN: "ca", SUI: "ch", QAT: "qa", BIH: "ba",
  BRA: "br", MAR: "ma", SCO: "gb-sct", HAI: "ht",
  USA: "us", PAR: "py", AUS: "au", TUR: "tr",
  GER: "de", CUW: "cw", CIV: "ci", ECU: "ec",
  NED: "nl", JPN: "jp", SWE: "se", TUN: "tn",
  BEL: "be", EGY: "eg", IRN: "ir", NZL: "nz",
  ESP: "es", CPV: "cv", KSA: "sa", URU: "uy",
  FRA: "fr", SEN: "sn", NOR: "no", IRQ: "iq",
  ARG: "ar", ALG: "dz", AUT: "at", JOR: "jo",
  POR: "pt", COL: "co", UZB: "uz", COD: "cd",
  ENG: "gb-eng", CRO: "hr", GHA: "gh", PAN: "pa",
};

export function getFlagUrl(fifaCode: string, width = 40): string {
  const iso = fifaToIso[fifaCode];
  if (!iso) return "";
  return `https://flagcdn.com/w${width}/${iso}.png`;
}

export function getFlagUrl2x(fifaCode: string, width = 40): string {
  const iso = fifaToIso[fifaCode];
  if (!iso) return "";
  return `https://flagcdn.com/w${width * 2}/${iso}.png`;
}
