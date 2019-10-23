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

import {
    changeStartDateColumn,
    dateColumn,
    tooltipColumn,
    valueColumn,
    warningStateColumn,
} from "../../columns/columns";

import { AxisDescriptor } from "../../settings/descriptors/axisDescriptor";
import { BaseDescriptor } from "../../settings/descriptors/baseDescriptor";
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

import { createVarianceConverterByType } from "../variance";

import {
    getFormattedDate,
    getFormattedValueWithFallback,
} from "../data/dataFormatter";

export interface IColumnGroup {
    name: string;
    values: any[];
    columns: Array<powerbi.DataViewValueColumn | powerbi.DataViewCategoryColumn>;
}

export interface IColumnGroupByRole {
    [columnName: string]: IColumnGroup;
}

export interface IDataConverterConstructorOptions {
    createSelectionIdBuilder: () => powerbi.visuals.ISelectionIdBuilder;
}

export interface IDataConverterOptions {
    dataView: powerbi.DataView;
    settings: Settings;
    viewport: powerbi.IViewport;
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
            const columns: Array<powerbi.DataViewValueColumn | powerbi.DataViewCategoryColumn> = [
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

    public isDataViewValid(dataView: powerbi.DataView): boolean {
        return !!(dataView
            && dataView.categorical
            && dataView.categorical.categories
            && dataView.categorical.categories[0]
            && dataView.categorical.categories[0].values
            && dataView.categorical.categories[0].values.length
            && dataView.categorical.values
            && dataView.categorical.values.length
        );
    }

    protected getColumnGroupByRole(
        columns: Array<powerbi.DataViewValueColumn | powerbi.DataViewCategoryColumn>,
        index: number,
    ): IColumnGroupByRole {
        const columnGroups: IColumnGroupByRole = {};

        columns.forEach((column: powerbi.DataViewValueColumn | powerbi.DataViewCategoryColumn, valueIndex: number) => {
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
        return columns.map((column) => column); // TODO: Why is it using map to create a copy of array?
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
        valuesColumn: powerbi.DataViewValueColumns,
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

        settings.date.setColumnFormat(dateColumnGroup.columns[0].source.format);

        const tooltipColumnGroup: IColumnGroup = columnGroupByRole[tooltipColumn.name];

        const {
            createSelectionIdBuilder,
        } = this.constructorOptions;

        valueColumnGroup.columns.forEach((column: powerbi.DataViewValueColumn, columnIndex: number) => {
            const x: Date = dateColumnGroup.values[0] as Date;

            if (x instanceof Date && x !== undefined && x !== null) {
                if (!dataRepresentation.series[columnIndex]) {
                    const selectionId: powerbi.visuals.ISelectionId = createSelectionIdBuilder()
                        .withSeries(valuesColumn, column)
                        .withMeasure(column.source.queryName)
                        .createSelectionId();

                    const seriesSettings: SeriesSettings = SeriesSettings.getDefault() as SeriesSettings;

                    for (const propertyName in seriesSettings) {
                        const descriptor: BaseDescriptor = seriesSettings[propertyName];
                        const defaultDescriptor: BaseDescriptor = settings[propertyName];

                        if (descriptor && descriptor.applyDefault && defaultDescriptor) {
                            descriptor.applyDefault(defaultDescriptor);
                        }
                    }

                    seriesSettings.parseObjects(column.source.objects);

                    seriesSettings.values.setColumnFormat(column.source.format);
                    seriesSettings.yAxis.setColumnFormat(column.source.format);
                    seriesSettings.sparklineValue.setColumnFormat(column.source.format);
                    seriesSettings.sparklineYAxis.setColumnFormat(column.source.format);

                    const series: IDataRepresentationSeries = {
                        current: undefined,
                        dateDifference: undefined,
                        formattedDate: "",
                        formattedTooltip: undefined,
                        formattedVariance: "",
                        index: dataRepresentation.series.length,
                        name: column.source.displayName,
                        points: [],
                        selectionId,
                        settings: seriesSettings,
                        smoothedPoints: [],
                        x: {
                            initialMax: undefined,
                            initialMin: undefined,
                            max: undefined,
                            min: undefined,
                            scale: DataRepresentationScale.create(),
                        },
                        y: {
                            initialMax: undefined,
                            initialMin: undefined,
                            max: undefined,
                            min: undefined,
                            scale: DataRepresentationScale.create(),
                        },
                        ySparkline: {
                            initialMax: undefined,
                            initialMin: undefined,
                            max: undefined,
                            min: undefined,
                            scale: DataRepresentationScale.create(),
                        },

                        tooltip: undefined,
                        variance: undefined,
                    };

                    dataRepresentation.series.push(series);
                    dataRepresentation.sortedSeries.push(series);
                }

                const y: number = this.parseValue(
                    valueColumnGroup.values[columnIndex],
                    dataRepresentation.series[columnIndex].settings.values.treatEmptyValuesAsZero,
                );

                const dataPoint: IDataRepresentationPoint = {
                    index: dataRepresentation.series[columnIndex].points.length,
                    x,
                    y,
                };

                dataRepresentation.latestDate = x;

                dataRepresentation.series[columnIndex].points.push(dataPoint);

                if (dataRepresentation.series[columnIndex].settings.values.showLatterAvailableValue) {
                    if (!isNaN(dataPoint.y)) {
                        dataRepresentation.series[columnIndex].current = dataPoint;
                    }
                } else {
                    dataRepresentation.series[columnIndex].current = dataPoint;
                }

                dataRepresentation.series[columnIndex].x.min = this.getMin(
                    dataRepresentation.series[columnIndex].x.min,
                    x,
                );

                dataRepresentation.series[columnIndex].x.max = this.getMax(
                    dataRepresentation.series[columnIndex].x.max,
                    x,
                );

                if (!isNaN(y)) {
                    dataRepresentation.series[columnIndex].y.min = this.getMin(
                        dataRepresentation.series[columnIndex].y.min,
                        y,
                    );

                    dataRepresentation.series[columnIndex].y.max = this.getMax(
                        dataRepresentation.series[columnIndex].y.max,
                        y,
                    );

                    dataRepresentation.series[columnIndex].ySparkline.min = this.getMin(
                        dataRepresentation.series[columnIndex].ySparkline.min,
                        y,
                    );

                    dataRepresentation.series[columnIndex].ySparkline.max = this.getMax(
                        dataRepresentation.series[columnIndex].ySparkline.max,
                        y,
                    );
                }

                const tooltip: string = tooltipColumnGroup
                    && tooltipColumnGroup.values
                    && tooltipColumnGroup.values[columnIndex]
                    || undefined;

                dataRepresentation.series[columnIndex].tooltip = tooltip;
            }
        });

        const warningColumnGroup: IColumnGroup = columnGroupByRole[warningStateColumn.name];

        if (warningColumnGroup) {
            dataRepresentation.warningState = warningColumnGroup.values[0];
        }

        const changeStartDateColumnGroup: IColumnGroup = columnGroupByRole[changeStartDateColumn.name];

        if (changeStartDateColumnGroup) {
            const date: Date = changeStartDateColumnGroup
                && changeStartDateColumnGroup.values
                && changeStartDateColumnGroup.values[0];

            dataRepresentation.percentCalcDate = date instanceof Date
                ? date
                : dataRepresentation.percentCalcDate;
        }
    }

    private postProcessData(dataRepresentation: IDataRepresentation, settings: Settings): void {
        dataRepresentation.staleDateDifference = 0;

        dataRepresentation.series.forEach((series: IDataRepresentationSeries) => {
            if (series.current && series.current.x) {
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

            if (series.settings.sparklineYAxis.shouldInheritValues) {
                series.settings.sparklineYAxis.defaultMin = series.settings.yAxis.getMin();
                series.settings.sparklineYAxis.defaultMax = series.settings.yAxis.getMax();
            }

            this.applyScale(series.ySparkline, series.settings.sparklineYAxis);

            const startDataPoint: IDataRepresentationPoint = this.findClosestDataPointByDate(
                series.points,
                dataRepresentation.percentCalcDate,
                series.points[0],
            );

            const endDataPoint: IDataRepresentationPoint = series.points[series.points.length - 1];

            series.variance = createVarianceConverterByType(series.settings.variance.shouldCalculateDifference)
                .convert({
                    firstDataPoint: startDataPoint,
                    secondDataPoint: endDataPoint,
                });

            series.formattedDate = getFormattedDate(startDataPoint.x, settings.date.getFormat());
            series.formattedVariance = getFormattedValueWithFallback(series.variance, series.settings.variance);

            series.dateDifference = this.getDaysBetween(endDataPoint.x, startDataPoint.x);

            series.formattedTooltip = this.getFormattedTooltip(series);

            series.smoothedPoints = series.settings.sparklineChart.shouldInterpolate
                ? this.smoothConverter.convert(series.points)
                : series.points;
        });
    }

    private getFormattedTooltip(series: IDataRepresentationSeries): string {
        const { settings: { tooltip } } = series;

        if (!tooltip.isShown) {
            return undefined;
        }

        let tooltipLabel: string = series.tooltip || tooltip.label || "";

        if (tooltip.showVariance) {
            tooltipLabel += `${series.formattedVariance}`;
        }

        if (tooltip.showDate) {
            tooltipLabel += ` change since ${series.formattedDate}`;
        }

        if (tooltip.showDateDifference) {
            tooltipLabel += ` (${series.dateDifference} days ago)`;
        }

        return tooltipLabel;
    }

    private applyScale(
        axis: IDataRepresentationAxis,
        axisDescriptor: AxisDescriptor,
    ) {
        if ((!isNaN(axisDescriptor.min as number) && axisDescriptor.min !== null)
            || (!isNaN(axisDescriptor.defaultMin as number) && axisDescriptor.defaultMin !== null)) {
            axis.min = axisDescriptor.getMin();
        }
        else if (!isNaN(axis.min as number) && axis.min !== null) {
            axisDescriptor.defaultMin = axis.min;
        }

        if ((!isNaN(axisDescriptor.max as number) && axisDescriptor.max !== null)
            || (!isNaN(axisDescriptor.defaultMax as number) && axisDescriptor.defaultMax !== null)) {
            axis.max = axisDescriptor.getMax();
        } else if (!isNaN(axis.max as number) && axis.max !== null) {
            axisDescriptor.defaultMax = (axis.max as number) + (axis.max as number) * this.increasedDomainValueInPercentage;
            axis.max = axisDescriptor.defaultMax;
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

    private parseValue(value: number, treatEmptyValuesAsZero: boolean): number {
        if (isFinite(value) && value != null) {
            return value;
        }

        if (treatEmptyValuesAsZero) {
            return 0;
        }

        return NaN;
    }
}
