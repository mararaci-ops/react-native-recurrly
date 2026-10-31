# PostHog Data Warehouse Source Setup

Created 0 of 2 detected sources in PostHog. The Clerk credential prompt timed out, so Clerk and Expo need browser setup.

## Project changes

- No application source code or configuration was changed.
- Checked for `CLERK_SECRET_KEY`; it was not set in the project's environment files.
- Prepared secure browser setup handoffs for the detected Clerk and Expo sources.

## Files created

- `posthog-warehouse-report.md` — this setup report.

No existing files were modified.

## Manual steps

1. Connect **Clerk** in PostHog: [Open Clerk source setup](https://eu.posthog.com/project/324251/data-warehouse/new-source?kind=Clerk&utm_source=wizard&utm_campaign=warehouse-source). Use the Clerk live secret key from Clerk Dashboard → API Keys.
2. Connect **Expo** in PostHog: [Open Expo source setup](https://eu.posthog.com/project/324251/data-warehouse/new-source?kind=Expo&utm_source=wizard&utm_campaign=warehouse-source). Enter an Expo personal or robot access token and the Expo project ID.
3. Complete each source's table and sync selections in the PostHog browser flow.

No warehouse source was created during this run, so there are no active table syncs to report.
