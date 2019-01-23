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

export class AxisDescriptor extends TextFormattingDescriptor {
    public axisLabelX: number = 3;
    public axisLabelY: number = 6;

    public min: DataRepresentationAxisValueType = undefined;
    public defaultMin: DataRepresentationAxisValueType = undefined;
    public max: DataRepresentationAxisValueType = undefined;
    public defaultMax: DataRepresentationAxisValueType = undefined;

    constructor() {
        super();

        this.precision = 0;
        this.fontFamily = "wf_standard-font, helvetica, arial, sans-serif";
        this.fontSize = 7.5;
        this.color = "#4F4F4F";
    }

    public getMin(): DataRepresentationAxisValueType {
        return this.min === undefined || this.min === null
            ? this.defaultMin
            : this.min;
    }

    public getMax(): DataRepresentationAxisValueType {
        return this.max === undefined || this.max === null
            ? this.defaultMax
            : this.max;
    }

    public getValueByPropertyName(propertyName: string): any {
        switch (propertyName) {
            case "min": {
                return this.getMin();
            }
            case "max": {
                return this.getMax();
            }
        }

        return super.getValueByPropertyName(propertyName);
    }
}
