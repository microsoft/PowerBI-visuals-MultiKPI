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

import powerbiVisualsApi from "powerbi-visuals-api";

import { BaseContainerComponent } from "../baseContainerComponent";
import { ISparklineComponentRenderOptions } from "./sparklineComponent";

import { IVisualComponent } from "../visualComponent";

import { IVisualComponentConstructorOptions } from "../visualComponentConstructorOptions";
import { SvgComponent } from "./svgComponent";

export class PlotComponent
    extends BaseContainerComponent<IVisualComponentConstructorOptions, ISparklineComponentRenderOptions, ISparklineComponentRenderOptions> {
    constructor(options: IVisualComponentConstructorOptions) {
        super();

        this.initElement(
            options.element,
            "plot",
        );

        this.constructorOptions = {
            ...options,
            element: this.element,
        };

        this.components = [
            new SvgComponent(this.constructorOptions),
        ];
    }

    public render(options: ISparklineComponentRenderOptions): void {
        const { viewport } = options;

        this.updateSize(viewport.width, viewport.height);

        const componentViewport: powerbiVisualsApi.IViewport = { ...viewport };

        this.forEach(
            this.components,
            (component: IVisualComponent<ISparklineComponentRenderOptions>) => {
                component.render({
                    ...options,
                    viewport: { ...componentViewport },
                });

                const margins: powerbiVisualsApi.IViewport = component.getViewport();

                componentViewport.height -= margins.height;
            },
        );
    }
}
