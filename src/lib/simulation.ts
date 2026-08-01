// Whether the dashboard counts simulated forecasts. "real" leaves them out
// entirely — not just out of the sums, out of the derived period too, so the
// board reads exactly as it would if they had never been registered. "all"
// counts them like any other forecast.
//
// Both ends of the wire read the default from here, the way CEILING_CAPS does:
// the route parses `?simulation=` against this tuple and the screen seeds its
// state from it, so the server's idea of "nothing asked for" and the UI's idea
// of "nothing picked yet" cannot drift.
export const SIMULATION_VIEWS = ["real", "all"] as const;

export type SimulationView = (typeof SIMULATION_VIEWS)[number];

export const DEFAULT_SIMULATION_VIEW: SimulationView = "real";
