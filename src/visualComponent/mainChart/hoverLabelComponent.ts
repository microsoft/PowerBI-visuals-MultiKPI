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

import powerbi from "powerbi-visuals-api";

import { ChartLabelBaseComponent, IRenderGroup } from "./chartLabelBaseComponent";

import { createVarianceConverterByType } from "../../converter/variance/createVarianceConverterByType";

import { IDataRepresentationPoint } from "../../converter/data/dataRepresentation";

import {
    getFormattedDate,
    getFormattedValueWithFallback,
} from "../../converter/data/dataFormatter";

import { isValueValid } from "../../utils/isValueValid";

import { IVerticalReferenceLineComponentRenderOptions } from "../verticalReferenceLineComponent";
import { IVisualComponentConstructorOptions } from "../visualComponentConstructorOptions";

import { KpiOnHoverDescriptor } from "../../settings/descriptors/kpi/kpiOnHoverDescriptor";
import { VarianceContainerItem } from "../../settings/descriptors/varianceDescriptor";

import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

export interface IHoverLabelComponentRenderOptions extends IVerticalReferenceLineComponentRenderOptions {
    kpiOnHoverSettings: KpiOnHoverDescriptor;
    varianceSettings: VarianceContainerItem;
}

export class HoverLabelComponent extends ChartLabelBaseComponent<IHoverLabelComponentRenderOptions> {
    constructor(options: IVisualComponentConstructorOptions) {
        super(options);

        this.element.classed(
            this.getClassNameWithPrefix("hoverLabelComponent"),
            true,
        );
    }

    public render(options: IHoverLabelComponentRenderOptions) {
        const {
            series,
            dataPoint,
            kpiOnHoverSettings,
            dateSettings,
            varianceSettings,
        } = options;

        this.updateFormatting(this.element, kpiOnHoverSettings);

        if (!series || !series.points || !dataPoint || !series.points.length) {
            this.hide();
            return;
        } else {
            this.show();
        }

        const latestDataPoint: IDataRepresentationPoint = series.current;
        const variance: number = createVarianceConverterByType(varianceSettings.shouldCalculateDifference.value)
            .convert({
                firstDataPoint: dataPoint,
                secondDataPoint: latestDataPoint,
            });

        this.renderGroup(
            this.headerSelector,
            [
                {
                    color: kpiOnHoverSettings.seriesNameColor.value.value,
                    data: series.name,
                    fontSizeInPt: kpiOnHoverSettings.autoAdjustFontSize.value
                        ? null
                        : kpiOnHoverSettings.seriesNameFontSize.value,
                    isShown: kpiOnHoverSettings.isSeriesNameShown.value,
                },
            ],

        );

        const isVarianceValid: boolean = isValueValid(variance);
        const tooltipText: string = series && series.formattedTooltip || null;
        let tooltipDataItems: VisualTooltipDataItem[];

        if (tooltipText) {
            tooltipDataItems = [{
                displayName: null,
                value: tooltipText,
            }];
        }

        this.renderGroup(
            this.bodySelector,
            [
                {
                    color: kpiOnHoverSettings.valueColor.value.value,
                    data: getFormattedValueWithFallback((latestDataPoint ? latestDataPoint.y : NaN), series.settings.values),
                    fontSizeInPt: kpiOnHoverSettings.autoAdjustFontSize.value
                        ? null
                        : kpiOnHoverSettings.valueFontSize.value,
                    isShown: kpiOnHoverSettings.isValueShown.value,
                    tooltipDataItems,
                },
                {
                    color: isVarianceValid
                        ? kpiOnHoverSettings.varianceColor.value.value
                        : kpiOnHoverSettings.varianceNotAvailableColor.value.value,
                    data: `(${getFormattedValueWithFallback(variance, varianceSettings)})`,
                    fontSizeInPt: kpiOnHoverSettings.autoAdjustFontSize.value
                        ? null
                        : isVarianceValid 
                            ? kpiOnHoverSettings.varianceFontSize.value
                            : kpiOnHoverSettings.varianceNotAvailableFontSize.value,
                    isShown: kpiOnHoverSettings.isVarianceShown.value,
                    selector: isVarianceValid || !kpiOnHoverSettings.autoAdjustFontSize.value
                        ? undefined
                        : this.varianceNotAvailableSelector,
                    tooltipDataItems,
                },
            ],
        );

        const dateGroup: IRenderGroup[] = [
            {
                color: kpiOnHoverSettings.currentValueColor.value.value,
                data: getFormattedValueWithFallback(dataPoint.y, series.settings.values),
                fontSizeInPt: kpiOnHoverSettings.autoAdjustFontSize.value
                    ? null
                    : kpiOnHoverSettings.currentValueFontSize.value,
                isShown: kpiOnHoverSettings.isCurrentValueShown.value,
            },
            {
                color: kpiOnHoverSettings.dateColor.value.value,
                data: getFormattedDate(dataPoint.x, dateSettings.getFormat()),
                fontSizeInPt: kpiOnHoverSettings.autoAdjustFontSize.value
                    ? null
                    : kpiOnHoverSettings.dateFontSize.value,
                isShown: kpiOnHoverSettings.isDateShown.value,
            },
        ];

        const dateGroupToRender: IRenderGroup[] = kpiOnHoverSettings.isCurrentValueLeftAligned.value
            ? dateGroup
            : [...dateGroup].reverse(); // Makes dateGroupBase array immutable

        this.renderGroup(
            this.footerSelector,
            dateGroupToRender,
        );
    }
}
