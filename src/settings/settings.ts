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
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import ISelectionId = powerbi.visuals.ISelectionId;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import ISandboxExtendedColorPalette = powerbi.extensibility.ISandboxExtendedColorPalette;

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import FormattingSettingsModel = formattingSettings.Model;
import FormattingSettingsCard = formattingSettings.Cards;

import { AxisDescriptor } from "./descriptors/axisDescriptor";
import { PrintDescriptor } from "./descriptors/printDescriptor";
import { ChartDescriptor } from "./descriptors/chartDescriptor";
import { DateDescriptor } from "./descriptors/dateDescriptor";
import { GridDescriptor } from "./descriptors/gridDescriptor";
import { KpiDescriptor } from "./descriptors/kpi/kpiDescriptor";
import { KpiOnHoverDescriptor } from "./descriptors/kpi/kpiOnHoverDescriptor";
import { SparklineNameDescriptor } from "./descriptors/sparklineNameDescriptor";
import { SparklineValueDescriptor } from "./descriptors/sparklineValueDescriptor";
import { SparklineAxisDescriptor } from "./descriptors/sparkline/sparklineAxisDescriptor";
import { SparklineChartDescriptor } from "./descriptors/sparkline/sparklineChartDescriptor";
import { SparklineDescriptor } from "./descriptors/sparkline/sparklineDescriptor";
import { StaleDataDescriptor } from "./descriptors/staleDataDescriptor";
import { SubtitleContainerItem } from "./descriptors/subtitleDescriptor";
import { TooltipDescriptor } from "./descriptors/tooltipDescriptor";
import { ValuesDescriptor } from "./descriptors/valuesDescriptor";
import { VarianceDescriptor } from "./descriptors/varianceDescriptor";
import { IDescriptor } from "./descriptors/descriptor";
import { AxisBaseContainerItem } from "./descriptors/axisBaseDescriptor";
import { BaseContainerDescriptor } from "./descriptors/container/baseContainerDescriptor";
import { SeriesSettings } from "./seriesSettings";
import { FormatDescriptor } from "./descriptors/formatDescriptor";

export class Settings extends FormattingSettingsModel {
    public date: DateDescriptor = new DateDescriptor();
    public values: ValuesDescriptor = new ValuesDescriptor();
    public variance: VarianceDescriptor = new VarianceDescriptor();
    public yAxis: AxisDescriptor = new AxisDescriptor();
    public chart: ChartDescriptor = new ChartDescriptor();
    public tooltip: TooltipDescriptor = new TooltipDescriptor();
    public kpi: KpiDescriptor = new KpiDescriptor();
    public kpiOnHover: KpiOnHoverDescriptor = new KpiOnHoverDescriptor();
    public grid: GridDescriptor = new GridDescriptor();
    public sparkline: SparklineDescriptor = new SparklineDescriptor();
    public sparklineLabel: SparklineNameDescriptor = new SparklineNameDescriptor();
    public sparklineChart: SparklineChartDescriptor = new SparklineChartDescriptor();
    public sparklineYAxis: SparklineAxisDescriptor = new SparklineAxisDescriptor();
    public sparklineValue: SparklineValueDescriptor = new SparklineValueDescriptor();
    public subtitle: SubtitleContainerItem = new SubtitleContainerItem();
    public staleData: StaleDataDescriptor = new StaleDataDescriptor();
    public printMode: PrintDescriptor = new PrintDescriptor();

    public cards: FormattingSettingsCard[] = [
        this.date, this.values, this.variance,
        this.yAxis, this.chart, this.tooltip,
        this.kpi, this.kpiOnHover, this.grid, this.sparkline,
        this.sparklineLabel, this.sparklineChart,
        this.sparklineValue, this.sparklineYAxis,
        this.subtitle, this.staleData, this.printMode
    ]

    public parse(colorPalette: ISandboxExtendedColorPalette, localizationManager: ILocalizationManager): void {
        if (this.staleData.staleDataText.value === "") {
            this.staleData.staleDataText.value = "Data is ${1} days late." + (this.subtitle.staleDataText || "");
        }

        if (!this.subtitle.show.value) {
            this.staleData.isShown.value = false;
        }

        this.updateFormatPropertyValue();

        this.cards.forEach((card) => {
            const settings: IDescriptor = card as IDescriptor;
    
            if (settings.parse) {
                settings.parse();
            }

            if (settings.processHighContrastMode) {
                settings.processHighContrastMode(colorPalette);
            }

            if (settings.setLocalizedDisplayName) {
                settings.setLocalizedDisplayName(localizationManager);
            }

        });
    }

    private updateFormatPropertyValue(): void {
        this.cards.forEach((card) => {
            if (card instanceof BaseContainerDescriptor){
                card.container.containerItems.forEach((item) => {
                    if (item instanceof FormatDescriptor){
                        item.format.value = item.getFormat();
                    }
                    if (item instanceof AxisBaseContainerItem){
                        item.min.value = item.getMin();
                        item.max.value = item.getMax();   
                    }
                })
            }
        });
    }

    public populateContainers(dataPoint: DataViewMetadataColumn, selectionId: ISelectionId): void {
        this.cards.forEach((card) => {
            if (card instanceof BaseContainerDescriptor){
                const newContainerItem = card.createContainerItem(dataPoint, selectionId);
                card.populateContainer(newContainerItem);
            }
        })
    }

    public getSettingsForSeries(seriesName: string): SeriesSettings {
        const currentSettings: SeriesSettings = new SeriesSettings();
        this.cards.forEach((card) => {
            const settingName: string = card.name;
            if (card instanceof BaseContainerDescriptor){
                currentSettings[settingName] = card.getCurrentContainer(seriesName);
            }
        });
        
        currentSettings.staleData = this.staleData;
        return currentSettings;
    }
}
