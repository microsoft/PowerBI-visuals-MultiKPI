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
import TextInput = formattingSettings.TextInput;
import ToggleSwitch = formattingSettings.ToggleSwitch;

import { BaseDescriptor } from "./baseDescriptor";
import { BaseContainerDescriptor } from "./container/baseContainerDescriptor";

export class TooltipContainerItem extends BaseDescriptor {
    public displayNameKey: string = "Visual_All";

    public label: TextInput = new TextInput({
        name: "label",
        displayNameKey: "Visual_Label",
        value: null,
        placeholder: null
    });

    public showDateDifference: ToggleSwitch = new ToggleSwitch({
        name: "showDateDifference",
        displayNameKey: "Visual_DateDifference",
        value: true
    });

    public showVariance: ToggleSwitch = new ToggleSwitch({
        name: "showVariance",
        displayNameKey: "Visual_Variance",
        value: true
    });

    public showDate: ToggleSwitch = new ToggleSwitch({
        name: "showDate",
        displayNameKey: "Visual_Date",
        value: true
    });

    public slices: FormattingSettingsSlice[] = [
        this.isShown, this.label, this.showDateDifference, this.showVariance, this.showDate
    ];

    constructor(defaultTooltipContainerItem?: TooltipContainerItem){
        super(defaultTooltipContainerItem);

        if(defaultTooltipContainerItem){
            this.label.value = defaultTooltipContainerItem.label.value;
            this.showDateDifference.value = defaultTooltipContainerItem.showDateDifference.value;
            this.showVariance.value = defaultTooltipContainerItem.showVariance.value;
            this.showDate.value = defaultTooltipContainerItem.showDate.value;
        }
    }
}

export class TooltipDescriptor extends BaseContainerDescriptor<TooltipContainerItem> {
    public name: string = "tooltip";
    public displayNameKey: string = "Visual_Tooltip";

    public getNewContainerItem(defaultContainerItem: TooltipContainerItem): TooltipContainerItem {
        return new TooltipContainerItem(defaultContainerItem);
    }
}
