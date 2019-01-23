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

export interface SubtitleComponentRenderOptions {
    settings: SubtitleDescriptor;
}

export class SubtitleComponent extends BaseComponent<VisualComponentConstructorOptions, SubtitleComponentRenderOptions> {
    private className: string = "subtitleComponent";

    protected subtitleSelector: ClassAndSelector = this.getSelectorWithPrefix("subtitle");

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

    public render(options: SubtitleComponentRenderOptions): void {
        const { settings } = options;

        if (settings.shouldBeShown()) {
            this.show();
            this.renderComponent(settings);
        } else {
            this.hide();
        }
    }

    private renderComponent(settings: SubtitleDescriptor): void {
        const subtitleSelection: D3.UpdateSelection = this.element
            .selectAll(this.subtitleSelector.selector)
            .data(settings.shouldBeShown() ? [[]] : []);

        subtitleSelection
            .enter()
            .append("div")
            .classed(this.subtitleSelector.class, true);

        subtitleSelection
            .text(settings.titleText)
            .style("text-align", settings.alignment);

        this.updateFormatting(this.element, settings);

        this.element.style({
            "background-color": settings.background,
            "padding-top": settings.paddingTop ?
                PixelConverter.toString(settings.paddingTop)
                : null,
            "padding-bottom": settings.paddingBottom
                ? PixelConverter.toString(settings.paddingBottom)
                : null,
        });

        subtitleSelection
            .exit()
            .remove();
    }

    public getViewport(): IViewport {
        const height: number = this.element && this.isShown
            ? $(this.element.node()).height()
            : 0;

        return {
            height,
            width: this.width,
        };
    }
}
