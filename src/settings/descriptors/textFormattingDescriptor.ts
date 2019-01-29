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

import { pixelConverter } from "powerbi-visuals-utils-typeutils";

import { NumericDescriptor } from "./numericDescriptor";

export class TextFormattingDescriptor extends NumericDescriptor {
    public autoAdjustFontSize: boolean = false;
    public autoFontSizeValue: number = 8;
    public fontSize: number = 8;

    public isBold: boolean = false;
    public isItalic: boolean = false;
    public isUnderlined: boolean = false;

    public fontFamily: string = `"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif`;

    public color: string = "#666666";

    private minFontSize: number = 4;
    private maxFontSize: number = 72;

    public parse(): void {
        super.parse();

        if (this.autoAdjustFontSize) {
            delete this.fontSize;

            return;
        }

        this.fontSize = this.getValidFontSize(this.fontSize);

        this.fontSize = Math.max(
            this.minFontSize,
            Math.min(
                this.maxFontSize,
                this.fontSize,
            ),
        );
    }

    public getFontSizeInPx(fontSize: number): number {
        return pixelConverter.fromPointToPixel(fontSize);
    }

    public get fontSizePx(): string {
        if (!this.fontSize) {
            return undefined;
        }

        return pixelConverter.toString(this.fontSizeInPx);
    }

    public get fontSizeInPx(): number {
        const fontSize: number = this.autoAdjustFontSize
            ? this.autoFontSizeValue
            : this.fontSize;

        return this.getFontSizeInPx(fontSize);
    }

    protected getValidFontSize(fontSize: number): number {
        return Math.max(
            this.minFontSize,
            Math.min(
                this.maxFontSize,
                fontSize,
            ),
        );
    }
}
