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
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import NumUpDown = formattingSettings.NumUpDown;
import AutoDropdown = formattingSettings.AutoDropdown;
import TextInput = formattingSettings.TextInput;

import { IDescriptor } from "./descriptor";
import { FormatDescriptor } from "./formatDescriptor";

export enum DisplayUnitsType {
    Auto = 0,
    None = 1,
    Thousands = 1000,
    Millions = 1000000,
    Billions = 1000000000,
    Trillions = 1000000000000
}

export class NumericDescriptor extends FormatDescriptor implements IDescriptor {
    public autoPrecision: boolean = false;
    public defaultNoValueLabel: string = "N/A";

    protected minPrecision: number = 0;
    protected maxPrecision: number = 17;

    public noValueLabel: TextInput = new TextInput({
        name: "noValueLabel",
        displayNameKey: "Visual_NoValueLabel",
        value: this.defaultNoValueLabel,
        placeholder: this.defaultNoValueLabel
    });

    public displayUnits: AutoDropdown = new AutoDropdown({
        name: "displayUnits",
        displayNameKey: "Visual_DisplayUnits",
        value: DisplayUnitsType.Auto
    });

    public precision: NumUpDown = new NumUpDown({
        name: "precision",
        displayNameKey: "Visual_Precision",
        value: 0,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: this.minPrecision,
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: this.maxPrecision,
            },
        }
    });

    public parse(): void {
        this.precision.value = this.getValidPrecision(this.precision.value);
    }

    protected getValidPrecision(precision: number): number {
        if (isNaN(precision)) {
            return precision;
        }

        return Math.min(
            Math.max(this.minPrecision, precision),
            this.maxPrecision,
        );
    }

    constructor(defaultNumericDescriptor?: NumericDescriptor){
        super(defaultNumericDescriptor);

        if (defaultNumericDescriptor){
            this.noValueLabel.value = defaultNumericDescriptor.noValueLabel.value;
            this.displayUnits.value = defaultNumericDescriptor.displayUnits.value;
            this.precision.value = defaultNumericDescriptor.precision.value;
        }
    }
}
