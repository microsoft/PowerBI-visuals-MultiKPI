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

import { NumericDescriptor } from "./numericDescriptor";
import { BaseContainerDescriptor } from "./container/baseContainerDescriptor";

export class ValuesContainerItem extends NumericDescriptor {
    public displayNameKey: string = "Visual_All";

    public treatEmptyValuesAsZero: ToggleSwitch = new ToggleSwitch({
        name: "treatEmptyValuesAsZero",
        displayNameKey: "Visual_TreatEmptyValuesAsZero",
        value: true
    });

    public showLatterAvailableValue: ToggleSwitch = new ToggleSwitch({
        name: "showLatterAvailableValue",
        displayNameKey: "Visual_ShowLatestAvailableValue",
        value: false
    });

    public slices: FormattingSettingsSlice[] = [
        this.format, this.noValueLabel, this.displayUnits, this.precision,
        this.treatEmptyValuesAsZero, this.showLatterAvailableValue
    ];

    constructor(defaultValuesContainerItem?: ValuesContainerItem){
        super(defaultValuesContainerItem);

        if (defaultValuesContainerItem){
            this.treatEmptyValuesAsZero.value = defaultValuesContainerItem.treatEmptyValuesAsZero.value;
            this.showLatterAvailableValue.value = defaultValuesContainerItem.showLatterAvailableValue.value;
        }
    }
}

export class ValuesDescriptor extends BaseContainerDescriptor<ValuesContainerItem> {
    public name: string = "values";
    public displayNameKey: string = "Visual_Values";

    public getNewContainerItem(defaultContainerItem: ValuesContainerItem): ValuesContainerItem {
        return new ValuesContainerItem(defaultContainerItem);
    }
}
