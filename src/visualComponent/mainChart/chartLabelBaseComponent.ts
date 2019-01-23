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

export interface RenderGroup {
    data: string;
    isShown: boolean;
    color?: string;
    selector?: ClassAndSelector;
    fontSizeInPt?: number;
}

export abstract class ChartLabelBaseComponent<RenderOptions> extends BaseComponent<VisualComponentConstructorOptions, RenderOptions> {
    private className: string = "chartLabelBaseComponent";

    private itemSelector: ClassAndSelector = this.getSelectorWithPrefix(`${this.className}_items`);

    protected headerSelector: ClassAndSelector = this.getSelectorWithPrefix(`${this.className}_header`);
    protected bodySelector: ClassAndSelector = this.getSelectorWithPrefix(`${this.className}_body`);
    protected footerSelector: ClassAndSelector = this.getSelectorWithPrefix(`${this.className}_footer`);

    protected varianceNotAvailableSelector: ClassAndSelector = this.getSelectorWithPrefix(`${this.className}_body_variance_na`);

    constructor(options: VisualComponentConstructorOptions) {
        super();

        this.initElement(
            options.element,
            this.className
        );

        this.constructorOptions = {
            ...options,
            element: this.element
        };
    }

    protected renderGroup(
        selector: ClassAndSelector,
        data: RenderGroup[],
    ): void {
        const selection: D3.UpdateSelection = this.element
            .selectAll(selector.selector)
            .data([data]);

        selection
            .enter()
            .append("div")
            .classed(selector.class, true);

        const itemSelection: D3.UpdateSelection = selection
            .selectAll(this.itemSelector.selector)
            .data((data: RenderGroup[]) => {
                return data.filter((renderGroup: RenderGroup) => {
                    return renderGroup && renderGroup.isShown;
                });
            });

        itemSelection
            .enter()
            .append("div");

        itemSelection
            .attr("class", (data: RenderGroup) => {
                const baseSelector: string = this.itemSelector.class;

                return data.selector
                    ? `${baseSelector} ${data.selector.class}`
                    : baseSelector;
            })
            .text((data: RenderGroup) => data.data)
            .style({
                "color": (data: RenderGroup) => data.color,
                "font-size": (data: RenderGroup) => {
                    if (!data.fontSizeInPt || isNaN(data.fontSizeInPt)) {
                        return null;
                    }

                    const fontSizeInPx: number = PixelConverter.fromPointToPixel(data.fontSizeInPt);

                    return PixelConverter.toString(fontSizeInPx);
                },
            });

        itemSelection
            .exit()
            .remove();

        selection
            .exit()
            .remove();
    }
}
