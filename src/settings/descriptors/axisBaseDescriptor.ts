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
import FormattingSettingsSlice = formattingSettings.Slice;

import {BaseContainerDescriptor} from "../descriptors/container/baseContainerDescriptor";
import { TextFormattingDescriptor } from "./textFormattingDescriptor";

export class AxisBaseContainerItem extends TextFormattingDescriptor {
    public displayName: string = "All";
    public defaultDomainColor: string = "#4F4F4F"
    
    public axisLabelX: number = 3;
    public axisLabelY: number = 6;

    public defaultMin: number = null;
    public defaultMax: number = null;

    public min = new NumUpDown({
        name: "min",
        displayNameKey: "Visual_Min",
        value: null
    });

    public max = new NumUpDown({
        name: "max",
        displayNameKey: "Visual_Max",
        value: null
    });

    public slices: FormattingSettingsSlice[] = [
        this.isShown, this.format, this.displayUnits,
        this.precision, this.font, this.color,
        this.min, this.max
    ];

    public getMin(): number {
        this.min.value = this.min.value ?? this.defaultMin;
        return this.min.value;
    }

    public getMax(): number {
        this.max.value = this.max.value ?? this.defaultMax;
        return this.max.value;
    }

    constructor(defaultAxisContainerItem?: AxisBaseContainerItem){
        super(defaultAxisContainerItem);

        if (defaultAxisContainerItem){
            this.min.value = defaultAxisContainerItem.min.value;
            this.max.value = defaultAxisContainerItem.max.value;
        }
    }
}

export abstract class AxisBaseDescriptor<BaseContainerItem extends AxisBaseContainerItem> extends BaseContainerDescriptor<BaseContainerItem> {
    constructor() {
        super();
        this.defaultContainerItem.precision.value = 0;
        this.defaultContainerItem.font.fontFamily.value = "wf_standard-font, helvetica, arial, sans-serif";
        this.defaultContainerItem.font.fontSize.value = 7.5;
        this.defaultContainerItem.color.value.value = "#4F4F4F";
    }
}
