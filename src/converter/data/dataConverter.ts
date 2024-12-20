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
import DataView = powerbi.DataView;
import IViewport = powerbi.IViewport;
import PrimitiveValue = powerbi.PrimitiveValue;
import DataViewValueColumn = powerbi.DataViewValueColumn;
import DataViewValueColumns = powerbi.DataViewValueColumns;
import DataViewCategoryColumn= powerbi.DataViewCategoryColumn;

import ISelectionId = powerbi.visuals.ISelectionId;
import ISelectionIdBuilder = powerbi.visuals.ISelectionIdBuilder;

import {
    changeStartDateColumn,
    dateColumn,
    tooltipColumn,
    valueColumn,
    warningStateColumn,
    subtitleColumn,
} from "../../columns/columns";

import { AxisBaseContainerItem } from "../../settings/descriptors/axisBaseDescriptor";
import { SeriesSettings } from "../../settings/seriesSettings";
import { Settings } from "../../settings/settings";
import { IConverter } from "../converter";

import {
    IDataRepresentation,
    IDataRepresentationAxis,
    IDataRepresentationPoint,
    IDataRepresentationSeries,
    ViewportSize,
} from "../data/dataRepresentation";

import { SmoothDataConverter } from "./dataSmooth";

import {
    DataRepresentationScale,
    DataRepresentationTypeEnum,
} from "../data/dataRepresentationScale";

import { createVarianceConverterByType } from "../variance/createVarianceConverterByType";

import {
    getFormattedDate,
    getFormattedValueWithFallback,
} from "../data/dataFormatter";

export interface IColumnGroup {
    name: string;
    values: PrimitiveValue[];
    columns: (DataViewValueColumn | DataViewCategoryColumn)[];
}

export interface IColumnGroupByRole {
    [columnName: string]: IColumnGroup;
}

export interface IDataConverterConstructorOptions {
    createSelectionIdBuilder: () => ISelectionIdBuilder;
}

export interface IDataConverterOptions {
    dataView: DataView;
    settings: Settings;
    viewport: IViewport;
}

export class DataConverter implements IConverter<IDataConverterOptions, IDataRepresentation> {
    private increasedDomainValueInPercentage: number = 0.01;

    private smoothConverter: IConverter<IDataRepresentationPoint[], IDataRepresentationPoint[]> = new SmoothDataConverter();

    constructor(private constructorOptions: IDataConverterConstructorOptions) { }

    public convert(options: IDataConverterOptions): IDataRepresentation {
        const {
            dataView,
            settings,
            viewport,
        } = options;

        const dataRepresentation: IDataRepresentation = this.getDefaultData(settings.kpi.percentCalcDate);

        if (this.isDataViewValid(dataView)) {
            const columns: (DataViewValueColumn | DataViewCategoryColumn)[] = [
                ...this.getColumns(dataView.categorical.categories),
                ...this.getColumns(dataView.categorical.values),
            ];

            dataView.categorical.categories[0].values.forEach((_, index: number) => {
                const columnGroupByRole: IColumnGroupByRole = this.getColumnGroupByRole(columns, index);

                this.processData(
                    dataRepresentation,
                    columnGroupByRole,
                    settings,
                    dataView.categorical.values,
                );
            });

            this.postProcessData(dataRepresentation, settings);
        }

        dataRepresentation.viewportSize = this.getViewportSize(viewport);

        return dataRepresentation;
    }

    public findClosestDataPointByDate(
        dataPoints: IDataRepresentationPoint[],
        date: Date,
        defaultDataPoint: IDataRepresentationPoint,
    ): IDataRepresentationPoint {
        if (!dataPoints || !date || !(date instanceof Date)) {
            return defaultDataPoint;
        }

        const dateTime: number = date.getTime();

        let closestDataPoint: IDataRepresentationPoint;

        for (const dataPoint of dataPoints) {
            const currentTime: number = dataPoint.x.getTime();

            if (currentTime === dateTime) {
                closestDataPoint = dataPoint;

                break;
            }
            else if (currentTime < dateTime) {
                closestDataPoint = dataPoint;
            } else {
                break;
            }
        }

        return closestDataPoint || defaultDataPoint;
    }

    public isDataViewValid(dataView: DataView): boolean {
        return !!(dataView?.categorical?.categories?.[0]?.values?.length && dataView?.categorical?.values?.length);
    }

    protected getColumnGroupByRole(
        columns: (DataViewValueColumn | DataViewCategoryColumn)[],
        index: number,
    ): IColumnGroupByRole {
        const columnGroups: IColumnGroupByRole = {};

        columns.forEach((column: DataViewValueColumn | DataViewCategoryColumn) => {
            Object.keys(column.source.roles)
                .forEach((roleName: string) => {
                    if (!columnGroups[roleName]) {
                        columnGroups[roleName] = {
                            columns: [],
                            name: roleName,
                            values: [],
                        };
                    }

                    columnGroups[roleName].values.push(column.values[index]);
                    columnGroups[roleName].columns.push(column);
                });
        });

        return columnGroups;
    }

    private getColumns<Type>(columns: Type[]): Type[] {
        return columns.map((column) => column);
    }

    private getViewportSize(viewport: powerbi.IViewport): ViewportSize {
        if (viewport.height < 120 || viewport.width < 120) {
            return ViewportSize.tiny;
        } else if (viewport.height < 180 || viewport.width < 300) {
            return ViewportSize.small;
        } else if (viewport.height < 250 || viewport.width < 400) {
            return ViewportSize.medium;
        } else if (viewport.height < 400 || viewport.width < 500) {
            return ViewportSize.normal;
        } else if (viewport.height < 500 || viewport.width < 600) {
            return ViewportSize.big;
        } else if (viewport.height < 600 || viewport.width < 700) {
            return ViewportSize.huge;
        }

        return ViewportSize.enormous;
    }

    private getDefaultData(defaultPercentCalcDate?: Date): IDataRepresentation {
        return {
            latestDate: new Date(),
            percentCalcDate: defaultPercentCalcDate,
            series: [],
            sortedSeries: [],
            viewport: { width: 0, height: 0 },
            viewportSize: ViewportSize.tiny,
            warningState: NaN,
        };
    }

    private processData(
        dataRepresentation: IDataRepresentation,
        columnGroupByRole: IColumnGroupByRole,
        settings: Settings,
        valuesColumn: DataViewValueColumns,
    ): void {
        const dateColumnGroup: IColumnGroup = columnGroupByRole[dateColumn.name];
        const valueColumnGroup: IColumnGroup = columnGroupByRole[valueColumn.name];

        if (!dateColumnGroup
            || !dateColumnGroup.columns
            || !dateColumnGroup.columns.length
            || !valueColumnGroup
            || !valueColumnGroup.columns
            || !valueColumnGroup.columns.length
        ) {
            return;
        }

        settings.date.format.value = settings.date.format.value ?? dateColumnGroup.columns[0].source.format;

        const tooltipColumnGroup: IColumnGroup = columnGroupByRole[tooltipColumn.name];

        const {
            createSelectionIdBuilder,
        } = this.constructorOptions;

        valueColumnGroup.columns.forEach((column: DataViewValueColumn, columnIndex: number) => {
            const x: Date = <Date>(dateColumnGroup.values[0]);

            if (x instanceof Date && x !== undefined && x !== null) {
                if (!dataRepresentation.series[columnIndex]) {
                    const selectionId: ISelectionId = createSelectionIdBuilder()
                        .withSeries(valuesColumn, column)
                        .withMeasure(column.source.queryName)
                        .createSelectionId();

                    const seriesSettings: SeriesSettings = this.prepareSeriesSettings(settings, column, selectionId);
                    const series = this.initDataRepresentationSeries(
                        selectionId,
                        dataRepresentation.series.length,
                        column.source.displayName,
                        seriesSettings
                    );

                    dataRepresentation.series.push(series);
                    dataRepresentation.sortedSeries.push(series);
                }

                const seriesItem: IDataRepresentationSeries = dataRepresentation.series[columnIndex];
                const y: number = this.parseValue(
                    valueColumnGroup.values[columnIndex],
                    seriesItem.settings.values.treatEmptyValuesAsZero.value,
                );

                const dataPoint: IDataRepresentationPoint = {
                    index: seriesItem.points.length,
                    x,
                    y,
                };

                dataRepresentation.latestDate = x;

                if (seriesItem.points.length > 1 && (seriesItem.points[seriesItem.points.length - 1].y !== dataPoint.y)) {
                    seriesItem.isLine = false;
                }

                seriesItem.points.push(dataPoint);

                if (seriesItem.settings.values.showLatterAvailableValue.value) {
                    if (!isNaN(dataPoint.y)) {
                        seriesItem.current = dataPoint;
                    }
                } else {
                    seriesItem.current = dataPoint;
                }

                seriesItem.x.min = this.getMin(seriesItem.x.min, x);
                seriesItem.x.max = this.getMax(seriesItem.x.max, x);
                this.setupYMinMax(y, seriesItem);
                const tooltip: string = tooltipColumnGroup?.values?.[columnIndex].toString();
                dataRepresentation.series[columnIndex].tooltip = tooltip;
            }
        });

        const subtitleColumnGroup: IColumnGroup = columnGroupByRole[subtitleColumn.name];
        if (subtitleColumnGroup) {
            dataRepresentation.subtitle = subtitleColumnGroup.values[0].toString();
        }

        const warningColumnGroup: IColumnGroup = columnGroupByRole[warningStateColumn.name];
        if (warningColumnGroup) {
            dataRepresentation.warningState = <number>warningColumnGroup.values[0];
        }

        const changeStartDateColumnGroup: IColumnGroup = columnGroupByRole[changeStartDateColumn.name];
        if (changeStartDateColumnGroup) {
            const date: Date = <Date>changeStartDateColumnGroup?.values?.[0];

            dataRepresentation.percentCalcDate = date instanceof Date ? date : dataRepresentation.percentCalcDate;
        }
    }

    private setupYMinMax(y: number, seriesItem: IDataRepresentationSeries): void {
        if (!isNaN(y)) {
            seriesItem.y.min = this.getMin(
                seriesItem.y.min,
                y,
            );

            seriesItem.y.max = this.getMax(
                seriesItem.y.max,
                y,
            );

            seriesItem.ySparkline.min = this.getMin(
                seriesItem.ySparkline.min,
                y,
            );

            seriesItem.ySparkline.max = this.getMax(
                seriesItem.ySparkline.max,
                y,
            );
        }
    }

    private prepareSeriesSettings(settings: Settings, column: DataViewValueColumn, selectionId: ISelectionId): SeriesSettings {
        settings.populateContainers(column.source, selectionId);

        const seriesName: string = column.source.displayName;
        const seriesSettings: SeriesSettings = settings.getSettingsForSeries(seriesName);

        return seriesSettings;
    }

    private initDataRepresentationSeries(
        selectionId: ISelectionId,
        seriesLength: number,
        sourceDispalyName: string,
        seriesSettings: SeriesSettings
    ): IDataRepresentationSeries {
        return {
            current: undefined,
            dateDifference: undefined,
            formattedDate: "",
            formattedTooltip: undefined,
            formattedVariance: "",
            index: seriesLength,
            isLine: true,
            name: sourceDispalyName,
            points: [],
            selectionId,
            settings: seriesSettings,
            smoothedPoints: [],
            x: {
                initialMax: undefined,
                initialMin: undefined,
                max: undefined,
                min: undefined,
                scale: DataRepresentationScale.CREATE(),
            },
            y: {
                initialMax: undefined,
                initialMin: undefined,
                max: undefined,
                min: undefined,
                scale: DataRepresentationScale.CREATE(),
            },
            ySparkline: {
                initialMax: undefined,
                initialMin: undefined,
                max: undefined,
                min: undefined,
                scale: DataRepresentationScale.CREATE(),
            },

            tooltip: undefined,
            variance: undefined
        };
    }

    private postProcessData(dataRepresentation: IDataRepresentation, settings: Settings): void {
        dataRepresentation.staleDateDifference = 0;

        dataRepresentation.series.forEach((series: IDataRepresentationSeries) => {
            if (series?.current?.x) {
                series.staleDateDifference = this.getDaysBetween(series.current.x, new Date());
                if (series.staleDateDifference > dataRepresentation.staleDateDifference) {
                    dataRepresentation.staleDateDifference = series.staleDateDifference;
                }
            }

            series.x.initialMin = series.x.min;
            series.x.initialMax = series.x.max;

            series.y.initialMin = series.y.min;
            series.y.initialMax = series.y.max;

            series.ySparkline.initialMin = series.y.min;
            series.ySparkline.initialMax = series.y.max;

            series.x.scale.domain(
                [series.x.min, series.x.max],
                DataRepresentationTypeEnum.DateType,
            );

            this.applyScale(series.y, series.settings.yAxis);

            if (series.settings.sparklineYAxis.shouldInheritValues.value) {
                series.settings.sparklineYAxis.min.value = series.settings.sparklineYAxis.min.value ?? series.settings.yAxis.min.value;
                series.settings.sparklineYAxis.max.value = series.settings.sparklineYAxis.max.value ?? series.settings.yAxis.max.value;
            }

            this.applyScale(series.ySparkline, series.settings.sparklineYAxis);

            const startDataPoint: IDataRepresentationPoint = this.findClosestDataPointByDate(
                series.points,
                dataRepresentation.percentCalcDate,
                series.points[0],
            );

            const endDataPoint: IDataRepresentationPoint = series.points[series.points.length - 1];

            series.variance = createVarianceConverterByType(series.settings.variance.shouldCalculateDifference.value)
                .convert({
                    firstDataPoint: startDataPoint,
                    secondDataPoint: endDataPoint,
                });

            series.formattedDate = getFormattedDate(startDataPoint.x, settings.date.format.value);
            series.formattedVariance = getFormattedValueWithFallback(series.variance, series.settings.variance);

            series.dateDifference = this.getDaysBetween(endDataPoint.x, startDataPoint.x);

            series.formattedTooltip = this.getFormattedTooltip(series);

            series.smoothedPoints = series.settings.sparklineChart.shouldInterpolate.value
                ? this.smoothConverter.convert(series.points)
                : series.points;
        });
    }

    private getFormattedTooltip(series: IDataRepresentationSeries): string {
        const { settings: { tooltip } } = series;

        if (!tooltip.isShown.value) {
            return undefined;
        }

        let tooltipLabel: string = series.tooltip || tooltip.label.value || "";

        if (tooltip.showVariance.value) {
            tooltipLabel += `${series.formattedVariance}`;
        }

        if (tooltip.showDate.value) {
            tooltipLabel += ` change since ${series.formattedDate}`;
        }

        if (tooltip.showDateDifference.value) {
            tooltipLabel += ` (${series.dateDifference} days ago)`;
        }

        return tooltipLabel;
    }

    private applyScale(
        axis: IDataRepresentationAxis,
        axisDescriptor: AxisBaseContainerItem,
    ) {
        if (!isNaN(<number>(axisDescriptor.min.value)) && axisDescriptor.min.value !== null) {
            axis.min = axisDescriptor.min.value;
        }
        else if (!isNaN(<number>(axis.min)) && axis.min !== null) {
            axisDescriptor.min.value = <number>axis.min;
        }

        if (!isNaN(<number>(axisDescriptor.max.value)) && axisDescriptor.max.value !== null) {
            axis.max = axisDescriptor.max.value;
        } else if (!isNaN(<number>(axis.max)) && axis.max !== null) {
            axisDescriptor.max.value = (<number>(axis.max)) + (<number>(axis.max)) * this.increasedDomainValueInPercentage;
            axis.max = axisDescriptor.max.value;
        }

        if (axis.min > axis.max) {
            [axis.min, axis.max] = [axis.max, axis.min];
        }

        axis.scale.domain(
            [axis.min, axis.max],
            DataRepresentationTypeEnum.NumberType,
        );
    }

    private getDaysBetween(startDate: Date, endDate: Date): number {
        const oneDayInMs: number = 24 * 60 * 60 * 1000;

        return Math.round(Math.abs(startDate.getTime() - endDate.getTime()) / oneDayInMs);
    }

    private getMin<Type>(originalValue: Type, value: Type): Type {
        const isOriginalValueValid: boolean = this.isValueValid(originalValue);
        const isValueValid: boolean = this.isValueValid(value);

        if (isOriginalValueValid && isValueValid) {
            return value < originalValue
                ? value
                : originalValue;
        }

        if (isValueValid) {
            return value;
        }

        return undefined;
    }

    private getMax<Type>(originalValue: Type, value: Type): Type {
        const isOriginalValueValid: boolean = this.isValueValid(originalValue);
        const isValueValid: boolean = this.isValueValid(value);

        if (isOriginalValueValid && isValueValid) {
            return value > originalValue
                ? value
                : originalValue;
        }

        if (isValueValid) {
            return value;
        }

        return undefined;
    }

    private isValueValid<Type>(value: Type): boolean {
        return value != null;
    }

    private parseValue(value: PrimitiveValue, treatEmptyValuesAsZero: boolean): number {
        if (isFinite(<number>value) && value != null) {
            return <number>value;
        }

        if (treatEmptyValuesAsZero) {
            return 0;
        }

        return NaN;
    }
}
