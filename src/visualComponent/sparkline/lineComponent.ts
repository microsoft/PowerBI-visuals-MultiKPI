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

export interface LineComponentRenderOptions {
    viewport: IViewport;
    x: DataRepresentationAxis;
    y: DataRepresentationAxis;
    color: string;
    thickness: number;
    alternativeColor: string;
    points: DataRepresentationPoint[];
    type: DataRepresentationPointGradientType;
}

export interface LineComponentGradient {
    color: string;
    offset: string;
}

export class LineComponent extends BaseComponent<VisualComponentConstructorOptions, LineComponentRenderOptions> {
    private className: string = "lineComponent";
    private lineSelector: ClassAndSelector = this.getSelectorWithPrefix("line");

    private gradientId: string = `${this.className}_gradient${this.getId()}`;
    private gradientSelection: D3.Selection;

    constructor(options: VisualComponentConstructorOptions) {
        super();

        this.initElement(
            options.element,
            this.className,
            "g"
        );

        this.gradientSelection = this.element
            .append("defs")
            .append("linearGradient")
            .attr("id", this.gradientId);

        this.constructorOptions = {
            ...options,
            element: this.element,
        };

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onCurrentDataPointIndexChange}.${this.className}.${this.constructorOptions.id}`,
            this.onCurrentDataPointIndexChange.bind(this)
        );

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onCurrentDataPointIndexReset}.${this.className}.${this.constructorOptions.id}`,
            this.onCurrentDataPointIndexChange.bind(this)
        );
    }

    private onCurrentDataPointIndexChange(index: number): void {
        if (!this.renderOptions || !this.renderOptions.points) {
            return;
        }

        const point: DataRepresentationPoint = this.renderOptions.points[index];

        if (!point) {
            return;
        }

        const {
            color,
            viewport,
            alternativeColor,
        } = this.renderOptions;

        const xPosition: number = this.renderOptions.x.scale
            .copy()
            .range([0, viewport.width])
            .scale(point.x);

        const offset: number = xPosition / viewport.width * 100;
        const offsetInPercent: string = `${offset}%`;

        const gradients: LineComponentGradient[] = offset === 100
            ? [
                {
                    color,
                    offset: "100%"
                }
            ]
            : [
                {
                    color: alternativeColor,
                    offset: "0%"
                },
                {
                    color: alternativeColor,
                    offset: offsetInPercent,
                },
                {
                    color,
                    offset: offsetInPercent,
                },
                {
                    color,
                    offset: "100%",
                },
            ];

        this.updateGradient(gradients);
    }

    public render(options: LineComponentRenderOptions): void {
        this.renderOptions = options;

        this.renderComponent(this.renderOptions);
    }

    private renderComponent(options: LineComponentRenderOptions): void {
        const {
            x,
            y,
            viewport,
            color,
        } = options;

        this.updateGradient([{
            color,
            offset: "100%"
        }]);

        const xScale: DataRepresentationScale = x.scale
            .copy()
            .range([0, viewport.width]);

        const yScale: DataRepresentationScale = y.scale
            .copy()
            .range([viewport.height, 0]);

        const lineSelection: D3.UpdateSelection = this.element
            .selectAll(this.lineSelector.selector)
            .data([options]);

        lineSelection.enter()
            .append("svg:path")
            .classed(this.lineSelector.class, true);

        lineSelection
            .attr("d", (options: LineComponentRenderOptions) => {
                switch (options.type) {
                    case DataRepresentationPointGradientType.area: {
                        return this.getArea(xScale, yScale, viewport)(options.points);
                    }
                    case DataRepresentationPointGradientType.line:
                    default: {
                        return this.getLine(xScale, yScale)(options.points);
                    }
                }
            })
            .style({
                "stroke": (options: LineComponentRenderOptions) => {
                    switch (options.type) {
                        case DataRepresentationPointGradientType.area: {
                            return null;
                        }
                        case DataRepresentationPointGradientType.line:
                        default: {
                            return this.getGradientUrl();
                        }
                    }
                },
                "stroke-width": (options: LineComponentRenderOptions) => {
                    switch (options.type) {
                        case DataRepresentationPointGradientType.area: {
                            return null;
                        }
                        case DataRepresentationPointGradientType.line:
                        default: {
                            return PixelConverter.toString(options.thickness);
                        }
                    }
                },
                "fill": (options: LineComponentRenderOptions) => {
                    switch (options.type) {
                        case DataRepresentationPointGradientType.area: {
                            return this.getGradientUrl();
                        }
                        case DataRepresentationPointGradientType.line:
                        default: {
                            return null;
                        }
                    }
                },
            });

        lineSelection
            .exit()
            .remove();
    }

    private getLine(
        xScale: DataRepresentationScale,
        yScale: DataRepresentationScale,
    ): D3.Svg.Line {
        return d3.svg.line()
            .x((dataPoint: DataRepresentationPoint) => {
                return xScale.scale(dataPoint.x);
            })
            .y((dataPoint: DataRepresentationPoint) => {
                return yScale.scale(dataPoint.y);
            });
    }

    private getArea(
        xScale: DataRepresentationScale,
        yScale: DataRepresentationScale,
        viewport: IViewport,
    ): D3.Svg.Area {
        return d3.svg.area()
            .x((dataPoint: DataRepresentationPoint) => {
                return xScale.scale(dataPoint.x);
            })
            .y0(viewport.height)
            .y1((dataPoint: DataRepresentationPoint) => {
                return yScale.scale(dataPoint.y);
            });
    }

    public destroy(): void {
        this.gradientSelection.remove();
        this.gradientSelection = null;

        super.destroy();
    }

    private getGradientUrl(): string {
        const href: string = window.location.href;

        return `url(${href}#${this.gradientId})`;
    }

    private updateGradient(gradients: LineComponentGradient[]): void {
        if (!this.gradientSelection) {
            return;
        }

        const stopSelection: D3.UpdateSelection = this.gradientSelection
            .selectAll("stop")
            .data(gradients);

        stopSelection
            .enter()
            .append("stop");

        stopSelection
            .attr("offset", (gradient: LineComponentGradient) => gradient.offset)
            .style({
                "stop-color": (gradient: LineComponentGradient) => gradient.color,
                "stop-opacity": 1
            });

        stopSelection
            .exit()
            .remove();
    }

    private getId(): string {
        const crypto: Crypto = window.crypto || (window as any).msCrypto;
        const generatedIds: Uint32Array = new Uint32Array(2);

        crypto.getRandomValues(generatedIds);

        let concatenatedGeneratedId: string = "";

        /**
         * IE11 does not support Array method for Uint32Array
         * This is why we use for loop
         */

        // tslint:disable:prefer-for-of
        for (let index: number = 0; index < generatedIds.length; index++) {
            concatenatedGeneratedId += `${generatedIds[index]}`;
        }
        // tslint:enable:prefer-for-of

        return concatenatedGeneratedId;
    }
}

