// Kill switch for the legacy "Conteo" (inventory cycle counting) and
// "Descansos" (staff rest-day scheduling) functionality. Set back to
// true to restore full access — no routes or code were removed, they
// are just gated off in src/middleware.ts while this workspace is
// repurposed for a different app.
export const LEGACY_MODULES_ENABLED = false;
