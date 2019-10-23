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

import "jasmine-jquery";

import * as $ from "jquery";

import powerbi from "powerbi-visuals-api";

import { dispatch } from "d3-dispatch";
import { select as d3Select, Selection } from "d3-selection";

import {
    createSelectionIdBuilder,
    testDom,
} from "powerbi-visuals-utils-testutils";

import { EventName } from "../src/event/eventName";

import {
    ILineComponentRenderOptions,
    LineComponent,
} from "../src/visualComponent/sparkline/lineComponent";

import {
    DataRepresentationScale,
    DataRepresentationTypeEnum,
} from "../src/converter/data/dataRepresentationScale";

import {
    DataRepresentationPointGradientType,
    IDataRepresentationPoint,
} from "../src/converter/data/dataRepresentation";

import { isValueValid } from "../src/utils/valueUtils";

import { DataConverter } from "../src/converter/data/dataConverter";
import { getFormattedValueWithFallback } from "../src/converter/data/dataFormatter";

import { KpiBaseDescriptor } from "../src/settings/descriptors/kpi/kpiBaseDescriptor";
import { NumericDescriptor } from "../src/settings/descriptors/numericDescriptor";

import { TestWrapper } from "./testWrapper";

import { getDateRange } from "./helpers";

describe("Multi KPI", () => {
    describe("Version 2.2.0 Changes", () => {
        it("Treat Empty/Missing Values As Zero is enabled", (done) => {
            const testWrapper: TestWrapper = TestWrapper.create(true, 2);

            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                values: {
                    treatEmptyValuesAsZero: true,
                },
            };

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                const secondSparklineValue = testWrapper.visualBuilder.$sparklineSubtitle.find("div")[3].innerText;
                expect(secondSparklineValue).toEqual("0");
                done();
            });
        });

        it("Treat Empty/Missing Values As Zero is disabled", (done) => {
            const testWrapper: TestWrapper = TestWrapper.create(true, 2);

            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                values: {
                    treatEmptyValuesAsZero: false,
                },
            };

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                const secondSparklineValue = testWrapper.visualBuilder.$sparklineSubtitle.find("div")[3].innerText;
                expect(secondSparklineValue).toEqual("N/A");
                done();
            });
        });

        it("Treat Empty/Missing Values As Zero is disabled but Show Latest Available As Current Value is enabled", (done) => {
            const testWrapper: TestWrapper = TestWrapper.create(true, 2);

            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                values: {
                    showLatterAvailableValue: true,
                    treatEmptyValuesAsZero: false,
                },
            };

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                const secondSparklineValue = testWrapper.visualBuilder.$sparklineSubtitle.find("div")[3].innerText;
                expect(secondSparklineValue).toEqual("25");
                done();
            });
        });

        it("Treat Empty/Missing Values As Zero is enabled and Show Latest Available As Current Value is enabled", (done) => {
            const testWrapper: TestWrapper = TestWrapper.create(true, 2);

            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                values: {
                    showLatterAvailableValue: true,
                    treatEmptyValuesAsZero: true,
                },
            };

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                const secondSparklineValue = testWrapper.visualBuilder.$sparklineSubtitle.find("div")[3].innerText;
                expect(secondSparklineValue).toEqual("0");
                done();
            });
        });

        it("Missing Value label is customized", (done) => {
            const testWrapper: TestWrapper = TestWrapper.create(true, 2);

            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                values: {
                    noValueLabel: "no data",
                    treatEmptyValuesAsZero: false,
                },
            };

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                const secondSparklineValue = testWrapper.visualBuilder.$sparklineSubtitle.find("div")[3].innerText;
                const fourthSparklineValue = testWrapper.visualBuilder.$sparklineSubtitle.find("div")[7].innerText;
                expect(secondSparklineValue).toEqual("no data");
                expect(fourthSparklineValue).toEqual("no data");
                done();
            });
        });

        it("Missing Value label is customized generally and for certain series", (done) => {
            const testWrapper: TestWrapper = TestWrapper.create(true, 2);

            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                values: {
                    noValueLabel: "no data",
                    treatEmptyValuesAsZero: false,
                },
            };

            testWrapper.dataView.metadata.columns[3].objects = {
                values: {
                    noValueLabel: "[-]",
                },
            };

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                const secondSparklineValue = testWrapper.visualBuilder.$sparklineSubtitle.find("div")[3].innerText;
                const fourthSparklineValue = testWrapper.visualBuilder.$sparklineSubtitle.find("div")[7].innerText;
                expect(secondSparklineValue).toEqual("[-]");
                expect(fourthSparklineValue).toEqual("no data");
                done();
            });
        });

        it("Missing Variance label is customized", (done) => {
            const testWrapper: TestWrapper = TestWrapper.create(true, 0);

            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                values: {
                    treatEmptyValuesAsZero: false,
                },
                variance: {
                    noValueLabel: "no data",
                },
            };

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                const naVariance = testWrapper.visualBuilder.$mainChartNAVarance.text();
                expect(naVariance).toEqual("(no data)");
                done();
            });
        });

        it("Missing Variance label is customized generally and for certain series", (done) => {
            const testWrapper: TestWrapper = TestWrapper.create(true, 0);

            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                values: {
                    treatEmptyValuesAsZero: false,
                },
                variance: {
                    noValueLabel: "no data",
                },
            };

            testWrapper.dataView.metadata.columns[1].objects = {
                variance: {
                    noValueLabel: "-",
                },
            };

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                const naVariance = testWrapper.visualBuilder.$mainChartNAVarance.text();
                expect(naVariance).toEqual("(-)");
                done();
            });
        });

        it("Stale Data is enabled but Dates are actual", (done) => {
            const testWrapper: TestWrapper = TestWrapper.create(true, 0);

            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                staleData: {
                    show: true,
                    staleDataText: "label {$1}",
                },
                subtitle: {
                    show: true,
                },
                values: {
                    showLatterAvailableValue: false,
                    treatEmptyValuesAsZero: true,
                },
            };

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                const sdIcon = testWrapper.visualBuilder.$staleIcon;
                expect(sdIcon.length).toBe(0);
                done();
            });
        });

        it("Stale Data is enabled and be shown", (done) => {
            const testWrapper: TestWrapper = TestWrapper.create(true, 0, 1);

            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                staleData: {
                    show: true,
                    staleDataText: "label {$1}",
                },
                subtitle: {
                    show: true,
                },
            };

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                const sdIcon = testWrapper.visualBuilder.$staleIcon;
                expect(sdIcon).toBeInDOM();
                expect(sdIcon.length).toBe(1);
                done();
            });
        });

        it("Stale Data is enabled but Threshold Days are actual", (done) => {
            const testWrapper: TestWrapper = TestWrapper.create(true, 0, 1);

            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                staleData: {
                    show: true,
                    staleDataText: "label {$1}",
                    staleDataThreshold: 1,
                },
                subtitle: {
                    show: true,
                },
            };

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                const sdIcon = testWrapper.visualBuilder.$staleIcon;
                expect(sdIcon.length).toBe(0);
                done();
            });
        });

        it("Stale Data is enabled but One of the metrics have more obsolete data than others", (done) => {
            const testWrapper: TestWrapper = TestWrapper.create(true, 0, 1);

            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                staleData: {
                    show: true,
                    staleDataText: "label {$1}",
                    staleDataThreshold: 1,
                },
                subtitle: {
                    show: true,
                },
                values: {
                    showLatterAvailableValue: true,
                    treatEmptyValuesAsZero: false,
                },
            };

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                const sdIcon = testWrapper.visualBuilder.$staleIcon;
                expect(sdIcon).toBeInDOM();
                expect(sdIcon.length).toBe(1);
                done();
            });
        });

        it("Stale Data is enabled and has sufficient threshold days to handle any metrics, even if one of them more obsolete", (done) => {
            const testWrapper: TestWrapper = TestWrapper.create(true, 0, 1);

            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                staleData: {
                    show: true,
                    staleDataText: "label {$1}",
                    staleDataThreshold: 4,
                },
                subtitle: {
                    show: true,
                },
                values: {
                    showLatterAvailableValue: true,
                    treatEmptyValuesAsZero: false,
                },
            };

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                const sdIcon = testWrapper.visualBuilder.$staleIcon;
                expect(sdIcon.length).toBe(0);
                done();
            });
        });

    });

    describe("DOM", () => {
        it("root element should be defined in DOM", (done) => {
            const testWrapper: TestWrapper = TestWrapper.create();

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                expect(testWrapper.visualBuilder.$root).toBeInDOM();

                done();
            });
        });

        describe("Main Chart", () => {
            it("the main chart should be rendered", (done) => {
                const testWrapper: TestWrapper = TestWrapper.create();

                testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                    expect(testWrapper.visualBuilder.$mainChart).toBeInDOM();

                    done();
                });
            });
        });

        describe("LineComponent", () => {
            let lineComponent: LineComponent;

            beforeEach(() => {
                lineComponent = new LineComponent({
                    element: createElement(),
                    eventDispatcher: dispatch(...Object.keys(EventName)),
                });
            });

            it("component must be rendered in DOM", () => {
                const minDate: Date = new Date(2018, 1, 1);
                const maxDate: Date = new Date(2018, 5, 1);

                const minValue: number = 0;
                const maxValue: number = 1000;

                const lineRenderOptions: ILineComponentRenderOptions = {
                    alternativeColor: "blue",
                    color: "green",
                    current: undefined,
                    points: [
                        {
                            index: 0,
                            x: new Date(2018, 1, 1),
                            y: 0,
                        },
                        {
                            index: 1,
                            x: new Date(2018, 2, 1),
                            y: 500,
                        },
                        {
                            index: 2,
                            x: new Date(2018, 3, 1),
                            y: 700,
                        },
                        {
                            index: 3,
                            x: new Date(2018, 4, 1),
                            y: 200,
                        },
                        {
                            index: 4,
                            x: new Date(2018, 5, 1),
                            y: 1000,
                        },
                    ],
                    thickness: 2,
                    type: DataRepresentationPointGradientType.line,
                    viewport: {
                        height: 500,
                        width: 500,
                    },
                    x: {
                        initialMax: maxDate,
                        initialMin: minDate,
                        max: maxDate,
                        min: minDate,
                        scale: DataRepresentationScale
                            .create()
                            .domain(
                                [minDate, maxDate],
                                DataRepresentationTypeEnum.DateType,
                            ),
                    },
                    y: {
                        initialMax: maxValue,
                        initialMin: minValue,
                        max: maxValue,
                        min: minValue,
                        scale: DataRepresentationScale
                            .create()
                            .domain(
                                [minValue, maxValue],
                                DataRepresentationTypeEnum.NumberType,
                            ),
                    },

                };

                lineComponent.render(lineRenderOptions);

                expect($(".multiKpi_line")).toBeInDOM();
            });

            afterEach(() => {
                lineComponent.destroy();
                lineComponent = null;
            });
        });

        describe("Sparkline", () => {
            it("sparkline component should be rendered", (done) => {
                const testWrapper: TestWrapper = TestWrapper.create();

                testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                    testWrapper.visualBuilder.$sparkline.each(function checkEachElement() {
                        const element: JQuery = $(this);

                        expect(element).toBeInDOM();
                    });

                    done();
                });
            });

            describe("Subtitle", () => {
                it("subtitle of each sparkline should be rendered", (done) => {
                    const testWrapper: TestWrapper = TestWrapper.create();

                    testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                        testWrapper.visualBuilder.$sparklineSubtitle.each(function checkEachElement() {
                            const element: JQuery = $(this);

                            expect(element).toBeInDOM();
                        });

                        done();
                    });
                });
            });

            describe("Line", () => {
                it("line of each sparkline should be rendered", (done) => {
                    const testWrapper: TestWrapper = TestWrapper.create();

                    testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                        testWrapper.visualBuilder.$sparklineLine.each(function checkEachElement() {
                            const element: JQuery = $(this);

                            expect(element).toBeInDOM();
                        });

                        done();
                    });
                });
            });
        });

        describe("Subtitle", () => {
            it("subtitle should be rendered if it's turned on via Format Panel explicitly", (done) => {
                const testWrapper: TestWrapper = TestWrapper.create();

                testWrapper.dataView.metadata.objects = {
                    subtitle: {
                        show: true,
                        titleText: "Power BI rocks",
                    },
                };

                testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                    expect(testWrapper.visualBuilder.$subtitle).toBeInDOM();

                    done();
                });
            });
        });
    });

    describe("Value Utils", () => {
        describe("isValueValid", () => {
            it("should return true if a variance is valid", () => {
                expect(isValueValid(99)).toBeTruthy();
            });

            it("should return false if a variance is not valid (NaN)", () => {
                expect(isValueValid(NaN)).toBeFalsy();
            });

            it("should return false if a variance is not valid (undefined)", () => {
                expect(isValueValid(undefined)).toBeFalsy();
            });

            it("should return false if a variance is not valid (null)", () => {
                expect(isValueValid(null)).toBeFalsy();
            });

            it("should return false if a variance is not valid (Infinity)", () => {
                expect(isValueValid(Infinity)).toBeFalsy();
            });

            it("should return false if a variance is not valid (-Infinity)", () => {
                expect(isValueValid(-Infinity)).toBeFalsy();
            });
        });
    });

    describe("DataFormatter", () => {
        describe("getFormattedVariance", () => {
            it("should return N/A if a variance is not valid", () => {
                expect(getFormattedValueWithFallback(NaN, null)).toBe("N/A");
            });

            it("should return 12.34K if precision is 2 and display units are 1000", () => {
                const value: number = 12340;
                const expectedValue: string = "12.34K";

                const numericDescriptor: NumericDescriptor = new NumericDescriptor();

                numericDescriptor.precision = 2;
                numericDescriptor.displayUnits = 1000;

                const actualValue: string = getFormattedValueWithFallback(
                    value,
                    numericDescriptor,
                );

                expect(actualValue).toBe(expectedValue);
            });
        });
    });

    describe("DataConverter", () => {
        describe("findClosestDataPointByDate", () => {
            let dataConverter: DataConverter;
            let defaultDataPoint: IDataRepresentationPoint;

            beforeEach(() => {
                dataConverter = new DataConverter({ createSelectionIdBuilder });

                defaultDataPoint = {
                    index: 2,
                    x: new Date(2018, 1, 1),
                    y: 100,
                };
            });

            it("should return defaultDataPoint if date is undefined", () => {
                const dataPoint: IDataRepresentationPoint = dataConverter.findClosestDataPointByDate(
                    [],
                    undefined,
                    defaultDataPoint,
                );

                expect(dataPoint).toBe(defaultDataPoint);
            });

            it("should return defaultDataPoint is dataPoints is an empty array", () => {
                const dataPoint: IDataRepresentationPoint = dataConverter.findClosestDataPointByDate(
                    [],
                    new Date(),
                    defaultDataPoint,
                );

                expect(dataPoint).toBe(defaultDataPoint);
            });

            it("should return defaultDataPoint if there's no the closest dataPoint", () => {
                const dataPoint: IDataRepresentationPoint = dataConverter.findClosestDataPointByDate(
                    [{
                        index: 0,
                        x: new Date(2018, 8, 8),
                        y: 200,
                    }],
                    new Date(2016, 1, 1),
                    defaultDataPoint,
                );

                expect(dataPoint).toBe(defaultDataPoint);
            });

            it("should return the closest dataPoint by date", () => {
                const firstDataPoint: IDataRepresentationPoint = {
                    index: 0,
                    x: new Date(2018, 8, 8),
                    y: 200,
                };

                const dataPoint: IDataRepresentationPoint = dataConverter.findClosestDataPointByDate(
                    [firstDataPoint],
                    new Date(2018, 9, 9),
                    defaultDataPoint,
                );

                expect(dataPoint).toBe(firstDataPoint);
            });
        });
    });

    describe("KpiBaseDescriptor", () => {
        let textFormattingDescriptor: KpiBaseDescriptor;

        beforeEach(() => {
            textFormattingDescriptor = new KpiBaseDescriptor();
        });

        describe("auto font size", () => {
            it("fontSize should exist if autoAdjustFontSize is false", () => {
                textFormattingDescriptor.autoAdjustFontSize = false;

                textFormattingDescriptor.parse();

                expect("fontSize" in textFormattingDescriptor).toBeTruthy();
            });

            it("fontSize should not exist if autoAdjustFontSize is true", () => {
                textFormattingDescriptor.autoAdjustFontSize = true;

                textFormattingDescriptor.parse();

                expect("fontSize" in textFormattingDescriptor).toBeFalsy();
            });
        });
    });
});

function createElement(viewport: powerbi.IViewport = { height: 600, width: 800 }): Selection<any, any, any, any> {
    return d3Select(testDom(
        viewport.height.toString(),
        viewport.width.toString(),
    ).get(0));
}

function castZeroToNullOrReturnBack(dataView: powerbi.DataView): void {
    dataView.categorical.values.forEach((x) => x.values.forEach((value, index, theArray) => {
        if (value === 0) {
            theArray[index] = null;
        }
    }));
}
