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

import { KpiBaseDescriptor } from "./kpiBaseDescriptor";

export class KpiOnHoverDescriptor extends KpiBaseDescriptor {
    public isCurrentValueShown: boolean = true;
    public currentValueFontSize: number = 11;
    public currentValueColor: string = "#217CC9";

    constructor() {
        super();

        const color: string = "#4F4F4F";

        this.seriesNameColor = color;
        this.valueColor = color;
    }

    public parse() {
        super.parse();

        if (this.autoAdjustFontSize) {
            delete this.currentValueFontSize;
        } else {
            this.currentValueFontSize = this.getValidFontSize(this.currentValueFontSize);
        }
    }
}
