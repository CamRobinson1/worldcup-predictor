export interface ScheduleEntry {
  date: string;
  time: string;
  phase: "group" | "r32" | "r16" | "qf" | "sf" | "final";
  label: string;
  venue: string;
}

export const schedule: ScheduleEntry[] = [
  // Group Stage - June 11-24
  { date: "Jun 11", time: "5:00 PM", phase: "group", label: "Group A: Mexico vs South Africa", venue: "azteca" },
  { date: "Jun 11", time: "8:00 PM", phase: "group", label: "Group A: South Korea vs Czech Republic", venue: "nrg" },
  { date: "Jun 12", time: "2:00 PM", phase: "group", label: "Group B: Canada vs Switzerland", venue: "bcplace" },
  { date: "Jun 12", time: "5:00 PM", phase: "group", label: "Group B: Qatar vs Bosnia & Herzegovina", venue: "gillette" },
  { date: "Jun 12", time: "8:00 PM", phase: "group", label: "Group C: Brazil vs Morocco", venue: "hardrock" },
  { date: "Jun 13", time: "2:00 PM", phase: "group", label: "Group C: Scotland vs Haiti", venue: "att" },
  { date: "Jun 13", time: "5:00 PM", phase: "group", label: "Group D: United States vs Paraguay", venue: "sofi" },
  { date: "Jun 13", time: "8:00 PM", phase: "group", label: "Group D: Australia vs Turkey", venue: "metlife" },
  { date: "Jun 14", time: "2:00 PM", phase: "group", label: "Group E: Germany vs Curaçao", venue: "mercedes" },
  { date: "Jun 14", time: "5:00 PM", phase: "group", label: "Group E: Ivory Coast vs Ecuador", venue: "bbva" },
  { date: "Jun 14", time: "8:00 PM", phase: "group", label: "Group F: Netherlands vs Japan", venue: "levis" },
  { date: "Jun 15", time: "2:00 PM", phase: "group", label: "Group F: Sweden vs Tunisia", venue: "lumen" },
  { date: "Jun 15", time: "5:00 PM", phase: "group", label: "Group G: Belgium vs Egypt", venue: "lincoln" },
  { date: "Jun 15", time: "8:00 PM", phase: "group", label: "Group G: Iran vs New Zealand", venue: "bmo" },
  { date: "Jun 16", time: "2:00 PM", phase: "group", label: "Group H: Spain vs Cape Verde", venue: "att" },
  { date: "Jun 16", time: "5:00 PM", phase: "group", label: "Group H: Saudi Arabia vs Uruguay", venue: "arrowhead" },
  { date: "Jun 16", time: "8:00 PM", phase: "group", label: "Group I: France vs Senegal", venue: "metlife" },
  { date: "Jun 17", time: "2:00 PM", phase: "group", label: "Group I: Norway vs Iraq", venue: "akron" },
  { date: "Jun 17", time: "5:00 PM", phase: "group", label: "Group J: Argentina vs Algeria", venue: "hardrock" },
  { date: "Jun 17", time: "8:00 PM", phase: "group", label: "Group J: Austria vs Jordan", venue: "sofi" },
  { date: "Jun 18", time: "2:00 PM", phase: "group", label: "Group K: Portugal vs Uzbekistan", venue: "nrg" },
  { date: "Jun 18", time: "5:00 PM", phase: "group", label: "Group K: Colombia vs DR Congo", venue: "mercedes" },
  { date: "Jun 18", time: "8:00 PM", phase: "group", label: "Group L: England vs Croatia", venue: "azteca" },
  { date: "Jun 19", time: "2:00 PM", phase: "group", label: "Group L: Ghana vs Panama", venue: "lincoln" },
  // Matchday 2
  { date: "Jun 19", time: "5:00 PM", phase: "group", label: "Group A: Mexico vs Czech Republic", venue: "azteca" },
  { date: "Jun 19", time: "8:00 PM", phase: "group", label: "Group A: South Korea vs South Africa", venue: "nrg" },
  { date: "Jun 20", time: "2:00 PM", phase: "group", label: "Group B: Canada vs Bosnia & Herzegovina", venue: "bcplace" },
  { date: "Jun 20", time: "5:00 PM", phase: "group", label: "Group C: Brazil vs Haiti", venue: "hardrock" },
  { date: "Jun 20", time: "8:00 PM", phase: "group", label: "Group D: United States vs Turkey", venue: "sofi" },
  { date: "Jun 21", time: "2:00 PM", phase: "group", label: "Group E: Germany vs Ecuador", venue: "mercedes" },
  { date: "Jun 21", time: "5:00 PM", phase: "group", label: "Group F: Netherlands vs Tunisia", venue: "levis" },
  { date: "Jun 21", time: "8:00 PM", phase: "group", label: "Group G: Belgium vs New Zealand", venue: "lincoln" },
  { date: "Jun 22", time: "2:00 PM", phase: "group", label: "Group H: Spain vs Uruguay", venue: "att" },
  { date: "Jun 22", time: "5:00 PM", phase: "group", label: "Group I: France vs Iraq", venue: "metlife" },
  { date: "Jun 22", time: "8:00 PM", phase: "group", label: "Group J: Argentina vs Jordan", venue: "hardrock" },
  { date: "Jun 23", time: "2:00 PM", phase: "group", label: "Group K: Portugal vs DR Congo", venue: "nrg" },
  { date: "Jun 23", time: "5:00 PM", phase: "group", label: "Group L: England vs Panama", venue: "azteca" },
  // Matchday 3
  { date: "Jun 23", time: "8:00 PM", phase: "group", label: "Group A: Mexico vs South Korea", venue: "nrg" },
  { date: "Jun 24", time: "2:00 PM", phase: "group", label: "Group B: Switzerland vs Bosnia & Herzegovina", venue: "gillette" },
  { date: "Jun 24", time: "5:00 PM", phase: "group", label: "Group C: Morocco vs Scotland", venue: "att" },
  { date: "Jun 24", time: "8:00 PM", phase: "group", label: "Group D: Paraguay vs Australia", venue: "metlife" },

  // Round of 32 - June 27-30
  { date: "Jun 27", time: "4:00 PM", phase: "r32", label: "R32 Match 1", venue: "sofi" },
  { date: "Jun 27", time: "7:00 PM", phase: "r32", label: "R32 Match 2", venue: "att" },
  { date: "Jun 28", time: "1:00 PM", phase: "r32", label: "R32 Match 3", venue: "metlife" },
  { date: "Jun 28", time: "4:00 PM", phase: "r32", label: "R32 Match 4", venue: "hardrock" },
  { date: "Jun 28", time: "7:00 PM", phase: "r32", label: "R32 Match 5", venue: "nrg" },
  { date: "Jun 29", time: "1:00 PM", phase: "r32", label: "R32 Match 6", venue: "mercedes" },
  { date: "Jun 29", time: "4:00 PM", phase: "r32", label: "R32 Match 7", venue: "levis" },
  { date: "Jun 29", time: "7:00 PM", phase: "r32", label: "R32 Match 8", venue: "lincoln" },
  { date: "Jun 30", time: "1:00 PM", phase: "r32", label: "R32 Match 9", venue: "arrowhead" },
  { date: "Jun 30", time: "4:00 PM", phase: "r32", label: "R32 Match 10", venue: "lumen" },
  { date: "Jun 30", time: "7:00 PM", phase: "r32", label: "R32 Match 11", venue: "gillette" },
  { date: "Jul 1", time: "1:00 PM", phase: "r32", label: "R32 Match 12", venue: "bmo" },
  { date: "Jul 1", time: "4:00 PM", phase: "r32", label: "R32 Match 13", venue: "sofi" },
  { date: "Jul 1", time: "7:00 PM", phase: "r32", label: "R32 Match 14", venue: "att" },
  { date: "Jul 2", time: "4:00 PM", phase: "r32", label: "R32 Match 15", venue: "metlife" },
  { date: "Jul 2", time: "7:00 PM", phase: "r32", label: "R32 Match 16", venue: "hardrock" },

  // Round of 16 - July 3-6
  { date: "Jul 3", time: "4:00 PM", phase: "r16", label: "R16 Match 1", venue: "metlife" },
  { date: "Jul 3", time: "7:00 PM", phase: "r16", label: "R16 Match 2", venue: "att" },
  { date: "Jul 4", time: "1:00 PM", phase: "r16", label: "R16 Match 3", venue: "sofi" },
  { date: "Jul 4", time: "4:00 PM", phase: "r16", label: "R16 Match 4", venue: "hardrock" },
  { date: "Jul 5", time: "1:00 PM", phase: "r16", label: "R16 Match 5", venue: "nrg" },
  { date: "Jul 5", time: "4:00 PM", phase: "r16", label: "R16 Match 6", venue: "levis" },
  { date: "Jul 6", time: "1:00 PM", phase: "r16", label: "R16 Match 7", venue: "arrowhead" },
  { date: "Jul 6", time: "4:00 PM", phase: "r16", label: "R16 Match 8", venue: "lincoln" },

  // Quarter-Finals - July 9-10
  { date: "Jul 9", time: "4:00 PM", phase: "qf", label: "Quarter-Final 1", venue: "sofi" },
  { date: "Jul 9", time: "8:00 PM", phase: "qf", label: "Quarter-Final 2", venue: "metlife" },
  { date: "Jul 10", time: "4:00 PM", phase: "qf", label: "Quarter-Final 3", venue: "nrg" },
  { date: "Jul 10", time: "8:00 PM", phase: "qf", label: "Quarter-Final 4", venue: "att" },

  // Semi-Finals - July 13-14
  { date: "Jul 13", time: "8:00 PM", phase: "sf", label: "Semi-Final 1", venue: "att" },
  { date: "Jul 14", time: "8:00 PM", phase: "sf", label: "Semi-Final 2", venue: "metlife" },

  // Final - July 19
  { date: "Jul 19", time: "4:00 PM", phase: "final", label: "World Cup Final", venue: "metlife" },
];

export const phaseLabels: Record<string, string> = {
  group: "Group Stage",
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarter-Final",
  sf: "Semi-Final",
  final: "Final",
};

export const phaseColors: Record<string, string> = {
  group: "#3291ff",
  r32: "#7c3aed",
  r16: "#f59e0b",
  qf: "#ef4444",
  sf: "#10b981",
  final: "#f97316",
};
