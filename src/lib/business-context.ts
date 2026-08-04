/**
 * Cookie name for the person's "current business" — one authenticated
 * session may belong to multiple businesses (Identity Domain Schema —
 * business_members is many-to-many between profiles and businesses).
 * Zero framework dependencies so it's reusable from server and client code.
 */
export const currentBusinessCookieName = "bam-current-business";
