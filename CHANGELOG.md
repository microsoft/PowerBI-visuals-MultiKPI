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
