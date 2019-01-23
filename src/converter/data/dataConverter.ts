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

export interface ColumnGroup {
    name: string;
    values: any[];
    columns: (DataViewValueColumn | DataViewCategoryColumn)[];
}

export interface ColumnGroupByRole {
    [columnName: string]: ColumnGroup;
}

export interface DataConverterOptions {
    dataView: DataView;
    settings: Settings;
    viewport: IViewport;
}

export class DataConverter implements Converter<DataConverterOptions, DataRepresentation> {
    private increasedDomainValueInPercentage: number = 0.01;

    private smoothConverter: Converter<DataRepresentationPoint[], DataRepresentationPoint[]> = new SmoothDataConverter();

    public convert(options: DataConverterOptions): DataRepresentation {
        const {
            dataView,
            settings,
            viewport,
        } = options;

        const dataRepresentation: DataRepresentation = this.getDefaultData(settings.kpi.percentCalcDate);

        if (this.isDataViewValid(dataView)) {
            const columns: (DataViewValueColumn | DataViewCategoryColumn)[] = [
                ...this.getColumns(dataView.categorical.categories),
                ...this.getColumns(dataView.categorical.values),
            ];

            dataView.categorical.categories[0].values.forEach((_, index: number) => {
                const columnGroupByRole: ColumnGroupByRole = this.getColumnGroupByRole(columns, index);

                this.processData(
                    dataRepresentation,
                    columnGroupByRole,
                    settings,
                    dataView.categorical.values
                );
            });

            this.postProcessData(dataRepresentation, settings);
        }

        dataRepresentation.viewportSize = this.getViewportSize(viewport);

        return dataRepresentation;
    }

    private getColumns<Type>(columns: Type[]): Type[] {
        return columns.map(column => column);
    }

    private getViewportSize(viewport: IViewport): ViewportSize {
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

    public isDataViewValid(dataView: DataView): boolean {
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

    private getDefaultData(defaultPercentCalcDate?: Date): DataRepresentation {
        return {
            series: [],
            sortedSeries: [],
            warningState: NaN,
            viewport: { width: 0, height: 0 },
            viewportSize: ViewportSize.tiny,
            latestDate: new Date(),
            dateDifference: 0,
            percentCalcDate: defaultPercentCalcDate,
        };
    }

    private processData(
        dataRepresentation: DataRepresentation,
        columnGroupByRole: ColumnGroupByRole,
        settings: Settings,
        valuesColumn: DataViewValueColumns
    ): void {
        const dateColumnGroup: ColumnGroup = columnGroupByRole[dateColumn.name];
        const valueColumnGroup: ColumnGroup = columnGroupByRole[valueColumn.name];

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

        const tooltipColumnGroup: ColumnGroup = columnGroupByRole[tooltipColumn.name];

        valueColumnGroup.columns.forEach((column: DataViewValueColumn, columnIndex: number) => {
            const x: Date = dateColumnGroup.values[0] as Date;

            if (x instanceof Date && x !== undefined && x !== null) {
                if (!dataRepresentation.series[columnIndex]) {
                    const selectionId: ISelectionId = SelectionIdBuilder.builder()
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

                    const series: DataRepresentationSeries = {
                        selectionId,
                        index: dataRepresentation.series.length,
                        settings: seriesSettings,
                        name: column.source.displayName,
                        points: [],
                        smoothedPoints: [],
                        current: undefined,
                        x: {
                            min: undefined,
                            max: undefined,
                            initialMin: undefined,
                            initialMax: undefined,
                            scale: DataRepresentationScale.create(),
                        },
                        y: {
                            min: undefined,
                            max: undefined,
                            initialMin: undefined,
                            initialMax: undefined,
                            scale: DataRepresentationScale.create(),
                        },
                        ySparkline: {
                            min: undefined,
                            max: undefined,
                            initialMin: undefined,
                            initialMax: undefined,
                            scale: DataRepresentationScale.create(),
                        },
                        variance: undefined,
                        formattedVariance: "",
                        formattedDate: "",
                        dateDifference: undefined,
                        formattedTooltip: undefined,
                        tooltip: undefined,
                    };

                    dataRepresentation.series.push(series);
                    dataRepresentation.sortedSeries.push(series);
                }

                const y: number = valueColumnGroup.values[columnIndex] || 0;

                const dataPoint: DataRepresentationPoint = {
                    x,
                    y,
                    index: dataRepresentation.series[columnIndex].points.length,
                };

                dataRepresentation.latestDate = x;

                dataRepresentation.series[columnIndex].points.push(dataPoint);
                dataRepresentation.series[columnIndex].current = dataPoint;

                dataRepresentation.series[columnIndex].x.min = this.getMin(
                    dataRepresentation.series[columnIndex].x.min,
                    x
                );

                dataRepresentation.series[columnIndex].x.max = this.getMax(
                    dataRepresentation.series[columnIndex].x.max,
                    x
                );

                dataRepresentation.series[columnIndex].y.min = this.getMin(
                    dataRepresentation.series[columnIndex].y.min,
                    y
                );

                dataRepresentation.series[columnIndex].y.max = this.getMax(
                    dataRepresentation.series[columnIndex].y.max,
                    y
                );

                dataRepresentation.series[columnIndex].ySparkline.min = this.getMin(
                    dataRepresentation.series[columnIndex].ySparkline.min,
                    y
                );

                dataRepresentation.series[columnIndex].ySparkline.max = this.getMax(
                    dataRepresentation.series[columnIndex].ySparkline.max,
                    y
                );

                const tooltip: string = tooltipColumnGroup
                    && tooltipColumnGroup.values
                    && tooltipColumnGroup.values[columnIndex]
                    || undefined;

                dataRepresentation.series[columnIndex].tooltip = tooltip;
            }
        });

        const warningColumnGroup: ColumnGroup = columnGroupByRole[warningStateColumn.name];

        if (warningColumnGroup) {
            dataRepresentation.warningState = warningColumnGroup.values[0];
        }

        const changeStartDateColumnGroup: ColumnGroup = columnGroupByRole[changeStartDateColumn.name];

        if (changeStartDateColumnGroup) {
            const date: Date = changeStartDateColumnGroup
                && changeStartDateColumnGroup.values
                && changeStartDateColumnGroup.values[0];

            dataRepresentation.percentCalcDate = date instanceof Date
                ? date
                : dataRepresentation.percentCalcDate;
        }
    }

    private postProcessData(dataRepresentation: DataRepresentation, settings: Settings): void {
        dataRepresentation.series.forEach((series: DataRepresentationSeries, seriesIndex: number) => {
            series.x.initialMin = series.x.min;
            series.x.initialMax = series.x.max;

            series.y.initialMin = series.y.min;
            series.y.initialMax = series.y.max;

            series.ySparkline.initialMin = series.y.min;
            series.ySparkline.initialMax = series.y.max;

            series.x.scale.domain(
                [series.x.min, series.x.max],
                DataRepresentationTypeEnum.DateType
            );

            this.applyScale(series.y, series.settings.yAxis);

            if (series.settings.sparklineYAxis.shouldInheritValues) {
                series.settings.sparklineYAxis.defaultMin = series.settings.yAxis.getMin();
                series.settings.sparklineYAxis.defaultMax = series.settings.yAxis.getMax();
            }

            this.applyScale(series.ySparkline, series.settings.sparklineYAxis);

            const startDataPoint: DataRepresentationPoint = this.findClosestDataPointByDate(
                series.points,
                dataRepresentation.percentCalcDate,
                series.points[0]
            );

            const endDataPoint: DataRepresentationPoint = series.points[series.points.length - 1];

            series.variance = createVarianceConverter()
                .convert({
                    firstDataPoint: startDataPoint,
                    secondDataPoint: endDataPoint,
                });

            series.formattedDate = DataFormatter.getFormattedDate(startDataPoint.x, settings.date.getFormat());
            series.formattedVariance = DataFormatter.getFormattedVariance(series.variance);

            series.dateDifference = this.getDaysBetween(endDataPoint.x, startDataPoint.x);

            series.formattedTooltip = this.getFormattedTooltip(series);

            series.smoothedPoints = series.settings.sparklineChart.shouldInterpolate
                ? this.smoothConverter.convert(series.points)
                : series.points;
        });

        dataRepresentation.dateDifference = this.getDaysBetween(dataRepresentation.latestDate, new Date());
    }

    public findClosestDataPointByDate(
        dataPoints: DataRepresentationPoint[],
        date: Date,
        defaultDataPoint: DataRepresentationPoint
    ): DataRepresentationPoint {
        if (!dataPoints || !date || !(date instanceof Date)) {
            return defaultDataPoint;
        }

        const dateTime: number = date.getTime();

        let closestDataPoint: DataRepresentationPoint;

        for (let dataPoint of dataPoints) {
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

    private getFormattedTooltip(series: DataRepresentationSeries): string {
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
        axis: DataRepresentationAxis,
        axisDescriptor: AxisDescriptor
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
            DataRepresentationTypeEnum.NumberType
        );
    }

    private getDaysBetween(startDate: Date, endDate: Date): number {
        const oneDayInMs: number = 24 * 60 * 60 * 1000;

        return Math.round(Math.abs(startDate.getTime() - endDate.getTime()) / oneDayInMs);
    }

    private getMin<Type>(originalValue: Type, value: Type): Type {
        if (originalValue === undefined || originalValue === null) {
            return value;
        }

        return value < originalValue
            ? value
            : originalValue;
    }

    private getMax<Type>(originalValue: Type, value: Type): Type {
        if (originalValue === undefined || originalValue === null) {
            return value;
        }

        return value > originalValue
            ? value
            : originalValue;
    }

    protected getColumnGroupByRole(columns: (DataViewCategoryColumn | DataViewValueColumn)[], index: number): ColumnGroupByRole {
        const columnGroups: ColumnGroupByRole = {};

        columns.forEach((column: DataViewCategoryColumn | DataViewValueColumn, valueIndex: number) => {
            Object.keys(column.source.roles)
                .forEach((roleName: string) => {
                    if (!columnGroups[roleName]) {
                        columnGroups[roleName] = {
                            name: roleName,
                            values: [],
                            columns: []
                        };
                    }

                    columnGroups[roleName].values.push(column.values[index]);
                    columnGroups[roleName].columns.push(column);
                });
        });

        return columnGroups;
    }
}

export class DataFormatter {
    public static getFormattedVariance(variance: number): string {
        if (!VarianceChecker.isVarianceValid(variance)) {
            return "N/A";
        }

        return valueFormatter
            .create({
                format: "+0.00%;-0.00%;0.00%",
                precision: 2,
                value: variance,
            })
            .format(variance);
    }

    public static getFormattedDate(date: Date, format: string = valueFormatter.DefaultDateFormat): string {
        return valueFormatter
            .create({ format })
            .format(date);
    }

    public static getFormattedValue(value: number, settings: NumericDescriptor): string {
        return this.getValueFormatter(value, settings).format(value);
    }

    public static getValueFormatter(value: number, settings: NumericDescriptor): IValueFormatter {
        return valueFormatter.create({
            format: settings.getFormat(),
            value: settings.displayUnits || value,
            precision: settings.precision,
            displayUnitSystemType: 2,
        });
    }
}
