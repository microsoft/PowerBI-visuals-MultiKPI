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
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import FormattingSettingsSlice = formattingSettings.Slice;
import ItemDropdown = formattingSettings.ItemDropdown;
import ColorPicker = formattingSettings.ColorPicker;
import ToggleSwitch = formattingSettings.ToggleSwitch;

import { dataRepresentationOptions, IEnumMemberWithDisplayNameKey } from "../../converter/data/dataRepresentation";
import { BaseDescriptor } from "./baseDescriptor";
import { IDescriptor } from "./descriptor";

export class ChartDescriptor extends BaseDescriptor implements IDescriptor {
    public name: string = "chart";
    public displayNameKey: string = "Visual_MainChart";

    public defaultChartType: IEnumMemberWithDisplayNameKey = dataRepresentationOptions[0];
    public defaultColor: string = "#c8d9ec";
    public defaultAlternativeColor: string = "#f1f5fa";
    public thickness: number = 2;

    private minThickness: number = 0.25;
    private maxThickness: number = 25;

    public chartType: ItemDropdown = new ItemDropdown({
        name: "chartType",
        displayNameKey: "Visual_Type",
        items: dataRepresentationOptions,
        value: this.defaultChartType
    });

    public color: ColorPicker = new ColorPicker({
        name: "color",
        displayNameKey: "Visual_Color",
        value: {value: this.defaultColor}
    });

    public alternativeColor: ColorPicker = new ColorPicker({
        name: "alternativeColor",
        displayNameKey: "Visual_AlternativeColor",
        value: {value: this.defaultAlternativeColor}
    });

    public shouldRenderZeroLine: ToggleSwitch = new ToggleSwitch({
        name: "shouldRenderZeroLine",
        displayNameKey: "Visual_ZeroLine",
        value: false
    });

    public slices: FormattingSettingsSlice[] = [this.chartType, this.color, this.alternativeColor, this.shouldRenderZeroLine];

    public parse(): void {
        this.thickness = Math.max(
            this.minThickness,
            Math.min(
                this.maxThickness,
                this.thickness,
            ),
        );
    }

    public setLocalizedDisplayName(localizationManager: ILocalizationManager): void {
        dataRepresentationOptions.forEach(option => {
            option.displayName = localizationManager.getDisplayName(option.key)
        });
    }
}
