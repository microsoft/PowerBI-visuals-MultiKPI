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
import ToggleSwitch = formattingSettings.ToggleSwitch;

import { AxisBaseContainerItem, AxisBaseDescriptor } from "../axisBaseDescriptor";

export class SparklineAxisContainerItem extends AxisBaseContainerItem {
    public name: string = "sparklineYAxis";

    public shouldInheritValues: ToggleSwitch = new ToggleSwitch({
        name: "shouldInheritValues",
        displayNameKey: "Visual_ShouldInheritValues",
        value: false
    });

    constructor(defaultAxisContainerItem?: SparklineAxisContainerItem){
        super(defaultAxisContainerItem);
        if (defaultAxisContainerItem){
            this.shouldInheritValues.value = defaultAxisContainerItem.shouldInheritValues.value;
        }
        this.slices.push(this.shouldInheritValues);
    }
}

export class SparklineAxisDescriptor extends AxisBaseDescriptor<SparklineAxisContainerItem> {
    public name: string = "sparklineYAxis";
    public displayNameKey: string = "VIsual_SparklineYAxis";

    public getNewContainerItem(defaultContainerItem: SparklineAxisContainerItem): SparklineAxisContainerItem {
        return new SparklineAxisContainerItem(defaultContainerItem);
    }

    constructor(){
        super();

        this.defaultContainerItem.axisLabelX = 8;
        this.defaultContainerItem.axisLabelY = 2;
        this.defaultContainerItem.isShown.value = false;
    }
}
