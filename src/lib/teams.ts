export interface Team {
  name: string;
  code: string;
  flag: string;
  fifaRanking: number;
  confederation: string;
}

export interface Group {
  name: string;
  teams: Team[];
}

export const groups: Group[] = [
  {
    name: "Group A",
    teams: [
      { name: "Mexico", code: "MEX", flag: "🇲🇽", fifaRanking: 14, confederation: "CONCACAF" },
      { name: "South Africa", code: "RSA", flag: "🇿🇦", fifaRanking: 57, confederation: "CAF" },
      { name: "South Korea", code: "KOR", flag: "🇰🇷", fifaRanking: 22, confederation: "AFC" },
      { name: "Czech Republic", code: "CZE", flag: "🇨🇿", fifaRanking: 36, confederation: "UEFA" },
    ],
  },
  {
    name: "Group B",
    teams: [
      { name: "Canada", code: "CAN", flag: "🇨🇦", fifaRanking: 35, confederation: "CONCACAF" },
      { name: "Switzerland", code: "SUI", flag: "🇨🇭", fifaRanking: 15, confederation: "UEFA" },
      { name: "Qatar", code: "QAT", flag: "🇶🇦", fifaRanking: 43, confederation: "AFC" },
      { name: "Bosnia and Herzegovina", code: "BIH", flag: "🇧🇦", fifaRanking: 65, confederation: "UEFA" },
    ],
  },
  {
    name: "Group C",
    teams: [
      { name: "Brazil", code: "BRA", flag: "🇧🇷", fifaRanking: 5, confederation: "CONMEBOL" },
      { name: "Morocco", code: "MAR", flag: "🇲🇦", fifaRanking: 13, confederation: "CAF" },
      { name: "Scotland", code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", fifaRanking: 52, confederation: "UEFA" },
      { name: "Haiti", code: "HAI", flag: "🇭🇹", fifaRanking: 88, confederation: "CONCACAF" },
    ],
  },
  {
    name: "Group D",
    teams: [
      { name: "United States", code: "USA", flag: "🇺🇸", fifaRanking: 11, confederation: "CONCACAF" },
      { name: "Paraguay", code: "PAR", flag: "🇵🇾", fifaRanking: 42, confederation: "CONMEBOL" },
      { name: "Australia", code: "AUS", flag: "🇦🇺", fifaRanking: 24, confederation: "AFC" },
      { name: "Turkey", code: "TUR", flag: "🇹🇷", fifaRanking: 30, confederation: "UEFA" },
    ],
  },
  {
    name: "Group E",
    teams: [
      { name: "Germany", code: "GER", flag: "🇩🇪", fifaRanking: 8, confederation: "UEFA" },
      { name: "Curaçao", code: "CUW", flag: "🇨🇼", fifaRanking: 82, confederation: "CONCACAF" },
      { name: "Ivory Coast", code: "CIV", flag: "🇨🇮", fifaRanking: 39, confederation: "CAF" },
      { name: "Ecuador", code: "ECU", flag: "🇪🇨", fifaRanking: 28, confederation: "CONMEBOL" },
    ],
  },
  {
    name: "Group F",
    teams: [
      { name: "Netherlands", code: "NED", flag: "🇳🇱", fifaRanking: 3, confederation: "UEFA" },
      { name: "Japan", code: "JPN", flag: "🇯🇵", fifaRanking: 16, confederation: "AFC" },
      { name: "Sweden", code: "SWE", flag: "🇸🇪", fifaRanking: 44, confederation: "UEFA" },
      { name: "Tunisia", code: "TUN", flag: "🇹🇳", fifaRanking: 38, confederation: "CAF" },
    ],
  },
  {
    name: "Group G",
    teams: [
      { name: "Belgium", code: "BEL", flag: "🇧🇪", fifaRanking: 6, confederation: "UEFA" },
      { name: "Egypt", code: "EGY", flag: "🇪🇬", fifaRanking: 33, confederation: "CAF" },
      { name: "Iran", code: "IRN", flag: "🇮🇷", fifaRanking: 20, confederation: "AFC" },
      { name: "New Zealand", code: "NZL", flag: "🇳🇿", fifaRanking: 93, confederation: "OFC" },
    ],
  },
  {
    name: "Group H",
    teams: [
      { name: "Spain", code: "ESP", flag: "🇪🇸", fifaRanking: 2, confederation: "UEFA" },
      { name: "Cape Verde", code: "CPV", flag: "🇨🇻", fifaRanking: 68, confederation: "CAF" },
      { name: "Saudi Arabia", code: "KSA", flag: "🇸🇦", fifaRanking: 60, confederation: "AFC" },
      { name: "Uruguay", code: "URU", flag: "🇺🇾", fifaRanking: 9, confederation: "CONMEBOL" },
    ],
  },
  {
    name: "Group I",
    teams: [
      { name: "France", code: "FRA", flag: "🇫🇷", fifaRanking: 4, confederation: "UEFA" },
      { name: "Senegal", code: "SEN", flag: "🇸🇳", fifaRanking: 18, confederation: "CAF" },
      { name: "Norway", code: "NOR", flag: "🇳🇴", fifaRanking: 47, confederation: "UEFA" },
      { name: "Iraq", code: "IRQ", flag: "🇮🇶", fifaRanking: 55, confederation: "AFC" },
    ],
  },
  {
    name: "Group J",
    teams: [
      { name: "Argentina", code: "ARG", flag: "🇦🇷", fifaRanking: 1, confederation: "CONMEBOL" },
      { name: "Algeria", code: "ALG", flag: "🇩🇿", fifaRanking: 31, confederation: "CAF" },
      { name: "Austria", code: "AUT", flag: "🇦🇹", fifaRanking: 23, confederation: "UEFA" },
      { name: "Jordan", code: "JOR", flag: "🇯🇴", fifaRanking: 67, confederation: "AFC" },
    ],
  },
  {
    name: "Group K",
    teams: [
      { name: "Portugal", code: "POR", flag: "🇵🇹", fifaRanking: 7, confederation: "UEFA" },
      { name: "Colombia", code: "COL", flag: "🇨🇴", fifaRanking: 10, confederation: "CONMEBOL" },
      { name: "Uzbekistan", code: "UZB", flag: "🇺🇿", fifaRanking: 62, confederation: "AFC" },
      { name: "DR Congo", code: "COD", flag: "🇨🇩", fifaRanking: 56, confederation: "CAF" },
    ],
  },
  {
    name: "Group L",
    teams: [
      { name: "England", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", fifaRanking: 12, confederation: "UEFA" },
      { name: "Croatia", code: "CRO", flag: "🇭🇷", fifaRanking: 17, confederation: "UEFA" },
      { name: "Ghana", code: "GHA", flag: "🇬🇭", fifaRanking: 64, confederation: "CAF" },
      { name: "Panama", code: "PAN", flag: "🇵🇦", fifaRanking: 41, confederation: "CONCACAF" },
    ],
  },
];

export const allTeams = groups.flatMap((g) => g.teams);
