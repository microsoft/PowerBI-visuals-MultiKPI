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
import FormattingSettingsSlice = formattingSettings.Slice;
import NumUpDown = formattingSettings.NumUpDown;

import { BaseDescriptor } from "../baseDescriptor";
import { IDescriptor } from "../descriptor";
import { GridDescriptor } from "../gridDescriptor";
import { BaseContainerDescriptor } from "../container/baseContainerDescriptor";

export class SparklineContainerItem extends BaseDescriptor implements IDescriptor{
    public displayNameKey: string = "Visual_All";

    private minPosition: number = 1;
    private maxPosition: number = GridDescriptor.MaxColumns + 1;

    public position = new NumUpDown({
        name: "position",
        displayNameKey: "Visual_Position",
        value: NaN,
        options: {
            maxValue: {
                type: ValidatorType.Max,
                value: this.maxPosition
            },
            minValue: {
                type: ValidatorType.Min,
                value: this.minPosition
            }
        }
    });

    public slices: FormattingSettingsSlice[] = [this.position];

    public parse(): void {
        this.position.value = isNaN(this.position.value) || this.position.value === null
            ? this.position.value
            : Math.max(
                this.minPosition,
                Math.min(
                    this.maxPosition,
                    this.position.value,
                ),
            );
    }

    constructor(defaultSparklineContainerItem?: SparklineContainerItem){
        super(defaultSparklineContainerItem);

        if(defaultSparklineContainerItem){
            this.position.value = defaultSparklineContainerItem.position.value;
        }
    }
}

export class SparklineDescriptor extends BaseContainerDescriptor<SparklineContainerItem> {
    public name = "sparkline";
    public displayNameKey = "Visual_Sparkline";

    public getNewContainerItem(defaultContainerItem: SparklineContainerItem): SparklineContainerItem {
        return new SparklineContainerItem(defaultContainerItem);
    }
}
