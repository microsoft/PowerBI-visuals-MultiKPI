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
import NumUpDown = formattingSettings.NumUpDown;
import ColorPicker = formattingSettings.ColorPicker;
import TextInput = formattingSettings.TextInput;

import ISandboxExtendedColorPalette = powerbi.extensibility.ISandboxExtendedColorPalette;

import { BaseDescriptor } from "./baseDescriptor";

export class StaleDataDescriptor extends BaseDescriptor {
    public name: string = "staleData";
    public displayNameKey: string = "Visual_StaleData";
    public descriptionKey: string = "Visual_StaleDataDescription";

    public defaultColorValue: string = "#3599b8";
    public defaultBackgroundValue: string = "";

    public staleDataText: TextInput = new TextInput({
        name: "staleDataText",
        displayNameKey: "Visual_Title",
        descriptionKey: "Visual_StaleDataTextDescription",
        value: "",
        placeholder: ""
    });

    public staleDataThreshold: NumUpDown = new NumUpDown({
        name: "staleDataThreshold",
        displayNameKey: "Visual_Threshold",
        descriptionKey: "Visual_ThresholdDescription",
        value: 0
    });

    public color: ColorPicker = new ColorPicker({
        name: "color",
        displayNameKey: "Visual_Color",
        value: {value: this.defaultColorValue}
    });

    public backgroundColor: ColorPicker = new ColorPicker({
        name: "background",
        displayNameKey: "Visual_BackgroundColor",
        value: {value: this.defaultBackgroundValue}
    });

    public deductThresholdDays: ToggleSwitch = new ToggleSwitch({
        name: "deductThresholdDays",
        displayNameKey: "Visual_DeductThresholdDays",
        value: false
    });

    topLevelSlice: ToggleSwitch = this.isShown;

    public slices: FormattingSettingsSlice[] = [
        this.staleDataText, this.deductThresholdDays,
        this.staleDataThreshold, this.color, this.backgroundColor
    ];

    public processHighContrastMode(colorPalette: ISandboxExtendedColorPalette): void {
        const isHighContrast: boolean = colorPalette.isHighContrast;

        this.color.visible = isHighContrast ? false : this.color.visible;
        this.color.value = isHighContrast ? colorPalette.foreground : this.color.value;

        this.backgroundColor.visible = isHighContrast ? false : this.backgroundColor.visible;
        this.backgroundColor.value = isHighContrast ? colorPalette.foreground : this.backgroundColor.value;
    }
}
