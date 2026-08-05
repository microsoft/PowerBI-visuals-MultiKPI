## 3.1.1.0
### Testing
* Migrate tests from Karma + Webpack to Vite + Vitest (browser mode with Playwright/Chromium)
* Stub `powerbi-visuals-api` in specs so the ambient `const enum`s survive the esbuild transform
* Replace Jasmine `done` callbacks with async/await tests built on the new `TestWrapper.render()` helper
* Replace Istanbul coverage with V8 coverage
* Remove obsolete specs for per-metric stale data settings, which the formatting model no longer supports

### Scripts
* Add `test:watch`, `test:coverage` and `test:typecheck` scripts
* Run the spec type check before every test run
* Install the Chromium binary from a dedicated `browsers` script (`browsers:ci` adds the Linux system packages) so test runs stay offline-friendly

### CI
* Provision the browser in its own workflow step before running the tests
* Scope the audit to shipped dependencies (`npm audit --audit-level=high --omit=dev`)
* Update the GitHub actions to v6

### Dependencies
* Move linting packages to `devDependencies` and drop the unused `regenerator-runtime`
* Drop the direct `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin` entries, which `typescript-eslint` already provides
* Update ESLint to v10, `powerbi-visuals-tools` to 7.2.1, `powerbi-visuals-api` to 5.11.1 and the visual utils to their 7.x releases

## 3.1.0.0
### New feature
* Add new option "Data Gaps" to detect missing days in time-series data and display a warning icon when gaps are found. The icon is shown by default and appears automatically whenever gaps are detected.
* Add Data Gaps controls to toggle the icon, adjust its colors, and set a custom message.
* Add a landing page (with the visual icon) shown when no fields are added, guiding the user to add Date and Values.
* Add empty-state messages for missing Date/Values fields, invalid or blank dates, and data with no valid values.
* Add a "Show start date" option in the KPI card to display the reference date next to the days count (e.g. "545 days (since 1/1/2024)").

### Fixes
* Fix "Change start date": the start date is now matched by calendar day, a missing date falls back to the next available date, and an out-of-range date falls back to the closest available date instead of showing a 0% change. A hint icon explains any adjustment.
  * **Note:** existing reports whose start date did not exactly match a data point may show a recalculated "% change" and days count. These are the corrected values.

## 3.0.1.0
### Fixes
* Add bold, italic and underline to sparkline value

## 3.0.0.0
* API 5.11.0
* Migrate to formatting model
* Add high contrast mode
* Add localization
* Update packages

## 2.3.1
* FIX (Regression): Hovering on sparklines did not cause changing of main grap for preview

## 2.3.0
* API 3.5.1
* Packages update
* Subtitle can be loaded form data also (will be merged with subtitle from options)
* Some of options from Stale Data option group can be set up for a metric
* New option "Auto Precision" that build values showing minimum 3 digits as 3.56 or 25.7 or 754 or 2345
* Context menu support
* FIXED: it is expected to see the line when values are the same but it will be shown a dot in sparklines and nothing in the main chart

## 2.2.1
* Fix for last date visual issue

## 2.2.0
* API 2.6.1
* Packages update
* Upgraded tooltips that are build with using of "powerbi-visuals-utils-tooltiputils" library
* Principal tooltip was moved from the whole chart area into value and variant labels
* Model of area filling was changed for values that are under zero
* Was fixed a bag when cursor was shifted, if data of a chart started not from the beginning of a period
* Was added a new option "Show Latest Available As Current Value" into "Values" option group to show a latter available value for each chart
* A tooltip regarding stale data now shows info for each chart (if option "Show Latest Available As Current Value" is anbled)
* Was added a new option "Deduct Threshold Days" into "Stale Data" option group to deduct threshold days from days that is showed in tooltips
* "Missing Value Label" property inside "Values" and "Missing Variance Label" inside "Variance" option groups to set custom text for measures if value or variance doesn't exist
* "Variance N/A Color" option was renamed to "Missing Variance Color"
* "Variance N/A Font Size" option was renamed to "Missing Variance Font Size"
* "Treat Empty Values As Zero" option was renamed to "Treat Empty/Missing Values As Zero"

## 2.1.1
* API 2.5.0
* Conditional loading of `core-js/stable` only for sandbox mode
* `@babel/polyfill` replacement by `core-js/stable`

## 2.1.0
* Adds Decimal Places, Precision and Format for variance values
* Fixes auto font size issue
* Adds Stale Data options (title pattern, threshold, color, and background)
* Adds alignment for subtitle
* Adds "On Hover Current Value" alignment
* Allows calculating a difference instead of growth for percentage metrics
* Allows to treat empty values as zero

## 2.0.0
* API 2.2.0
* PBIVIZ 3.x.x
