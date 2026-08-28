/**
 * Opponents hidden from Explore (AI inquiries).
 * Must match explore.* views in migrate_explore.sql and SCHEMA_PROMPT EXCLUSIONS.
 * Tracker / Games / History still show these teams.
 */
export const EXCLUDED_EXPLORE_OPPONENTS = ["Raya Vallecano SC"] as const;
