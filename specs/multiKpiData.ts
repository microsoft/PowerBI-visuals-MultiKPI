/*
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

import powerbiVisualsApi from "powerbi-visuals-api";

import { getRandomNumbers, testDataViewBuilder } from "powerbi-visuals-utils-testutils";
import { valueType } from "powerbi-visuals-utils-typeutils";

import {
    dateColumn,
    valueColumn,
    subtitleColumn,
} from "../src/columns/columns";

export class MultiKpiData extends testDataViewBuilder.TestDataViewBuilder {
    public amountOfSeries: number = 5;

    public dates: Date[] = [];
    public seriesValues: number[][] = [];

    constructor(
        withMisisngValues: boolean = false,
        brokenMetricIndex: number = 0,
        howOlderDatesAreInDays: number = 0) {
        super();

        const today = new Date();
        const hours: number = today.getHours();
        const tomorrowShifter: number = hours > 11 ? 1 : 0;
        const tommorowOrShifted = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + (tomorrowShifter - howOlderDatesAreInDays),
        );
        const twoWeeksBefore = new Date(
            tommorowOrShifted.getFullYear(),
            tommorowOrShifted.getMonth(),
            tommorowOrShifted.getDate() - 13,
        );

        // Fill two weeks
        for (let i = 0; i < 14; i++) {
            this.dates.push(new Date(twoWeeksBefore.getFullYear(), twoWeeksBefore.getMonth(), twoWeeksBefore.getDate() + i));
        }

        if (withMisisngValues) {
            for (let i: number = 0; i < this.amountOfSeries; i++) {
                if (i === 4) {
                    const noDataArray: number[] = [];
                    this.dates.forEach((d) => {
                        noDataArray.push(undefined);
                    });
                    this.seriesValues.push(noDataArray);
                } else if (i === brokenMetricIndex) {
                    const valArr: number[] = getRandomNumbers(this.dates.length - 4, -150, 150);
                    valArr.push(25);
                    valArr.push(undefined);
                    valArr.push(undefined);
                    valArr.push(undefined);
                    this.seriesValues.push(valArr);
                } else {
                    this.seriesValues.push(getRandomNumbers(
                        this.dates.length,
                        -150,
                        150,
                    ));
                }
            }
        } else {
            for (let i: number = 0; i < this.amountOfSeries; i++) {
                this.seriesValues.push(getRandomNumbers(
                    this.dates.length,
                    -150,
                    150,
                ));
            }
        }
    }

    public getDataView(columnNames?: string[]): powerbiVisualsApi.DataView {
        const datesCategory = this.buildDatesCategory(this.dates);
        const valuesCategory = this.buildValuesCategory(this.seriesValues);

        return this.createCategoricalDataViewBuilder(
            [datesCategory],
            valuesCategory,
            columnNames,
        ).build();
    }

    public getDataViewWithSubtitle(columnNames?: string[]): powerbiVisualsApi.DataView {
        const datesCategory = this.buildDatesCategory(this.dates);
        const valuesCategory = this.buildValuesCategory(this.seriesValues);
        const repeatsNum: number = this.dates.length;
        let subtitleArr: string[] = [];
        for (let i = 0; i < repeatsNum; i++) {
            subtitleArr.push("Subtitle form data");
        }

        valuesCategory.push({
            source: {
                displayName: subtitleColumn.name,
                roles: { subtitleColumn: true },
                type: valueType.ValueType.fromDescriptor({ text: true }),
            },
            values: subtitleArr,
        });

        return this.createCategoricalDataViewBuilder(
            [datesCategory],
            valuesCategory,
            columnNames,
        ).build();
    }


    private buildDatesCategory(dates: Date[]): any {
        return {
            source: {
                displayName: dateColumn.name,
                format: "%M/%d/yyyy",
                roles: { dateColumn: true },
                type: valueType.ValueType.fromDescriptor({ dateTime: true }),
            },
            values: dates,
        }
    }

    private buildValuesCategory(seriesValues: number[][]): any {
        return seriesValues
            .map((values: number[]) => {
                return {
                    source: {
                        displayName: valueColumn.name,
                        roles: { valueColumn: true },
                        type: valueType.ValueType.fromDescriptor({ integer: true }),
                    },
                    values,
                };
            });
    }
}
