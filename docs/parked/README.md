# Parked pages

Pages here are NOT built (the generator only reads `src/pages/`). They are kept
out of the site, not deleted.

## guide-fsa.html — pulled Oct 10, 2026

The page told readers that enrolling in Medicare generally ends medical FSA
contributions (lines 57 and 89, and the "Medicare trap" section). An independent
audit found no primary source for that. The Medicare-enrollment contribution
bar it did find (IRS Publication 969) is for HSAs, not health FSAs. The URL
`/guides/fsa-limits-2026` now 301-redirects to `/guides` (`src/static/_redirects`).

To restore: rewrite the Medicare section against a primary source, move the file
back to `src/pages/`, add the guides-hub card, and remove the redirect.
