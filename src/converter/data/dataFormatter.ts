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

import { displayUnitSystemType, valueFormatter } from "powerbi-visuals-utils-formattingutils";
import { NumericDescriptor } from "../../settings/descriptors/numericDescriptor";
import { isValueValid } from "../../utils/isValueValid";

const wholeUnits: displayUnitSystemType.DisplayUnitSystemType = displayUnitSystemType.DisplayUnitSystemType.WholeUnits;

export function getFormattedValueWithFallback(variance: number, settings: NumericDescriptor): string {
    if (!isValueValid(variance)) {
        return settings.noValueLabel.value || "N/A";
    }

    return getFormattedValue(variance, settings);
}

export function getFormattedDate(date: Date, format: string = valueFormatter.DefaultDateFormat): string {
    return valueFormatter
        .create({ format })
        .format(date);
}

export function getFormattedValue(value: number, settings: NumericDescriptor): string {
    return getValueFormatter(value, settings).format(value);
}

export function getValueFormatter(value: number, settings: NumericDescriptor): valueFormatter.IValueFormatter {
    return valueFormatter.create({
        displayUnitSystemType: wholeUnits,
        format: settings.format.value,
        precision: detectPrecision(value, settings),
        value: settings.displayUnits.value || value,
    });
}

export function detectPrecision(inputValue: number, settings: NumericDescriptor): number {
    if (settings.autoPrecision) {
        const format = settings.format.value;
        return valueFormatter.calculateExactDigitsPrecision(inputValue, format, +settings.displayUnits.value, 3);
    }

    return settings.precision.value;
}
