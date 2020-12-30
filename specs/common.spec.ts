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

import powerbiVisualsApi from "powerbi-visuals-api";

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

import { isValueValid } from "../src/utils/isValueValid";

import { DataConverter } from "../src/converter/data/dataConverter";
import { getFormattedValueWithFallback } from "../src/converter/data/dataFormatter";

import { KpiBaseDescriptor } from "../src/settings/descriptors/kpi/kpiBaseDescriptor";
import { NumericDescriptor } from "../src/settings/descriptors/numericDescriptor";

import { TestWrapper } from "./testWrapper";
import { SubtitleWarningComponent } from "../src/visualComponent/subtitleWarningComponent";

describe("Multi KPI", () => {
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
                numericDescriptor.precision = 5;

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
                numericDescriptor.precision = 5;

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
                numericDescriptor.precision = 5;

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
                numericDescriptor.precision = 5;

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
                numericDescriptor.displayUnits = 1000;
                numericDescriptor.precision = 5;

                const actualValue: string = getFormattedValueWithFallback(
                    value,
                    numericDescriptor,
                );

                expect(actualValue).toBe(expectedValue);
            });

            it("should return 1.23K% for 12.34312 if precision is auto and display units are thousand and default format in percents", () => {
                const value: number = 12.34312;
                const expectedValue: string = "+1.23K%";
                const numericDescriptor: NumericDescriptor = new NumericDescriptor();
                numericDescriptor.autoPrecision = true;
                numericDescriptor.displayUnits = 1000;
                numericDescriptor.defaultFormat = "+0.00%;-0.00%;0.00%";
                numericDescriptor.precision = 5;

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
                numericDescriptor.format = "+0.00%;-0.00%;0.00%";
                numericDescriptor.precision = 5;

                const actualValue: string = getFormattedValueWithFallback(
                    value,
                    numericDescriptor,
                );

                expect(actualValue).toBe(expectedValue);
            });

            it("should return 87.7% for 0.87712 if precision is auto and display units are auto and default format in percents", () => {
                const value: number = 0.87712;
                const expectedValue: string = "+87.7%";
                const numericDescriptor: NumericDescriptor = new NumericDescriptor();
                numericDescriptor.autoPrecision = true;
                numericDescriptor.defaultFormat = "+0.00%;-0.00%;0.00%";
                numericDescriptor.precision = 5;

                const actualValue: string = getFormattedValueWithFallback(
                    value,
                    numericDescriptor,
                );

                expect(actualValue).toBe(expectedValue);
            });

            it("should return 7.43% for 0.0742712 if precision is auto and display units are auto and column format in percents", () => {
                const value: number = 0.0742712;
                const expectedValue: string = "+7.43%";
                const numericDescriptor: NumericDescriptor = new NumericDescriptor();
                numericDescriptor.autoPrecision = true;
                numericDescriptor.columnFormat = "+0.00%;-0.00%;0.00%";
                numericDescriptor.precision = 5;

                const actualValue: string = getFormattedValueWithFallback(
                    value,
                    numericDescriptor,
                );

                expect(actualValue).toBe(expectedValue);
            });

            it("should return -0.02% for -0.00293312 if precision is auto and display units are auto and column format in percents", () => {
                const value: number = -0.000243312;
                const expectedValue: string = "-0.02%";
                const numericDescriptor: NumericDescriptor = new NumericDescriptor();
                numericDescriptor.autoPrecision = true;
                numericDescriptor.columnFormat = "+0.00%;-0.00%;0.00%";
                numericDescriptor.precision = 5;

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
                numericDescriptor.format = "+0.00%;-0.00%;0.00%";
                numericDescriptor.precision = 5;

                const actualValue: string = getFormattedValueWithFallback(
                    value,
                    numericDescriptor,
                );

                expect(actualValue).toBe(expectedValue);
            });
        });

        it("stale data is set up for a metric", (done) => {
            const testWrapper: TestWrapper = TestWrapper.CREATE(true, 0, 1);
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

            // This call will be skipped because of isShown = false
            testWrapper.dataView.metadata.columns[2].objects = {
                staleData: {
                    isShown: false,
                },
            };
            // This call will be skipped because of threshold days
            testWrapper.dataView.metadata.columns[3].objects = {
                staleData: {
                    staleDataText: "unique {$1}",
                    staleDataThreshold: 5,
                },
            };
            testWrapper.dataView.metadata.columns[4].objects = {
                staleData: {
                    staleDataText: "custom label {$1}",
                    staleDataThreshold: 0,
                },
            };

            const components = testWrapper.visualBuilder.instance.rootComponent.getComponents();
            const warningComponent = <SubtitleWarningComponent>(components.filter(c => c instanceof SubtitleWarningComponent)[0]);
            spyOn(warningComponent, "getTitle");

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                expect(warningComponent.getTitle).toHaveBeenCalledWith("label {$1}", 4, 0);
                expect(warningComponent.getTitle).toHaveBeenCalledWith("custom label {$1}", 1, 0);
                expect(warningComponent.getTitle).toHaveBeenCalledTimes(2);
                done();
            });
        });

        it("stale data is set up for a metric with staleDataText from susbtitles (compatibility support)", (done) => {
            const testWrapper: TestWrapper = TestWrapper.CREATE(true, 0, 2);
            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                staleData: {
                    show: true,
                },
                subtitle: {
                    show: true,
                    staleDataText: "Compatibility title"
                },
                values: {
                    showLatterAvailableValue: true,
                    treatEmptyValuesAsZero: false,
                },
            };

            testWrapper.dataView.metadata.columns[2].objects = {
                staleData: {
                    isShown: false,
                },
            };
            testWrapper.dataView.metadata.columns[3].objects = {
                staleData: {
                    staleDataText: "unique {$1}",
                    staleDataThreshold: 1,
                },
            };
            testWrapper.dataView.metadata.columns[4].objects = {
                staleData: {
                    staleDataText: "custom label {$1}",
                    staleDataThreshold: 1,
                },
            };

            const components = testWrapper.visualBuilder.instance.rootComponent.getComponents();
            const warningComponent = <SubtitleWarningComponent>(components.filter(c => c instanceof SubtitleWarningComponent)[0]);
            spyOn(warningComponent, "getTitle");

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                expect(warningComponent.getTitle).toHaveBeenCalledWith("Data is ${1} days late.Compatibility title", 5, 0);
                expect(warningComponent.getTitle).toHaveBeenCalledWith("unique {$1}", 2, 0);
                expect(warningComponent.getTitle).toHaveBeenCalledWith("custom label {$1}", 2, 0);
                expect(warningComponent.getTitle).toHaveBeenCalledTimes(3);
                done();
            });
        });

        it("stale data with goup threshold days deduction option", (done) => {
            const testWrapper: TestWrapper = TestWrapper.CREATE(true, 0, 1);
            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                staleData: {
                    show: true,
                    staleDataThreshold: 0,
                    deductThresholdDays: true,
                },
                subtitle: {
                    show: true,
                },
                values: {
                    showLatterAvailableValue: true,
                    treatEmptyValuesAsZero: false,
                },
            };

            testWrapper.dataView.metadata.columns[1].objects = {
                staleData: {
                    staleDataText: "first label {$1}",
                    staleDataThreshold: 2,
                },
            };
            testWrapper.dataView.metadata.columns[2].objects = {
                staleData: {
                    staleDataText: "second label {$1}",
                },
            };

            // because of high threshold days limit, this item is actual and will not be shown in stale data block
            testWrapper.dataView.metadata.columns[3].objects = {
                staleData: {
                    staleDataText: "third label {$1}",
                    staleDataThreshold: 33,
                },
            };

            const components = testWrapper.visualBuilder.instance.rootComponent.getComponents();
            const warningComponent = <SubtitleWarningComponent>(components.filter(c => c instanceof SubtitleWarningComponent)[0]);
            spyOn(warningComponent, "getTitle");

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                expect(warningComponent.getTitle).toHaveBeenCalledWith("first label {$1}", 4, 2);
                expect(warningComponent.getTitle).toHaveBeenCalledWith("second label {$1}", 1, 0);
                expect(warningComponent.getTitle).toHaveBeenCalledWith("Data is ${1} days late.", 1, 0);
                expect(warningComponent.getTitle).toHaveBeenCalledTimes(3);
                done();
            });
        });

        it("stale data with threshold deduction per metric", (done) => {
            const testWrapper: TestWrapper = TestWrapper.CREATE(true, 0, 5);
            castZeroToNullOrReturnBack(testWrapper.dataView);

            testWrapper.dataView.metadata.objects = {
                staleData: {
                    show: true,
                    staleDataThreshold: 1,
                    deductThresholdDays: false,
                },
                subtitle: {
                    show: true,
                },
                values: {
                    showLatterAvailableValue: true,
                    treatEmptyValuesAsZero: false,
                },
            };

            testWrapper.dataView.metadata.columns[1].objects = {
                staleData: {
                    staleDataText: "first label {$1}",
                    staleDataThreshold: 2,
                },
            };
            testWrapper.dataView.metadata.columns[2].objects = {
                staleData: {
                    staleDataText: "second label {$1}",
                    staleDataThreshold: 3,
                    deductThresholdDays: true,
                },
            };

            // because of high threshold days limit, this item is actual and will not be shown in stale data block
            testWrapper.dataView.metadata.columns[3].objects = {
                staleData: {
                    staleDataText: "third label {$1}",
                    staleDataThreshold: 33,
                },
            };

            const components = testWrapper.visualBuilder.instance.rootComponent.getComponents();
            const warningComponent = <SubtitleWarningComponent>(components.filter(c => c instanceof SubtitleWarningComponent)[0]);
            spyOn(warningComponent, "getTitle");

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                expect(warningComponent.getTitle).toHaveBeenCalledWith("first label {$1}", 8, 0);
                expect(warningComponent.getTitle).toHaveBeenCalledWith("second label {$1}", 5, 3);
                expect(warningComponent.getTitle).toHaveBeenCalledWith("Data is ${1} days late.", 5, 0);
                expect(warningComponent.getTitle).toHaveBeenCalledTimes(3);
                done();
            });
        });

        it("subtitle shouldn't be rendered if it's turned off in Format Panel explicitly", (done) => {
            const testWrapper: TestWrapper = TestWrapper.CREATE();

            testWrapper.dataView.metadata.objects = {
                subtitle: {
                    show: false,
                    titleText: "Power BI rocks",
                },
            };

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                const displayStatus = testWrapper.visualBuilder.$subtitle.css("display");
                expect(displayStatus).toEqual("none");
                done();
            });
        });

        it("merged subtitle should be rendered if it's turned on in Format Panel and provided as data field", (done) => {
            const testWrapper: TestWrapper = TestWrapper
                .CREATE(undefined, undefined, undefined, true);

            testWrapper.dataView.metadata.objects = {
                subtitle: {
                    show: true,
                    titleText: "Power BI rocks",
                },
            };

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                const displayStatus = testWrapper.visualBuilder.$subtitle.css("display");
                expect(displayStatus).toEqual("flex");
                const subtitleElm = testWrapper.visualBuilder.$subtitle.find(".multiKpi_subtitle");
                expect(subtitleElm.text()).toEqual("Power BI rocksSubtitle form data");
                done();
            });
        });

        it("subtitle from data should be rendered if it's turned on in Format Panel and provided only as data field", (done) => {
            const testWrapper: TestWrapper = TestWrapper
                .CREATE(undefined, undefined, undefined, true);

            testWrapper.dataView.metadata.objects = {
                subtitle: {
                    show: true,
                },
            };

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                const displayStatus = testWrapper.visualBuilder.$subtitle.css("display");
                expect(displayStatus).toEqual("flex");
                const subtitleElm = testWrapper.visualBuilder.$subtitle.find(".multiKpi_subtitle");
                expect(subtitleElm.text()).toEqual("Subtitle form data");
                done();
            });
        });
    });

    describe("Version 2.2.0 Changes", () => {
        it("Treat Empty/Missing Values As Zero is enabled", (done) => {
            const testWrapper: TestWrapper = TestWrapper.CREATE(true, 2);

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
            const testWrapper: TestWrapper = TestWrapper.CREATE(true, 2);

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
            const testWrapper: TestWrapper = TestWrapper.CREATE(true, 2);

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
            const testWrapper: TestWrapper = TestWrapper.CREATE(true, 2);

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
            const testWrapper: TestWrapper = TestWrapper.CREATE(true, 2);

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
            const testWrapper: TestWrapper = TestWrapper.CREATE(true, 2);

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
            const testWrapper: TestWrapper = TestWrapper.CREATE(true, 0);

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
            const testWrapper: TestWrapper = TestWrapper.CREATE(true, 0);

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
            const testWrapper: TestWrapper = TestWrapper.CREATE(true, 0);

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
            const testWrapper: TestWrapper = TestWrapper.CREATE(true, 0, 1);

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
            const testWrapper: TestWrapper = TestWrapper.CREATE(true, 0, 1);

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
            const testWrapper: TestWrapper = TestWrapper.CREATE(true, 0, 1);

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
            const testWrapper: TestWrapper = TestWrapper.CREATE(true, 0, 1);

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
            const testWrapper: TestWrapper = TestWrapper.CREATE();

            testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                expect(testWrapper.visualBuilder.$root).toBeInDOM();

                done();
            });
        });

        describe("Main Chart", () => {
            it("the main chart should be rendered", (done) => {
                const testWrapper: TestWrapper = TestWrapper.CREATE();

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

                expect($(".multiKpi_line")).toBeInDOM();
            });

            afterEach(() => {
                lineComponent.destroy();
                lineComponent = null;
            });
        });

        describe("Sparkline", () => {
            it("sparkline component should be rendered", (done) => {
                const testWrapper: TestWrapper = TestWrapper.CREATE();

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
                    const testWrapper: TestWrapper = TestWrapper.CREATE();

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
                    const testWrapper: TestWrapper = TestWrapper.CREATE();

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
                const testWrapper: TestWrapper = TestWrapper.CREATE();

                testWrapper.dataView.metadata.objects = {
                    subtitle: {
                        show: true,
                        titleText: "Power BI rocks",
                    },
                };

                testWrapper.visualBuilder.updateRenderTimeout(testWrapper.dataView, () => {
                    const displayStatus = testWrapper.visualBuilder.$subtitle.css("display");
                    expect(displayStatus).toEqual("flex");
                    const subtitleElm = testWrapper.visualBuilder.$subtitle.find(".multiKpi_subtitle");
                    expect(subtitleElm.text()).toEqual("Power BI rocks");
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

function createElement(viewport: powerbiVisualsApi.IViewport = { height: 600, width: 800 }): Selection<any, any, any, any> {
    return d3Select($(testDom(
        viewport.height.toString(),
        viewport.width.toString(),
    )).get(0));
}

function castZeroToNullOrReturnBack(dataView: powerbiVisualsApi.DataView): void {
    dataView.categorical.values.forEach((x) => x.values.forEach((value, index, theArray) => {
        if (value === 0) {
            theArray[index] = null;
        }
    }));
}
