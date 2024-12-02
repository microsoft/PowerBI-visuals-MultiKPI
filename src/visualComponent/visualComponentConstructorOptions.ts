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

import { Dispatch } from "d3-dispatch";
import powerbi from "powerbi-visuals-api";
import IColorPalette = powerbi.extensibility.IColorPalette;

import { ScaleService } from "../services/scaleService";
import { Settings } from "../settings/settings";
import { IVisualComponentBaseConstructorOptions } from "./visualComponentBaseConstructorOptions";
import { ITooltipServiceWrapper } from "powerbi-visuals-utils-tooltiputils";

export interface IVisualComponentConstructorOptions extends IVisualComponentBaseConstructorOptions {
    eventDispatcher?: Dispatch<object>; // TODO
    id?: number | string;
    scaleService?: ScaleService;
    colorPalette?: IColorPalette;
    getSettings?: () => Settings;
    tooltipServiceWrapper?: ITooltipServiceWrapper;
}
