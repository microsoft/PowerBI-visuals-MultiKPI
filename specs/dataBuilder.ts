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

import powerbi from "powerbi-visuals-api";

import { getRandomNumbers, testDataViewBuilder } from "powerbi-visuals-utils-testutils";
import { valueType } from "powerbi-visuals-utils-typeutils";

import {
    dateColumn,
    valueColumn,
} from "../src/columns/columns";

import { getDateRange } from "./helpers";

export class MultiKpiData extends testDataViewBuilder.TestDataViewBuilder {
    public amountOfSeries: number = 5;

    public dates: Date[] = [];
    public seriesValues: number[][] = [];

    constructor(withMisisngValues?: boolean) {
        super();

        this.dates = getDateRange(
            new Date(2016, 0, 1),
            new Date(2016, 0, 12),
            1000 * 24 * 3600,
        );

        if (withMisisngValues) {
            for (let i: number = 0; i < this.amountOfSeries; i++) {
                if (i === 4) {
                    const noDataArray: number[] = [];
                    this.dates.forEach((d) => {
                        noDataArray.push(undefined);
                    });
                    this.seriesValues.push(noDataArray);
                } else if (i === 2) {
                    const valArr: number[] = getRandomNumbers(this.dates.length - 3, -Number.MAX_VALUE, Number.MAX_VALUE);
                    valArr.push(undefined);
                    valArr.push(undefined);
                    this.seriesValues.push(valArr);
                } else {
                    this.seriesValues.push(getRandomNumbers(
                        this.dates.length,
                        -Number.MAX_VALUE,
                        Number.MAX_VALUE,
                    ));
                }
            }
        } else {
            for (let i: number = 0; i < this.amountOfSeries; i++) {
                this.seriesValues.push(getRandomNumbers(
                    this.dates.length,
                    -Number.MAX_VALUE,
                    Number.MAX_VALUE,
                ));
            }
        }
    }

    public getDataView(columnNames?: string[]): powerbi.DataView {
        const datesCategory = {
            source: {
                displayName: dateColumn.name,
                format: "%M/%d/yyyy",
                roles: { Axis: true },
                type: valueType.ValueType.fromDescriptor({ dateTime: true }),
            },
            values: this.dates,
        };

        const valuesCategory = this.seriesValues
            .map((values: number[]) => {
                return {
                    source: {
                        displayName: valueColumn.name,
                        roles: { Values: true },
                        type: valueType.ValueType.fromDescriptor({ integer: true }),
                    },
                    values,
                };
            });

        return this.createCategoricalDataViewBuilder(
            [datesCategory],
            valuesCategory,
            columnNames,
        ).build();
    }
}
