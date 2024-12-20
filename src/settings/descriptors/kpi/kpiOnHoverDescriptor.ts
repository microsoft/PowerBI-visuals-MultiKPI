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
import powerbi from "powerbi-visuals-api";
import ValidatorType = powerbi.visuals.ValidatorType;

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import ToggleSwitch = formattingSettings.ToggleSwitch;
import ColorPicker = formattingSettings.ColorPicker;
import NumUpDown = formattingSettings.NumUpDown;

import { KpiBaseDescriptor } from "./kpiBaseDescriptor";

export class KpiOnHoverDescriptor extends KpiBaseDescriptor {
    public name: string = "kpiOnHover";
    public displayNameKey: string = "Visual_KPIOnHover";

    public defaultCurrentValueFontSize: number = 11;
    public defaultCurrentValueColor: string = "#217CC9";
    public defaultSeriesNameColor: string = "#4F4F4F";

    public isCurrentValueShown: ToggleSwitch = new ToggleSwitch({
        name: "isCurrentValueShown",
        displayNameKey: "Visual_CurrentValue",
        value: true
    });

    public currentValueColor: ColorPicker = new ColorPicker({
        name: "currentValueColor",
        displayNameKey: "Visual_CurrentValueColor",
        value: {value: this.defaultCurrentValueColor}
    });

    public isCurrentValueLeftAligned: ToggleSwitch = new ToggleSwitch({
        name: "isCurrentValueLeftAligned",
        displayNameKey: "Visual_CurrentValueIsLeftAlgned",
        value: true
    });

    public currentValueFontSize: NumUpDown = new NumUpDown({
        name: "currentValueFontSize",
        displayNameKey: "Visual_CurrentValueFontSize",
        value: this.defaultCurrentValueFontSize,
        options: {
            maxValue: {
                type: ValidatorType.Max,
                value: this.maxFontSize
            },
            minValue: {
                type: ValidatorType.Min,
                value: this.minFontSize
            }
        }
    });

    constructor() {
        super();
        this.slices.push(this.isCurrentValueShown, this.currentValueFontSize, this.currentValueColor, this.isCurrentValueLeftAligned);
        
        this.seriesNameColor.value.value = this.defaultSeriesNameColor;
        this.valueColor.value.value = this.defaultSeriesNameColor;
    }

    public parse(): void {
        super.parse();

        this.currentValueFontSize.value = this.getValidFontSize(this.currentValueFontSize.value);
    }

    onPreProcess(): void {
        super.onPreProcess();

        const isSliceVisible: boolean = !this.autoAdjustFontSize.value;
        this.currentValueFontSize.visible = isSliceVisible;
    }
}
