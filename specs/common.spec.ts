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

import { dispatch } from "d3-dispatch";
import { select as d3Select } from "d3-selection";

import {
    createSelectionIdBuilder,
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

import { isValueValid } from "../src/utils/isValueValid";
import { isValidDate } from "../src/utils/isValidDate";
import { DataGapDetector, IDataGapResult } from "../src/utils/dataGapDetector";

import { DataConverter } from "../src/converter/data/dataConverter";
import { getFormattedValueWithFallback } from "../src/converter/data/dataFormatter";

import { KpiBaseDescriptor } from "../src/settings/descriptors/kpi/kpiBaseDescriptor";
import { NumericDescriptor } from "../src/settings/descriptors/numericDescriptor";

import { TestWrapper } from "./testWrapper";

describe("Multi KPI", () => {
      describe("Version 2.4.0 Changes", () => {
        describe("DataGapDetector", () => {
            describe("detectGaps", () => {
                it("should return no gaps for single point", () => {
                    const points: IDataRepresentationPoint[] = [
                        { x: new Date(2023, 0, 1), y: 100, index: 0 }
                    ];
                    
                    const result: IDataGapResult = DataGapDetector.detectGaps(points);
                    
                    expect(result.hasGaps).toBeFalsy();
                    expect(result.totalMissingDays).toBe(0);
                    expect(result.gaps).toEqual([]);
                });

                it("should return no gaps for consecutive days with valid values", () => {
                    const points: IDataRepresentationPoint[] = [
                        { x: new Date(2023, 0, 1), y: 100, index: 0 },
                        { x: new Date(2023, 0, 2), y: 200, index: 1 },
                        { x: new Date(2023, 0, 3), y: 300, index: 2 }
                    ];
                    
                    const result: IDataGapResult = DataGapDetector.detectGaps(points);
                    
                    expect(result.hasGaps).toBeFalsy();
                    expect(result.totalMissingDays).toBe(0);
                    expect(result.gaps).toEqual([]);
                });

                it("should detect gap with missing day between valid points", () => {
                    const points: IDataRepresentationPoint[] = [
                        { x: new Date(2023, 0, 1), y: 100, index: 0 },
                        { x: new Date(2023, 0, 3), y: 300, index: 1 }
                    ];
                    
                    const result: IDataGapResult = DataGapDetector.detectGaps(points);
                    
                    expect(result.hasGaps).toBeTruthy();
                    expect(result.totalMissingDays).toBe(1);
                    expect(result.gaps.length).toBe(1);
                    expect(result.gaps[0].missingDays).toBe(1);
                });

                it("should detect multiple days gap", () => {
                    const points: IDataRepresentationPoint[] = [
                        { x: new Date(2023, 0, 1), y: 100, index: 0 },
                        { x: new Date(2023, 0, 5), y: 500, index: 1 }
                    ];
                    
                    const result: IDataGapResult = DataGapDetector.detectGaps(points);
                    
                    expect(result.hasGaps).toBeTruthy();
                    expect(result.totalMissingDays).toBe(3);
                    expect(result.gaps.length).toBe(1);
                    expect(result.gaps[0].missingDays).toBe(3);
                });

                it("should handle invalid values as gaps", () => {
                    const points: IDataRepresentationPoint[] = [
                        { x: new Date(2023, 0, 1), y: 100, index: 0 },
                        { x: new Date(2023, 0, 2), y: NaN, index: 1 },
                        { x: new Date(2023, 0, 3), y: 300, index: 2 }
                    ];
                    
                    const result: IDataGapResult = DataGapDetector.detectGaps(points);
                    
                    expect(result.hasGaps).toBeTruthy();
                    expect(result.totalMissingDays).toBe(1);
                });

                it("should handle points with zero values as valid", () => {
                    const points: IDataRepresentationPoint[] = [
                        { x: new Date(2023, 0, 1), y: 100, index: 0 },
                        { x: new Date(2023, 0, 2), y: 0, index: 1 },
                        { x: new Date(2023, 0, 3), y: 300, index: 2 }
                    ];
                    
                    const result: IDataGapResult = DataGapDetector.detectGaps(points);
                    
                    expect(result.hasGaps).toBeFalsy();
                    expect(result.totalMissingDays).toBe(0);
                    expect(result.gaps).toEqual([]);
                });

                it("should handle large gaps correctly", () => {
                    const points: IDataRepresentationPoint[] = [
                        { x: new Date(2023, 0, 1), y: 100, index: 0 },
                        { x: new Date(2023, 1, 1), y: 200, index: 1 } // About 31 days gap
                    ];
                    
                    const result: IDataGapResult = DataGapDetector.detectGaps(points);
                    
                    expect(result.hasGaps).toBeTruthy();
                    expect(result.totalMissingDays).toBeGreaterThan(25); // Allow some tolerance
                    expect(result.gaps.length).toBe(1);
                });
            });

            describe("formatGapMessage", () => {
                it("should format message with placeholder replacement", () => {
                    const template: string = "Warning: ${1} days of data are missing";
                    const result: string = DataGapDetector.formatGapMessage(template, 5);
                    
                    expect(result).toBe("Warning: 5 days of data are missing");
                });
            });
        });
    });

    describe("Version 2.3.0 Changes", () => {
        describe("DataFormatter", () => {
            it("should return N/A if a variance is not valid", () => {
                const numericDescriptor: NumericDescriptor = new NumericDescriptor();
                numericDescriptor.autoPrecision = true;
                expect(getFormattedValueWithFallback(NaN, numericDescriptor)).toBe("N/A");
            });

            it("should return 12.3K for 12340 if precision is auto and display units are auto", () => {
                const value: number = 12340;
                const expectedValue: string = "12.3K";
                const numericDescriptor: NumericDescriptor = new NumericDescriptor();
                numericDescriptor.autoPrecision = true;
                numericDescriptor.precision.value = 5;

                const actualValue: string = getFormattedValueWithFallback(
                    value,
                    numericDescriptor,
                );

                expect(actualValue).toBe(expectedValue);
            });

            it("should return 2.34K for 2340 if precision is auto and display units are auto", () => {
                const value: number = 2340;
                const expectedValue: string = "2.34K";
                const numericDescriptor: NumericDescriptor = new NumericDescriptor();
                numericDescriptor.autoPrecision = true;
                numericDescriptor.precision.value = 5;

                const actualValue: string = getFormattedValueWithFallback(
                    value,
                    numericDescriptor,
                );

                expect(actualValue).toBe(expectedValue);
            });

            it("should return 123K for 123403 if precision is auto and display units are auto", () => {
                const value: number = 123403;
                const expectedValue: string = "123K";
                const numericDescriptor: NumericDescriptor = new NumericDescriptor();
                numericDescriptor.autoPrecision = true;
                numericDescriptor.precision.value = 5;

                const actualValue: string = getFormattedValueWithFallback(
                    value,
                    numericDescriptor,
                );

                expect(actualValue).toBe(expectedValue);
            });

            it("should return 1.23M for 1234035 if precision is auto and display units are auto", () => {
                const value: number = 1234035;
                const expectedValue: string = "1.23M";
                const numericDescriptor: NumericDescriptor = new NumericDescriptor();
                numericDescriptor.autoPrecision = true;
                numericDescriptor.precision.value = 5;

                const actualValue: string = getFormattedValueWithFallback(
                    value,
                    numericDescriptor,
                );

                expect(actualValue).toBe(expectedValue);
            });

            it("should return 1234K for 1234035 if precision is auto and display units are thousands", () => {
                const value: number = 1234035;
                const expectedValue: string = "1234K";
                const numericDescriptor: NumericDescriptor = new NumericDescriptor();
                numericDescriptor.autoPrecision = true;
                numericDescriptor.displayUnits.value = 1000;
                numericDescriptor.precision.value = 5;

                const actualValue: string = getFormattedValueWithFallback(
                    value,
                    numericDescriptor,
                );

                expect(actualValue).toBe(expectedValue);
            });

            it("should return 1.23K% for 12.34312 if precision is auto and display units are thousand and format in percents", () => {
                const value: number = 12.34312;
                const expectedValue: string = "+1.23K%";
                const numericDescriptor: NumericDescriptor = new NumericDescriptor();
                numericDescriptor.autoPrecision = true;
                numericDescriptor.displayUnits.value = 1000;
                numericDescriptor.format.value = "+0.00%;-0.00%;0.00%";
                numericDescriptor.precision.value = 5;

                const actualValue: string = getFormattedValueWithFallback(
                    value,
                    numericDescriptor,
                );

                expect(actualValue).toBe(expectedValue);
            });

            it("should return 100% for 1.012 if precision is auto and display units are auto and format in percents", () => {
                const value: number = 1.0012;
                const expectedValue: string = "+100%";
                const numericDescriptor: NumericDescriptor = new NumericDescriptor();
                numericDescriptor.autoPrecision = true;
                numericDescriptor.format.value = "+0.00%;-0.00%;0.00%";
                numericDescriptor.precision.value = 5;

                const actualValue: string = getFormattedValueWithFallback(
                    value,
                    numericDescriptor,
                );

                expect(actualValue).toBe(expectedValue);
            });

            it("should return 87.7% for 0.87712 if precision is auto and display units are auto and format in percents", () => {
                const value: number = 0.87712;
                const expectedValue: string = "+87.7%";
                const numericDescriptor: NumericDescriptor = new NumericDescriptor();
                numericDescriptor.autoPrecision = true;
                numericDescriptor.format.value = "+0.00%;-0.00%;0.00%";
                numericDescriptor.precision.value = 5;

                const actualValue: string = getFormattedValueWithFallback(
                    value,
                    numericDescriptor,
                );

                expect(actualValue).toBe(expectedValue);
            });

            it("should return 7.43% for 0.0742712 if precision is auto and display units are auto and format in percents", () => {
                const value: number = 0.0742712;
                const expectedValue: string = "+7.43%";
                const numericDescriptor: NumericDescriptor = new NumericDescriptor();
                numericDescriptor.autoPrecision = true;
                numericDescriptor.format.value = "+0.00%;-0.00%;0.00%";
                numericDescriptor.precision.value = 5;

                const actualValue: string = getFormattedValueWithFallback(
                    value,
                    numericDescriptor,
                );

                expect(actualValue).toBe(expectedValue);
            });

            it("should return -0.02% for -0.00293312 if precision is auto and display units are auto and format in percents", () => {
                const value: number = -0.000243312;
                const expectedValue: string = "-0.02%";
                const numericDescriptor: NumericDescriptor = new NumericDescriptor();
                numericDescriptor.autoPrecision = true;
                numericDescriptor.format.value = "+0.00%;-0.00%;0.00%";
                numericDescriptor.precision.value = 5;

                const actualValue: string = getFormattedValueWithFallback(
                    value,
                    numericDescriptor,
                );

                expect(actualValue).toBe(expectedValue);
            });

            it("should return 1354% for 1.3537905 if precision is auto and display units are auto and format in percents", () => {
                const value: number = 13.537905;
                const expectedValue: string = "+1354%";
                const numericDescriptor: NumericDescriptor = new NumericDescriptor();
                numericDescriptor.autoPrecision = true;
                numericDescriptor.format.value = "+0.00%;-0.00%;0.00%";
                numericDescriptor.precision.value = 5;

                const actualValue: string = getFormattedValueWithFallback(
                    value,
                    numericDescriptor,
                );

                expect(actualValue).toBe(expectedValue);
            });
        });

        it("subtitle shouldn't be rendered if it's turned off in Format Panel explicitly", async () => {
            const testWrapper: TestWrapper = new TestWrapper();

            testWrapper.dataView.metadata.objects = {
                subtitle: {
                    show: false,
                    titleText: "Power BI rocks",
                },
            };

            await testWrapper.render();

            const displayStatus = getComputedStyle(testWrapper.visualBuilder.subtitle).display;
            expect(displayStatus).toEqual("none");
        });

        it("merged subtitle should be rendered if it's turned on in Format Panel and provided as data field", async () => {
            const testWrapper: TestWrapper = new TestWrapper(undefined, undefined, undefined, true);

            testWrapper.dataView.metadata.objects = {
                subtitle: {
                    show: true,
                    titleText: "Power BI rocks",
                },
            };

            await testWrapper.render();

            const displayStatus = getComputedStyle(testWrapper.visualBuilder.subtitle).display;
            expect(displayStatus).toEqual("flex");
            const subtitleElm = testWrapper.visualBuilder.subtitle?.querySelector(".multiKpi_subtitle");
            expect(subtitleElm?.textContent).toEqual("Power BI rocksSubtitle form data");
        });

        it("subtitle from data should be rendered if it's turned on in Format Panel and provided only as data field", async () => {
            const testWrapper: TestWrapper = new TestWrapper(undefined, undefined, undefined, true);

            testWrapper.dataView.metadata.objects = {
                subtitle: {
                    show: true,
                },
            };

            await testWrapper.render();

            const displayStatus = getComputedStyle(testWrapper.visualBuilder.subtitle).display;
            expect(displayStatus).toEqual("flex");
            const subtitleElm = testWrapper.visualBuilder.subtitle?.querySelector(".multiKpi_subtitle");
            expect(subtitleElm?.textContent).toEqual("Subtitle form data");
        });
    });

    describe("Version 2.2.0 Changes", () => {
        it("Treat Empty/Missing Values As Zero is enabled", async () => {
            const testWrapper: TestWrapper = new TestWrapper(true, 2);

            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                values: {
                    treatEmptyValuesAsZero: true,
                },
            };

            await testWrapper.render();

            const secondSparklineValue = testWrapper.visualBuilder.sparklineSubtitle[3].innerText;
            expect(secondSparklineValue).toEqual("0");
        });

        it("Treat Empty/Missing Values As Zero is disabled", async () => {
            const testWrapper: TestWrapper = new TestWrapper(true, 2);

            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                values: {
                    treatEmptyValuesAsZero: false,
                },
            };

            await testWrapper.render();

            const secondSparklineValue = testWrapper.visualBuilder.sparklineSubtitle[3].innerText;
            expect(secondSparklineValue).toEqual("N/A");
        });

        it("Treat Empty/Missing Values As Zero is disabled but Show Latest Available As Current Value is enabled", async () => {
            const testWrapper: TestWrapper = new TestWrapper(true, 2);

            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                values: {
                    showLatterAvailableValue: true,
                    treatEmptyValuesAsZero: false,
                },
            };

            await testWrapper.render();

            const secondSparklineValue = testWrapper.visualBuilder.sparklineSubtitle[3].innerText;
            expect(secondSparklineValue).toEqual("25");
        });

        it("Treat Empty/Missing Values As Zero is enabled and Show Latest Available As Current Value is enabled", async () => {
            const testWrapper: TestWrapper = new TestWrapper(true, 2);

            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                values: {
                    showLatterAvailableValue: true,
                    treatEmptyValuesAsZero: true,
                },
            };

            await testWrapper.render();

            const secondSparklineValue = testWrapper.visualBuilder.sparklineSubtitle[3].innerText;
            expect(secondSparklineValue).toEqual("0");
        });

        it("Missing Value label is customized", async () => {
            const testWrapper: TestWrapper = new TestWrapper(true, 2);

            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                values: {
                    noValueLabel: "no data",
                    treatEmptyValuesAsZero: false,
                },
            };

            await testWrapper.render();

            const secondSparklineValue = testWrapper.visualBuilder.sparklineSubtitle[3].innerText;
            const fourthSparklineValue = testWrapper.visualBuilder.sparklineSubtitle[7].innerText;
            expect(secondSparklineValue).toEqual("no data");
            expect(fourthSparklineValue).toEqual("no data");
        });

        it("Missing Value label is customized generally and for certain series", async () => {
            const testWrapper: TestWrapper = new TestWrapper(true, 2);

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

            await testWrapper.render();

            const secondSparklineValue = testWrapper.visualBuilder.sparklineSubtitle[3].innerText;
            const fourthSparklineValue = testWrapper.visualBuilder.sparklineSubtitle[7].innerText;
            expect(secondSparklineValue).toEqual("[-]");
            expect(fourthSparklineValue).toEqual("no data");
        });

        it("Missing Variance label is customized", async () => {
            const testWrapper: TestWrapper = new TestWrapper(true, 0);

            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                values: {
                    treatEmptyValuesAsZero: false,
                },
                variance: {
                    noValueLabel: "no data",
                },
            };

            await testWrapper.render();

            const naVariance = testWrapper.visualBuilder.mainChartNAVarance.textContent;
            expect(naVariance).toEqual("(no data)");
        });

        it("Missing Variance label is customized generally and for certain series", async () => {
            const testWrapper: TestWrapper = new TestWrapper(true, 0);

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

            await testWrapper.render();

            const naVariance = testWrapper.visualBuilder.mainChartNAVarance.textContent;
            expect(naVariance).toEqual("(-)");
        });

        it("Stale Data is enabled but Dates are actual", async () => {
            const testWrapper: TestWrapper = new TestWrapper(true, 0);

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

            await testWrapper.render();

            expect(testWrapper.visualBuilder.staleIcon).toBeNull();
        });

        it("Stale Data is enabled and be shown", async () => {
            const testWrapper: TestWrapper = new TestWrapper(true, 0, 1);

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

            await testWrapper.render();

            const sdIcon = testWrapper.visualBuilder.staleIcon;
            expect(sdIcon).not.toBeNull();
            expect(document.body.contains(sdIcon)).toBeTruthy();
        });

        it("Stale Data is enabled but Threshold Days are actual", async () => {
            const testWrapper: TestWrapper = new TestWrapper(true, 0, 1);

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

            await testWrapper.render();

            expect(testWrapper.visualBuilder.staleIcon).toBeNull();
        });

        it("Stale Data is enabled but One of the metrics have more obsolete data than others", async () => {
            const testWrapper: TestWrapper = new TestWrapper(true, 0, 1);

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

            await testWrapper.render();

            const sdIcon = testWrapper.visualBuilder.staleIcon;
            expect(sdIcon).not.toBeNull();
            expect(document.body.contains(sdIcon)).toBeTruthy();
        });

        it("Stale Data is enabled and has sufficient threshold days to handle any metrics, even if one of them more obsolete", async () => {
            const testWrapper: TestWrapper = new TestWrapper(true, 0, 1);

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

            await testWrapper.render();

            expect(testWrapper.visualBuilder.staleIcon).toBeNull();
        });
    });

    describe("DOM", () => {
        it("root element should be defined in DOM", async () => {
            const testWrapper: TestWrapper = new TestWrapper();

            await testWrapper.render();

            expect(document.body.contains(testWrapper.visualBuilder.root)).toBeTruthy();
        });

        describe("Main Chart", () => {
            it("the main chart should be rendered", async () => {
                const testWrapper: TestWrapper = new TestWrapper();

                await testWrapper.render();

                expect(document.body.contains(testWrapper.visualBuilder.mainChart)).toBeTruthy();
            });
        });

        describe("LineComponent", () => {
            let testWrapper: TestWrapper;
            let lineComponent: LineComponent;

            beforeEach(() => {
                testWrapper = new TestWrapper();
                const element = d3Select(testWrapper.visualBuilder.line);

                lineComponent = new LineComponent({
                    element: element,
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
                    isLine: false,
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
                            .CREATE()
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
                            .CREATE()
                            .domain(
                                [minValue, maxValue],
                                DataRepresentationTypeEnum.NumberType,
                            ),
                    },

                };
                lineComponent.render(lineRenderOptions);

                expect(document.body.contains(testWrapper.visualBuilder.sparklineLine[0])).toBeTruthy();
            });

            afterEach(() => {
                lineComponent.destroy();
                lineComponent = null;
            });
        });

        describe("Sparkline", () => {
            it("sparkline component should be rendered", async () => {
                const testWrapper: TestWrapper = new TestWrapper();

                await testWrapper.render();

                Array.from(testWrapper.visualBuilder.sparkline).forEach(
                    el => expect(document.body.contains(el)).toBe(true)
                );
            });

            describe("Subtitle", () => {
                it("subtitle of each sparkline should be rendered", async () => {
                    const testWrapper: TestWrapper = new TestWrapper();

                    await testWrapper.render();

                    Array.from(testWrapper.visualBuilder.sparklineSubtitle).forEach(
                        el => expect(document.body.contains(el)).toBe(true)
                    );
                });
            });

            describe("Line", () => {
                it("line of each sparkline should be rendered", async () => {
                    const testWrapper: TestWrapper = new TestWrapper();

                    await testWrapper.render();

                    Array.from(testWrapper.visualBuilder.sparklineLine).forEach(
                        el => expect(document.body.contains(el)).toBe(true)
                    );
                });
            });
        });

        describe("Subtitle", () => {
            it("subtitle should be rendered if it's turned on via Format Panel explicitly", async () => {
                const testWrapper: TestWrapper = new TestWrapper();

                testWrapper.dataView.metadata.objects = {
                    subtitle: {
                        show: true,
                        titleText: "Power BI rocks",
                    },
                };

                await testWrapper.render();

                const displayStatus = getComputedStyle(testWrapper.visualBuilder.subtitle).display;
                expect(displayStatus).toEqual("flex");
                const subtitleElm = testWrapper.visualBuilder.subtitle?.querySelector(".multiKpi_subtitle");
                expect(subtitleElm?.textContent).toEqual("Power BI rocks");
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

        describe("isValidDate", () => {
            it("should return true for a valid date", () => {
                expect(isValidDate(new Date(2018, 0, 1))).toBeTruthy();
            });

            it("should return false for an invalid date", () => {
                expect(isValidDate(new Date("not-a-date"))).toBeFalsy();
            });

            it("should return false for a non-date value", () => {
                expect(isValidDate("2018-01-01")).toBeFalsy();
            });

            it("should return false for null or undefined", () => {
                expect(isValidDate(null)).toBeFalsy();
                expect(isValidDate(undefined)).toBeFalsy();
            });
        });
    });

    describe("DataFormatter", () => {
        describe("getFormattedVariance", () => {
            it("should return N/A if a variance is not valid", () => {
                const numericDescriptor: NumericDescriptor = new NumericDescriptor();
                numericDescriptor.noValueLabel.value = null;
                expect(getFormattedValueWithFallback(NaN, numericDescriptor)).toBe("N/A");
            });

            it("should return 12.34K if precision is 2 and display units are 1000", () => {
                const value: number = 12340;
                const expectedValue: string = "12.34K";

                const numericDescriptor: NumericDescriptor = new NumericDescriptor();

                numericDescriptor.precision.value = 2;
                numericDescriptor.displayUnits.value = 1000;

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

            it("should return the first dataPoint if the date is before the first dataPoint", () => {
                const firstDataPoint: IDataRepresentationPoint = {
                    index: 0,
                    x: new Date(2018, 8, 8),
                    y: 200,
                };

                const dataPoint: IDataRepresentationPoint = dataConverter.findClosestDataPointByDate(
                    [firstDataPoint],
                    new Date(2016, 1, 1),
                    defaultDataPoint,
                );

                expect(dataPoint).toBe(firstDataPoint);
            });

            it("should return the next available dataPoint when there's no exact match", () => {
                const firstDataPoint: IDataRepresentationPoint = {
                    index: 0,
                    x: new Date(2018, 8, 8),
                    y: 200,
                };

                const secondDataPoint: IDataRepresentationPoint = {
                    index: 1,
                    x: new Date(2018, 8, 20),
                    y: 300,
                };

                const dataPoint: IDataRepresentationPoint = dataConverter.findClosestDataPointByDate(
                    [firstDataPoint, secondDataPoint],
                    new Date(2018, 8, 15),
                    defaultDataPoint,
                );

                expect(dataPoint).toBe(secondDataPoint);
            });

            it("should match the dataPoint on the same calendar day ignoring the time component", () => {
                const firstDataPoint: IDataRepresentationPoint = {
                    index: 0,
                    x: new Date(2018, 8, 8),
                    y: 200,
                };

                const secondDataPoint: IDataRepresentationPoint = {
                    index: 1,
                    x: new Date(2018, 8, 20),
                    y: 300,
                };

                const dataPoint: IDataRepresentationPoint = dataConverter.findClosestDataPointByDate(
                    [firstDataPoint, secondDataPoint],
                    new Date(2018, 8, 20, 13, 45),
                    defaultDataPoint,
                );

                expect(dataPoint).toBe(secondDataPoint);
            });

            it("should return the latest dataPoint if the date is after the last dataPoint", () => {
                const firstDataPoint: IDataRepresentationPoint = {
                    index: 0,
                    x: new Date(2018, 8, 8),
                    y: 200,
                };

                const secondDataPoint: IDataRepresentationPoint = {
                    index: 1,
                    x: new Date(2018, 8, 20),
                    y: 300,
                };

                const dataPoint: IDataRepresentationPoint = dataConverter.findClosestDataPointByDate(
                    [firstDataPoint, secondDataPoint],
                    new Date(2019, 0, 1),
                    defaultDataPoint,
                );

                expect(dataPoint).toBe(secondDataPoint);
            });
        });
    });

    describe("KpiBaseDescriptor", () => {
        let textFormattingDescriptor: KpiBaseDescriptor;

        beforeEach(() => {
            textFormattingDescriptor = new KpiBaseDescriptor();
        });

        describe("auto font size", () => {
            it("fontSize should be visible if autoAdjustFontSize is false", () => {
                textFormattingDescriptor.autoAdjustFontSize.value = false;

                textFormattingDescriptor.onPreProcess();

                expect(textFormattingDescriptor.seriesNameFontSize.visible).toBeTruthy();
                expect(textFormattingDescriptor.valueFontSize.visible).toBeTruthy();
                expect(textFormattingDescriptor.varianceFontSize.visible).toBeTruthy();
                expect(textFormattingDescriptor.varianceNotAvailableFontSize.visible).toBeTruthy();
                expect(textFormattingDescriptor.dateFontSize.visible).toBeTruthy();
            });

            it("fontSize should not be visible if autoAdjustFontSize is true", () => {
                textFormattingDescriptor.autoAdjustFontSize.value = true;

                textFormattingDescriptor.onPreProcess();

                expect(textFormattingDescriptor.seriesNameFontSize.visible).toBeFalsy();
                expect(textFormattingDescriptor.valueFontSize.visible).toBeFalsy();
                expect(textFormattingDescriptor.varianceFontSize.visible).toBeFalsy();
                expect(textFormattingDescriptor.varianceNotAvailableFontSize.visible).toBeFalsy();
                expect(textFormattingDescriptor.dateFontSize.visible).toBeFalsy();
            });
        });
    });
});

function castZeroToNullOrReturnBack(dataView: powerbi.DataView): void {
    dataView.categorical?.values?.forEach((x) => x.values.forEach((value, index, theArray) => {
        if (value === 0) {
            theArray[index] = null;
        }
    }));
}
