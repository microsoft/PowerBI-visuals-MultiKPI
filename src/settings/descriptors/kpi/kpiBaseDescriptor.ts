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

import { TextFormattingDescriptor } from "../textFormattingDescriptor";

export class KpiBaseDescriptor extends TextFormattingDescriptor {
    public isSeriesNameShown: boolean = true;
    public seriesNameFontSize: number = 11;
    public seriesNameColor: string = "#217CC9";

    public isValueShown: boolean = true;
    public valueFontSize: number = 11;
    public valueColor: string = "#217CC9";

    public isVarianceShown: boolean = true;
    public varianceFontSize: number = 11;
    public varianceNotAvailableFontSize: number = 9;
    public varianceColor: string = "#217CC9";
    public varianceNotAvailableColor: string = "#4F4F4F";

    public isDateShown: boolean = true;
    public dateFontSize: number = 11;
    public dateColor: string = "#217CC9";

    constructor() {
        super();

        this.fontFamily = "wf_standard-font, helvetica, arial, sans-serif";
        this.fontSize = undefined;
    }

    public parse() {
        super.parse();

        if (this.autoAdjustFontSize) {
            delete this.seriesNameFontSize;
            delete this.valueFontSize;
            delete this.varianceFontSize;
            delete this.dateFontSize;
            delete this.varianceNotAvailableFontSize;
        } else {
            this.seriesNameFontSize = this.getValidFontSize(this.seriesNameFontSize);
            this.valueFontSize = this.getValidFontSize(this.valueFontSize);
            this.varianceFontSize = this.getValidFontSize(this.varianceFontSize);
            this.dateFontSize = this.getValidFontSize(this.dateFontSize);
            this.varianceNotAvailableFontSize = this.getValidFontSize(this.varianceNotAvailableFontSize);
        }
    }
}
