/**
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

export interface HoverLabelComponentRenderOptions extends VerticalReferenceLineComponentRenderOptions {
    kpiOnHoverSettings: KpiOnHoverDescriptor;
}

export class HoverLabelComponent extends ChartLabelBaseComponent<HoverLabelComponentRenderOptions> {
    constructor(options: VisualComponentConstructorOptions) {
        super(options);

        this.element.classed(
            this.getClassNameWithPrefix("hoverLabelComponent"),
            true
        );
    }

    public render(options: HoverLabelComponentRenderOptions) {
        const {
            series,
            dataPoint,
            kpiOnHoverSettings,
            dateSettings,
        } = options;

        this.updateFormatting(this.element, kpiOnHoverSettings);

        if (!series || !series.points || !dataPoint || !series.points.length) {
            this.hide();

            return;
        } else {
            this.show();
        }

        const latestDataPoint: DataRepresentationPoint = series.points[series.points.length - 1];

        const variance: number = createVarianceConverter()
            .convert({
                firstDataPoint: dataPoint,
                secondDataPoint: latestDataPoint,
            });

        const formatter: IValueFormatter = DataFormatter.getValueFormatter(
            latestDataPoint.y,
            series.settings.values
        );

        this.renderGroup(
            this.headerSelector,
            [
                {
                    data: series.name,
                    color: kpiOnHoverSettings.seriesNameColor,
                    isShown: kpiOnHoverSettings.isSeriesNameShown,
                    fontSizeInPt: kpiOnHoverSettings.seriesNameFontSize,
                },
            ],

        );

        const isVarianceValid: boolean = VarianceChecker.isVarianceValid(variance);

        this.renderGroup(
            this.bodySelector,
            [
                {
                    data: formatter.format(latestDataPoint.y),
                    color: kpiOnHoverSettings.valueColor,
                    isShown: kpiOnHoverSettings.isValueShown,
                    fontSizeInPt: kpiOnHoverSettings.valueFontSize,
                },
                {
                    data: `(${DataFormatter.getFormattedVariance(variance)})`,
                    selector: isVarianceValid || !kpiOnHoverSettings.autoAdjustFontSize
                        ? undefined
                        : this.varianceNotAvailableSelector,
                    color: isVarianceValid
                        ? kpiOnHoverSettings.varianceColor
                        : kpiOnHoverSettings.varianceNotAvailableColor,
                    isShown: kpiOnHoverSettings.isVarianceShown,
                    fontSizeInPt: isVarianceValid
                        ? kpiOnHoverSettings.varianceFontSize
                        : kpiOnHoverSettings.varianceNotAvailableFontSize,
                }
            ],
        );

        this.renderGroup(
            this.footerSelector,
            [
                {
                    data: formatter.format(dataPoint.y),
                    isShown: kpiOnHoverSettings.isCurrentValueShown,
                    fontSizeInPt: kpiOnHoverSettings.currentValueFontSize,
                    color: kpiOnHoverSettings.currentValueColor,
                },
                {
                    data: DataFormatter.getFormattedDate(dataPoint.x, dateSettings.getFormat()),
                    isShown: kpiOnHoverSettings.isDateShown,
                    fontSizeInPt: kpiOnHoverSettings.dateFontSize,
                    color: kpiOnHoverSettings.dateColor,
                },
            ],
        );
    }
}
