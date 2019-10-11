## 2.2.0
* API 2.6.1
* Packages update
* Upgraded tooltips that are build with using of "powerbi-visuals-utils-tooltiputils" library
* Principal tooltip was moved from the whole chart area into value and variant labels
* Model of area filling was changed for values that are under zero
* Was fixed a bag when cursor was shifted, if data of a chart started not from the beginning of a period
* Was added a new option "Show Latest Available As Current Value" into "Stale Data" option group to show a latter available value for each chart
* A tooltip regarding stale data now shows info for each chart (if option "Show Latest Available As Current Value" is anbled)
* Was added a new option "Deduct Threshold Days" into "Stale Data" option group to deduct threshold days from days that is showed in tooltips
* "No Value Label" property inside "Values" and "Variance" option groups to set custom text for measures if value or variance doesn't exist

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
