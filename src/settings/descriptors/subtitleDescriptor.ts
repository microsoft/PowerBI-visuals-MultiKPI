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

import { SubtitleAlignment, SubtitleBaseContainerItem } from "./subtitleBaseDescriptor";

export class SubtitleContainerItem extends SubtitleBaseContainerItem {
    public name: string = "subtitle";
    public displayNameKey: string = "Visual_Subtitle";
    
    public defaultWarningText: string = "Warning Message";
    public staleDataText: string = ""; // We keep it here just for compatibility with old reports
    public defaultFontFamily: string = "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif";

    topLevelSlice: ToggleSwitch = this.show;
    public slices: FormattingSettingsSlice[] = [
        this.font, this.color, this.titleText, 
        this.backgroundColor, this.alignment,
        this.warningText
    ];

    constructor(){
        super();
        this.show.value = false;
        this.alignment.value = SubtitleAlignment.left;
        this.font.fontSize.value = 8.25;
        this.font.fontFamily.value = this.defaultFontFamily;
        this.color.value.value  = "#4F4F4F";
        this.warningText.value = this.defaultWarningText;
    }
}
