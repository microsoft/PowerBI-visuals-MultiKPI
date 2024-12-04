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
import TextInput = formattingSettings.TextInput;
import ColorPicker = formattingSettings.ColorPicker;
import ToggleSwitch = formattingSettings.ToggleSwitch;
import AlignmentGroup = formattingSettings.AlignmentGroup;

import { TextFormattingDescriptor } from "./textFormattingDescriptor";

import ISandboxExtendedColorPalette = powerbi.extensibility.ISandboxExtendedColorPalette;

export enum SubtitleAlignment {
    left = "left",
    center = "center",
    right = "right",
}

export class SubtitleBaseContainerItem extends TextFormattingDescriptor {
    public displayName: string = "All";

    public defaultTitleText: string = "";
    public defaultBackgroundColor: string = "";
    public defaultWarningText: string = "";
    public defaultAlignment: SubtitleAlignment = SubtitleAlignment.left;
    public defaultFontColor: string = "#217cc9";
    public defaultFontFamily: string = "wf_standard-font, helvetica, arial, sans-serif";

    public paddingTop: number = 0;
    public paddingBottom: number = 0;

    public titleText: TextInput = new TextInput({
        name: "titleText",
        displayNameKey: "Visual_TitleText",
        value: this.defaultTitleText,
        placeholder: this.defaultTitleText
    });

    public backgroundColor: ColorPicker = new ColorPicker({
        name: "background",
        displayNameKey: "Visual_BackgroundColor",
        value: {value: this.defaultBackgroundColor}
    });

    public alignment: AlignmentGroup = new AlignmentGroup({
        name: "alignment",
        displayNameKey: "Visual_Alignment",
        mode: powerbi.visuals.AlignmentGroupMode.Horizonal,
        value: SubtitleAlignment.center
    });

    public warningText: TextInput = new TextInput({
        name: "warningText",
        displayNameKey: "Visual_Warning",
        value: this.defaultWarningText,
        placeholder: this.defaultWarningText
    });

    public show: ToggleSwitch = new ToggleSwitch({
        name: "show",
        displayNameKey: "Visual_Show",
        value: true
    });
    
    constructor(defaultSubtitleDescriptor?: SubtitleBaseContainerItem){
        super(defaultSubtitleDescriptor);

        if (defaultSubtitleDescriptor){
            this.titleText.value = defaultSubtitleDescriptor.titleText.value;
            this.backgroundColor.value = defaultSubtitleDescriptor.backgroundColor.value;
            this.alignment.value = defaultSubtitleDescriptor.alignment.value;
            this.warningText.value = defaultSubtitleDescriptor.warningText.value;
            this.show.value = defaultSubtitleDescriptor.show.value;
        }
        else {
            this.color.value.value = this.defaultFontColor;
            this.font.fontFamily.value = this.defaultFontFamily;
        }
    }

    public processHighContrastMode(colorPalette: ISandboxExtendedColorPalette): void {
        super.processHighContrastMode(colorPalette);

        const isHighContrast: boolean = colorPalette.isHighContrast;
        this.backgroundColor.visible = isHighContrast ? false : this.backgroundColor.visible;
        this.backgroundColor.value = isHighContrast ? colorPalette.background : this.backgroundColor.value;
    }
}
