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
import { IDataRepresentation, IDataRepresentationSeries } from "../converter/data/dataRepresentation";
import { StaleDataContainerItem } from "../settings/descriptors/staleDataDescriptor";
import { DataGapDescriptor } from "../settings/descriptors/dataGapDescriptor";
import { ISubtitleComponentRenderOptions, SubtitleComponent } from "./subtitleComponent";
import { IVisualComponentConstructorOptions } from "./visualComponentConstructorOptions";
import { DataGapDetector } from "../utils/dataGapDetector";
import { getFormattedDate } from "../converter/data/dataFormatter";
import { FormatDescriptor } from "../settings/descriptors/formatDescriptor";

import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import { SubtitleBaseContainerItem } from "../settings/descriptors/subtitleBaseDescriptor";

export interface ISubtitleWarningComponentRenderOptions extends ISubtitleComponentRenderOptions {
    warningState: number;
    subtitleSettings: SubtitleBaseContainerItem;
    staleDataSettings: StaleDataContainerItem;
    dataGapSettings: DataGapDescriptor;
    dateSettings: FormatDescriptor;
    series: IDataRepresentationSeries[];
    dataRepresentation: IDataRepresentation;
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
    private dataGapSelector: CssConstants.ClassAndSelector = this.getSelectorWithPrefix("dataGap");
    private startDateHintSelector: CssConstants.ClassAndSelector = this.getSelectorWithPrefix("startDateHint");

    constructor(options: IVisualComponentConstructorOptions) {
        super(options);

        this.element.classed(this.getClassNameWithPrefix("subtitleWarningComponent"), true);
    }

    public render(options: ISubtitleWarningComponentRenderOptions): void {
        const {
            staleDataSettings,
            dataGapSettings,
            subtitleSettings,
            warningState,
            series,
            dataRepresentation,
            dateSettings,
        } = options;

        this.renderWarningMessage(warningState, subtitleSettings.warningText.value);
        super.render(options);
        this.renderStaleData(staleDataSettings, series);
        this.renderDataGapWarning(dataGapSettings, dataRepresentation);
        this.renderStartDateHint(dataRepresentation, dateSettings);
    }

    private renderStartDateHint(dataRepresentation: IDataRepresentation, dateSettings: FormatDescriptor): void {
        const adjustment = dataRepresentation.startDateAdjustment;
        const isShown: boolean = !!adjustment?.isAdjusted;

        let tooltipItems: VisualTooltipDataItem[] = [];

        if (isShown) {
            let message: string;

            if (adjustment.isInvalidInput) {
                const template: string = this.constructorOptions.localizationManager?.getDisplayName("Visual_StartDateHint_Invalid") ?? "Visual_StartDateHint_Invalid";
                message = `\u26A0\uFE0F ${template.replace("${1}", adjustment.requestedText ?? "")}`;
            } else {
                const dateFormat: string = dateSettings?.format?.value;
                const requested: string = getFormattedDate(adjustment.requestedDate, dateFormat);
                const actual: string = getFormattedDate(adjustment.actualDate, dateFormat);

                const messageKey: string = adjustment.isOutOfRange
                    ? "Visual_StartDateHint_OutOfRange"
                    : "Visual_StartDateHint_Gap";

                const template: string = this.constructorOptions.localizationManager?.getDisplayName(messageKey) ?? messageKey;
                message = `\u26A0\uFE0F ${template.replace("${1}", requested).replace("${2}", actual)}`;
            }

            tooltipItems = [{
                displayName: null,
                value: message,
            }];
        }

        this.renderIcon({
            backgroundColor: null,
            color: null,
            isShown,
            selector: this.startDateHintSelector,
            tooltipItems,
        });
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
        defaultStaleDataSettings: StaleDataContainerItem,
        series: IDataRepresentationSeries[]): void {
        const staleSeries: IDataRepresentationSeries[] = series.filter((s) => {
            const settings: StaleDataContainerItem = s.settings.staleData;

            return settings.isShown.value
                && !!s.staleDateDifference
                && s.staleDateDifference - +settings.staleDataThreshold.value > 0;
        });

        const titles: string[] = staleSeries.map((s) => {
            const settings: StaleDataContainerItem = s.settings.staleData;

            return this.getTitle(
                settings.staleDataText.value,
                s.staleDateDifference,
                settings.deductThresholdDays.value ? +settings.staleDataThreshold.value : 0,
            );
        });

        const isSameTitle: boolean = titles.every((title) => title === titles[0]);

        const tooltipItems: VisualTooltipDataItem[] = isSameTitle
            ? [{ displayName: null, value: titles[0] }]
            : staleSeries.map((s, index) => ({ displayName: s.name, value: titles[index] }));

        const iconSettings: StaleDataContainerItem = staleSeries[0]?.settings.staleData ?? defaultStaleDataSettings;

        this.renderIcon({
            backgroundColor: iconSettings.backgroundColor.value.value,
            color: iconSettings.color.value.value,
            isShown: staleSeries.length > 0,
            selector: this.dataAgeSelector,
            tooltipItems,
        });
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

    private renderDataGapWarning(
        dataGapSettings: DataGapDescriptor,
        dataRepresentation: IDataRepresentation
    ): void {
        const {
            backgroundColor,
            color,
            isShown,
            gapMessage,
        } = dataGapSettings;

        const hasGaps = dataRepresentation.dataGapInfo?.hasGaps ?? false;
        const totalMissingDays = dataRepresentation.dataGapInfo?.totalMissingDays ?? 0;

        let tooltipItems: VisualTooltipDataItem[];

        if (hasGaps && totalMissingDays > 0) {
            const formattedMessage = DataGapDetector.formatGapMessage(gapMessage.value, totalMissingDays);
            
            if (dataRepresentation.dataGapInfo?.seriesGaps) {
                const seriesWithGaps = Object.entries(dataRepresentation.dataGapInfo.seriesGaps)
                    .filter(([, gapInfo]) => gapInfo.hasGaps);

                if (seriesWithGaps.length > 1) {
                    tooltipItems = seriesWithGaps.map(([seriesName, gapInfo]) => ({
                        displayName: seriesName,
                        value: DataGapDetector.formatGapMessage(gapMessage.value, gapInfo.totalMissingDays),
                    }));
                } else {
                    tooltipItems = [{
                        displayName: null,
                        value: formattedMessage,
                    }];
                }
            } else {
                tooltipItems = [{
                    displayName: null,
                    value: formattedMessage,
                }];
            }
        }

        this.renderIcon({
            backgroundColor: backgroundColor.value.value,
            color: color.value.value,
            isShown: isShown.value && hasGaps,
            selector: this.dataGapSelector,
            tooltipItems: tooltipItems || [],
        });
    }
}
