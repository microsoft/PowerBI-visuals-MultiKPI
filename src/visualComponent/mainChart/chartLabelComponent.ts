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

export interface ChartLabelComponentRenderOptions extends VisualComponentRenderOptionsBase {
    dateSettings: FormatDescriptor;
    kpiSettings: KpiDescriptor;
    series: DataRepresentationSeries;
    viewport: IViewport;
}

export class ChartLabelComponent extends ChartLabelBaseComponent<ChartLabelComponentRenderOptions> {
    private componentClassName: string = "chartLabelComponent";

    constructor(options: VisualComponentConstructorOptions) {
        super(options);

        this.element.classed(
            this.getClassNameWithPrefix(this.componentClassName),
            true
        );

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onMouseMove}.${this.componentClassName}`,
            this.hide.bind(this)
        );

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onMouseOut}.${this.componentClassName}`,
            this.show.bind(this)
        );
    }

    public render(options: ChartLabelComponentRenderOptions): void {
        const {
            series,
            kpiSettings,
        } = options;

        this.updateFormatting(this.element, options.kpiSettings);

        if (!series || !series.points) {
            this.hide();

            return;
        } else {
            this.show();
        }

        const value: number = series.points[series.points.length - 1].y;

        this.renderGroup(
            this.headerSelector,
            [
                {
                    data: series.name,
                    isShown: kpiSettings.isSeriesNameShown,
                    fontSizeInPt: kpiSettings.seriesNameFontSize,
                    color: kpiSettings.seriesNameColor,
                }
            ]
        );

        const isVarianceValid: boolean = VarianceChecker.isVarianceValid(series.variance);

        this.renderGroup(
            this.bodySelector,
            [
                {
                    data: DataFormatter.getFormattedValue(value, series.settings.values),
                    isShown: kpiSettings.isValueShown,
                    fontSizeInPt: kpiSettings.valueFontSize,
                    color: kpiSettings.valueColor,
                },
                {
                    data: `(${series.formattedVariance})`,
                    selector: isVarianceValid || !kpiSettings.autoAdjustFontSize
                        ? undefined
                        : this.varianceNotAvailableSelector,
                    color: isVarianceValid
                        ? kpiSettings.varianceColor
                        : kpiSettings.varianceNotAvailableColor,
                    isShown: kpiSettings.isVarianceShown,
                    fontSizeInPt: isVarianceValid
                        ? kpiSettings.varianceFontSize
                        : kpiSettings.varianceNotAvailableFontSize,
                }
            ]
        );

        this.renderGroup(
            this.footerSelector,
            [
                {
                    data: `${series.dateDifference} days`,
                    isShown: kpiSettings.isDateShown,
                    fontSizeInPt: kpiSettings.dateFontSize,
                    color: kpiSettings.dateColor,
                }
            ]
        );
    }
}
