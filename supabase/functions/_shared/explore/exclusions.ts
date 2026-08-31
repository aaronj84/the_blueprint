/**
 * Known friendly / test opponents used in golden checks.
 * Season stats exclude these via v_brighton_shots_official (stat_scope), not by name hide.
 * Must match migrate_semantic_layer.sql verification notes.
 */
export const KNOWN_FRIENDLY_OPPONENTS = ["Raya Vallecano SC"] as const;

/** @deprecated Use KNOWN_FRIENDLY_OPPONENTS; Explore no longer hard-hides these names. */
export const EXCLUDED_EXPLORE_OPPONENTS = KNOWN_FRIENDLY_OPPONENTS;
