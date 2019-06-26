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

import { valueFormatter } from "powerbi-visuals-utils-formattingutils";

import { NumericDescriptor } from "../../settings/descriptors/numericDescriptor";
import { isValueValid } from "../../utils/valueUtils";

export function getFormattedValueWithFallback(variance: number, settings: NumericDescriptor): string {
    if (!isValueValid(variance)) {
        return "N/A";
    }

    return getFormattedValue(variance, settings);
}

export function getFormattedDate(date: Date, format: string = valueFormatter.valueFormatter.DefaultDateFormat): string {
    return valueFormatter.valueFormatter
        .create({ format })
        .format(date);
}

export function getFormattedValue(value: number, settings: NumericDescriptor): string {
    return getValueFormatter(value, settings).format(value);
}

export function getValueFormatter(value: number, settings: NumericDescriptor): valueFormatter.IValueFormatter {
    return valueFormatter.valueFormatter.create({
        displayUnitSystemType: 2,
        format: settings.getFormat(),
        precision: settings.precision,
        value: settings.displayUnits || value,
    });
}
