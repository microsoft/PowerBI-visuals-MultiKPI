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
import FormattingSettingsSlice = formattingSettings.Slice;
import ToggleSwitch = formattingSettings.ToggleSwitch;
import ColorPicker = formattingSettings.ColorPicker;
import TextInput = formattingSettings.TextInput;
import NumUpDown = formattingSettings.NumUpDown;

import { TextFormattingDescriptor } from "../textFormattingDescriptor";

import ValidatorType = powerbi.visuals.ValidatorType;

export class KpiBaseDescriptor extends TextFormattingDescriptor {
    public defaultIsShown: boolean = true;
    public defaultFontSize: number = 11;
    public defaultColor: string = "#217CC9";

    public defaultVarianceNotAvailableFontSize: number = 9;
    public defaultVarianceNotAvailableColor: string = "#4F4F4F";

    public isSeriesNameShown: ToggleSwitch = new ToggleSwitch({
        name: "isSeriesNameShown",
        displayNameKey: "Visual_Name",
        value: this.defaultIsShown
    });

    public seriesNameColor: ColorPicker = new ColorPicker({
        name: "seriesNameColor",
        displayNameKey: "Visual_NameColor",
        value: { value: this.defaultColor }
    });

    public seriesNameFontSize: NumUpDown = new NumUpDown({
        name: "seriesNameFontSize",
        displayNameKey: "Visual_SeriesNameFontSize",
        value: this.defaultFontSize,
        options: {
            minValue: {
                type: ValidatorType.Min,
                value: this.minFontSize,
            },
            maxValue: {
                type: ValidatorType.Max,
                value: this.maxFontSize
            }
        }
    });

    public isValueShown: ToggleSwitch = new ToggleSwitch({
        name: "isValueShown",
        displayNameKey: "Visual_Value",
        value: this.defaultIsShown
    });

    public valueColor: ColorPicker = new ColorPicker({
        name: "valueColor",
        displayNameKey: "Visual_ValueColor",
        value: { value: this.defaultColor}
    });

    public valueFontSize: NumUpDown = new NumUpDown({
        name: "valueFontSize",
        displayNameKey: "Visual_ValueFontSize",
        value: this.defaultFontSize,
        options: {
            minValue: {
                type: ValidatorType.Min,
                value: this.minFontSize,
            },
            maxValue: {
                type: ValidatorType.Max,
                value: this.maxFontSize
            }
        }
    });

    public isVarianceShown: ToggleSwitch = new ToggleSwitch({
        name: "isVarianceShown",
        displayNameKey: "Visual_Variance",
        value: this.defaultIsShown
    });

    public varianceColor: ColorPicker = new ColorPicker({
        name: "varianceColor",
        displayNameKey: "Visual_VarianceColor",
        value: { value: this.defaultColor}
    });
    
    public varianceFontSize: NumUpDown = new NumUpDown({
        name: "varianceFontSize",
        displayNameKey: "Visual_VarianceFontSize",
        value: this.defaultFontSize,
        options: {
            minValue: {
                type: ValidatorType.Min,
                value: this.minFontSize,
            },
            maxValue: {
                type: ValidatorType.Max,
                value: this.maxFontSize
            }
        }
    });

    public varianceNotAvailableColor: ColorPicker = new ColorPicker({
        name: "varianceNotAvailableColor",
        displayNameKey: "Visual_MissingVarianceColor",
        value: { value: this.defaultVarianceNotAvailableColor}
    });

    public varianceNotAvailableFontSize: NumUpDown = new NumUpDown({
        name: "varianceNotAvailableFontSize",
        displayNameKey: "Visual_MissingVarianceFontSize",
        value: this.defaultVarianceNotAvailableFontSize,
        options: {
            minValue: {
                type: ValidatorType.Min,
                value: this.minFontSize,
            },
            maxValue: {
                type: ValidatorType.Max,
                value: this.maxFontSize
            }
        }
    });

    public isDateShown: ToggleSwitch = new ToggleSwitch({
        name: "isDateShown",
        displayNameKey: "Visual_Date",
        value: this.defaultIsShown
    });

    public dateColor: ColorPicker = new ColorPicker({
        name: "dateColor",
        displayNameKey: "Visual_DateColor",
        value: { value: this.defaultColor }
    });

    public dateFontSize: NumUpDown = new NumUpDown({
        name: "dateFontSize",
        displayNameKey:"Visual_DateFontSize",
        value: this.defaultFontSize,
        options: {
            minValue: {
                type: ValidatorType.Min,
                value: this.minFontSize,
            },
            maxValue: {
                type: ValidatorType.Max,
                value: this.maxFontSize
            }
        }
    });

    public startDate: TextInput = new TextInput({
        name: "percentCalcDateStr",
        displayNameKey: "Visual_ChangeStartDate",
        value: "",
        placeholder: ""
    });

    public slices: FormattingSettingsSlice[] = [
        this.autoAdjustFontSize, this.fontFamily,
        this.isSeriesNameShown, this.seriesNameFontSize, this.seriesNameColor,
        this.isValueShown, this.valueFontSize, this.valueColor, 
        this.isVarianceShown, this.varianceFontSize, this.varianceNotAvailableFontSize,
        this.varianceColor, this.varianceNotAvailableColor,
        this.isDateShown, this.dateFontSize, this.dateColor
    ];

    constructor() {
        super();

        this.autoAdjustFontSize.value = true;
        this.font.fontFamily.value = "wf_standard-font, helvetica, arial, sans-serif";
        this.font.fontSize.value = undefined;
    }

    public get fontSizePx(): string {
        if (!this.font.fontSize.value) {
            return undefined;
        }

        return this.fontSizePx;
    }

    public parse(): void{
        super.parse();
        this.setValidFontSize();
    }

    private setValidFontSize(): void {
        this.seriesNameFontSize.value = this.getValidFontSize(this.seriesNameFontSize.value);
        this.valueFontSize.value = this.getValidFontSize(this.valueFontSize.value);
        this.varianceFontSize.value = this.getValidFontSize(this.varianceFontSize.value);
        this.dateFontSize.value = this.getValidFontSize(this.dateFontSize.value);
        this.varianceNotAvailableFontSize.value = this.getValidFontSize(this.varianceNotAvailableFontSize.value);
    }

    onPreProcess(): void {
       this.setSlicesVisibility();
    }

    private setSlicesVisibility(): void {
        const isSliceVisible: boolean = !this.autoAdjustFontSize.value;
        this.seriesNameFontSize.visible = isSliceVisible;
        this.valueFontSize.visible = isSliceVisible;
        this.varianceFontSize.visible = isSliceVisible;
        this.dateFontSize.visible = isSliceVisible;
        this.varianceNotAvailableFontSize.visible = isSliceVisible; 
    }
}
