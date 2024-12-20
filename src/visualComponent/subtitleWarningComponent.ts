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
import { Selection as d3Selection, BaseType} from "d3-selection";
type Selection = d3Selection<BaseType, unknown, BaseType, unknown>;

import powerbi from "powerbi-visuals-api";
import { CssConstants } from "powerbi-visuals-utils-svgutils";
import { IDataRepresentationSeries } from "../converter/data/dataRepresentation";
import { StaleDataDescriptor } from "../settings/descriptors/staleDataDescriptor";
import { ISubtitleComponentRenderOptions, SubtitleComponent } from "./subtitleComponent";
import { IVisualComponentConstructorOptions } from "./visualComponentConstructorOptions";

import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import { SubtitleBaseContainerItem } from "../settings/descriptors/subtitleBaseDescriptor";

export interface ISubtitleWarningComponentRenderOptions extends ISubtitleComponentRenderOptions {
    warningState: number;
    staleDataDifference: number;
    subtitleSettings: SubtitleBaseContainerItem;
    staleDataSettings: StaleDataDescriptor;
    series: IDataRepresentationSeries[];
}

interface IIcon {
    backgroundColor?: string;
    color?: string;
    isShown: boolean;
    selector: CssConstants.ClassAndSelector;
    tooltipItems?: VisualTooltipDataItem[];
}

export class SubtitleWarningComponent extends SubtitleComponent {
    private warningSelector: CssConstants.ClassAndSelector = this.getSelectorWithPrefix("warning");
    private dataAgeSelector: CssConstants.ClassAndSelector = this.getSelectorWithPrefix("dataAge");

    constructor(options: IVisualComponentConstructorOptions) {
        super(options);

        this.element.classed(this.getClassNameWithPrefix("subtitleWarningComponent"), true);
    }

    public render(options: ISubtitleWarningComponentRenderOptions): void {
        const {
            staleDataSettings,
            subtitleSettings,
            warningState,
            series,
            staleDataDifference,
        } = options;

        this.renderWarningMessage(warningState, subtitleSettings.warningText.value);
        super.render(options);
        this.renderStaleData(staleDataSettings, series, staleDataDifference);
    }

    private renderWarningMessage(warningState: number, warningText: string): void {
        this.renderIcon({
            backgroundColor: null,
            color: null,
            isShown: !!(warningState > 0 && warningText),
            selector: this.warningSelector,
            tooltipItems: [
                {
                    displayName: undefined,
                    value: warningText,
                },
            ],
        });
    }

    private renderStaleData(
        staleDataSettings: StaleDataDescriptor,
        series: IDataRepresentationSeries[],
        staleDataDifference: number): void {
        const {
            backgroundColor,
            color,
            isShown,
            staleDataText,
            staleDataThreshold,
        } = staleDataSettings;

        const isDataStale: boolean = this.isDataStale(
            staleDataDifference,
            series,
        );

        let tooltipItems: VisualTooltipDataItem[] = [];

        const filterItemsFunc = (x: IDataRepresentationSeries) => {
            if (!x.settings.staleData.isShown.value) {
                return false;
            }
            if (x.staleDateDifference) {
                return (x.staleDateDifference - x.settings.staleData.staleDataThreshold.value > 0);
            }
            return false;
        };

        let isTheSameStaledays: boolean = true;
        let currentStaleDays: number | undefined;

        for (const sr of series) {
            if (currentStaleDays && sr.staleDateDifference && currentStaleDays !== sr.staleDateDifference) {
                isTheSameStaledays = false;
            } else {
                currentStaleDays = sr.staleDateDifference;
            }
        }

        if (!isTheSameStaledays) {
            tooltipItems = series.filter(filterItemsFunc).map((s) => {
                const title: string = this.getTitle(
                    s.settings.staleData.staleDataText.value,
                    s.staleDateDifference,
                    s.settings.staleData.deductThresholdDays.value ? s.settings.staleData.staleDataThreshold.value : 0,
                );

                return {
                    displayName: s.name,
                    value: title,
                };
            });
        } else {
            tooltipItems = [
                {
                    displayName: null,
                    value: this.getTitle(
                        staleDataText.value,
                        staleDataDifference,
                        staleDataSettings.deductThresholdDays.value ? staleDataThreshold.value : 0,
                    ),
                },
            ];
        }

        this.renderIcon({
            backgroundColor: backgroundColor.value.value,
            color: color.value.value,
            isShown: isShown && isDataStale,
            selector: this.dataAgeSelector,
            tooltipItems,
        });
    }

    private isDataStale(dateDifference: number, series: IDataRepresentationSeries[]): boolean {
        let isStale: boolean = false;
        series.forEach((s: IDataRepresentationSeries) => {
            if (dateDifference > +s.settings.staleData.staleDataThreshold.value) {
                isStale = true;
            }
        })
        return isStale;
    }

    public getTitle(stringTemplate: string, dateDifference: number, staleDataThreshold: number): string {
        const days: number = dateDifference - staleDataThreshold;
        return stringTemplate?.replace
            ? stringTemplate.replace("${1}", `${days}`)
            : stringTemplate;
    }

    private renderIcon({
        backgroundColor,
        color,
        isShown,
        selector,
        tooltipItems,
    }: IIcon): void {
        const iconSelection: Selection = this.element
            .selectAll(selector.selectorName)
            .data(isShown ? [1] : [])
            .join("div")
            .classed(selector.className, true)
            .style("color", color || null)
            .style("background-color", backgroundColor || null);

        this.constructorOptions.tooltipServiceWrapper.addTooltip(
            iconSelection,
            () => tooltipItems ? tooltipItems : null
        );
    }
}
