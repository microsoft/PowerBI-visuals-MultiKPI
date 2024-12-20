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

import { BaseDescriptor } from "../baseDescriptor";
import { BaseContainerDescriptor } from "../container/baseContainerDescriptor";

import ISandboxExtendedColorPalette = powerbi.extensibility.ISandboxExtendedColorPalette;

export class SparklineChartContainerItem extends BaseDescriptor {
    public displayNameKey: string = "Visual_All";

    public defaultColorValue: string = "#217cc9";
    public defaultAlternativeColorValue: string = "#c7def1";
    public defaultShouldInterpolate: boolean = true;
    public thickness: number = 1;
    public dotRadiusFactor: number = 2;

    private minThickness: number = 0.25;
    private maxThickness: number = 25;

    public color: ColorPicker = new ColorPicker({
        name: "color",
        displayNameKey: "Visual_Color",
        value: {value:this.defaultColorValue}
    });

    public alternativeColor: ColorPicker = new ColorPicker({
        name: "alternativeColor",
        displayNameKey: "Visual_AlternativeColor",
        value: {value: this.defaultAlternativeColorValue}
    });

    public shouldInterpolate: ToggleSwitch = new ToggleSwitch({
        name: "shouldInterpolate",
        displayNameKey: "Visual_Interpolate",
        value: this.defaultShouldInterpolate
    });

    public slices: FormattingSettingsSlice[] = [this.color, this.alternativeColor, this.shouldInterpolate];

    public getRadius(): number {
        return this.thickness * this.dotRadiusFactor;
    }

    public parse(): void {
        this.thickness = Math.max(
            this.minThickness,
            Math.min(
                this.maxThickness,
                this.thickness,
            ),
        );
    }

    public processHighContrastMode(colorPalette: ISandboxExtendedColorPalette): void {
        const isHighContrast: boolean = colorPalette.isHighContrast;

        this.slices.forEach((slice) => {
            if (slice instanceof ColorPicker){
                slice.visible = isHighContrast ? false : slice.visible;
                slice.value = isHighContrast ? colorPalette.foreground : slice.value;
            }
        })
    }

    constructor(defaultSparklineChartContainerItem?: SparklineChartContainerItem){
        super(defaultSparklineChartContainerItem);

        if(defaultSparklineChartContainerItem){
            this.color.value = defaultSparklineChartContainerItem.color.value;
            this.alternativeColor.value = defaultSparklineChartContainerItem.alternativeColor.value;
            this.shouldInterpolate.value = defaultSparklineChartContainerItem.shouldInterpolate.value;
        }
    }
}

export class SparklineChartDescriptor extends BaseContainerDescriptor<SparklineChartContainerItem> {
    public name: string = "sparklineChart";
    public displayNameKey: string = "Visual_SparklineChart";
    
    public getNewContainerItem(defaultContainerItem: SparklineChartContainerItem): SparklineChartContainerItem {
        return new SparklineChartContainerItem(defaultContainerItem);
    }
}
