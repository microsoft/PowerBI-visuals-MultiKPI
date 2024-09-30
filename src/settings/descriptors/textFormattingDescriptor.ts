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

import { pixelConverter } from "powerbi-visuals-utils-typeutils";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import FontControl = formattingSettings.FontControl;
import FontPicker = formattingSettings.FontPicker;
import NumUpDown = formattingSettings.NumUpDown;
import ColorPicker = formattingSettings.ColorPicker;
import ToggleSwitch = formattingSettings.ToggleSwitch;

import ValidatorType = powerbi.visuals.ValidatorType;

import { NumericDescriptor } from "./numericDescriptor";

export class TextFormattingDescriptor extends NumericDescriptor {
    public defaultAutoAdjustFontSize: boolean = false;
    public autoFontSizeValue: number = 8;
    public defaultFontSize: number = 8;
    public defaultFontFamily: string = "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif";
    public defaultFontColor: string = "#666666";

    public isBold: boolean = false;
    public isItalic: boolean = false;
    public isUnderlined: boolean = false;

    protected minFontSize: number = 4;
    protected maxFontSize: number = 72;

    public fontSize: NumUpDown = new NumUpDown({
        name: "fontSize",
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

    public fontFamily: FontPicker = new FontPicker({
        name: "fontFamily",
        value: this.defaultFontFamily
    });

    public font: FontControl = new FontControl({
        name: "font",
        displayNameKey: "Visual_Font",
        fontFamily: this.fontFamily,
        fontSize: this.fontSize
    });

    public color: ColorPicker = new ColorPicker({
        name: "color",
        displayNameKey: "Visual_FontColor",
        value: { value: this.defaultFontColor }
    });

    public autoAdjustFontSize: ToggleSwitch = new ToggleSwitch({
        name: "autoAdjustFontSize",
        displayNameKey: "Visual_AutoFontSize",
        value: this.defaultAutoAdjustFontSize
    });

    public parse(): void {
        super.parse();
        this.font.fontSize.value = this.getValidFontSize(this.font.fontSize.value);
    }

    public get fontSizePx(): string {
        return pixelConverter.toString(this.fontSizeInPx);
    }

    private get fontSizeInPx(): number {
        const fontSize: number = this.autoAdjustFontSize.value
            ? this.autoFontSizeValue
            : this.font.fontSize.value;

        return pixelConverter.fromPointToPixel(fontSize);
    }

    protected getValidFontSize(fontSize: number): number {
        return Math.max(
            this.minFontSize,
            Math.min(
                this.maxFontSize,
                fontSize,
            ),
        );
    }

    constructor(defaultTextDescriptor?: TextFormattingDescriptor){
        super(defaultTextDescriptor);

        if (defaultTextDescriptor){
            this.fontSize.value = defaultTextDescriptor.fontSize.value;
            this.fontFamily.value = defaultTextDescriptor.fontFamily.value;
            this.color.value = defaultTextDescriptor.color.value;
            this.autoAdjustFontSize.value = defaultTextDescriptor.autoAdjustFontSize.value;
        }
    }
}
