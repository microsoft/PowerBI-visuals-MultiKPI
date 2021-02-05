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

import { MultiKpiData } from "./multiKpiData";
import { MultiKpiBuilder } from "./multiKpiBuilder";

export class TestWrapper {
    public static CREATE(
        withMisisngValues: boolean = false,
        brokenMetricIndex: number = 0,
        howOlderDatesAreInDays: number = 0,
        attachSubtitleData: boolean = false): TestWrapper {
        return new TestWrapper(
            withMisisngValues,
            brokenMetricIndex,
            howOlderDatesAreInDays,
            attachSubtitleData);
    }

    public dataView: powerbiVisualsApi.DataView;
    public dataViewBuilder: MultiKpiData;
    public visualBuilder: MultiKpiBuilder;

    constructor(
        withMisisngValues: boolean = false,
        brokenMetricIndex: number = 0,
        howOlderDatesAreInDays: number = 0,
        attachSubtitleData: boolean = false,
        width: number = 1024,
        height: number = 768) {

        this.visualBuilder = new MultiKpiBuilder(width, height);
        this.dataViewBuilder = new MultiKpiData(
            withMisisngValues,
            brokenMetricIndex,
            howOlderDatesAreInDays);

        if (attachSubtitleData) {
            this.dataView = this.dataViewBuilder.getDataViewWithSubtitle();
        } else {
            this.dataView = this.dataViewBuilder.getDataView();
        }
    }
}
