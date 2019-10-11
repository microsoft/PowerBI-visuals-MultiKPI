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

import powerbi from "powerbi-visuals-api";
import { getFormattedValueWithFallback } from "../../converter/data/dataFormatter";
import { IDataRepresentation, IDataRepresentationPoint, IDataRepresentationSeries, ViewportSize } from "../../converter/data/dataRepresentation";
import { EventName } from "../../event/eventName";
import { SubtitleDescriptor } from "../../settings/descriptors/subtitleDescriptor";
import { ValuesDescriptor } from "../../settings/descriptors/valuesDescriptor";
import { BaseContainerComponent } from "../baseContainerComponent";
import { ISubtitleComponentRenderOptions, SubtitleComponent } from "../subtitleComponent";
import { IVisualComponent } from "../visualComponent";
import { IVisualComponentConstructorOptions } from "../visualComponentConstructorOptions";
import { PlotComponent } from "./plotComponent";

export interface ISparklineComponentRenderOptions {
    series: IDataRepresentationSeries[];
    current: IDataRepresentationSeries;
    dataRepresentation: IDataRepresentation;
    viewport: powerbi.IViewport;
    position: number;
}

export class SparklineComponent extends BaseContainerComponent<IVisualComponentConstructorOptions, ISparklineComponentRenderOptions, any> {
    private className: string = "sparklineComponent";

    private topLabelComponent: IVisualComponent<ISubtitleComponentRenderOptions>;
    private plotComponent: IVisualComponent<any>;
    private bottomLabelComponent: IVisualComponent<ISubtitleComponentRenderOptions>;

    constructor(options: IVisualComponentConstructorOptions) {
        super();

        this.initElement(
            options.element,
            this.className,
        );

        this.constructorOptions = {
            ...options,
            element: this.element,
        };

        this.element.on("click", () => {
            const event: MouseEvent = require("d3").event;

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            this.constructorOptions.eventDispatcher.call(
                EventName.onChartChangeClick,
                undefined,
                this.renderOptions && this.renderOptions.current && this.renderOptions.current.name,
            );
        });

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onCurrentDataPointIndexChange}.${this.className}.${options.id}`,
            this.onCurrentDataPointIndexChange.bind(this),
        );

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onCurrentDataPointIndexReset}.${this.className}.${options.id}`,
            this.onCurrentDataPointIndexChange.bind(this),
        );
    }

    public initialize(): void {
        this.topLabelComponent = new SubtitleComponent(this.constructorOptions);
        this.plotComponent = new PlotComponent(this.constructorOptions);
        this.bottomLabelComponent = new SubtitleComponent(this.constructorOptions);

        this.components = [
            this.topLabelComponent,
            this.plotComponent,
            this.bottomLabelComponent,
        ];
    }

    public render(options: ISparklineComponentRenderOptions) {
        this.renderOptions = options;

        const {
            current,
            series,
            viewport,
            position,
        } = this.renderOptions;

        this.updateSize(viewport.width, viewport.height);

        this.updateElementOrder(this.element, position);

        if (current && series) {
            if (!this.components.length) {
                this.initialize();
            }
            this.renderComponent(this.renderOptions);

            const tooltipText: string = current && current.formattedTooltip || null;

            this.constructorOptions.tooltipServiceWrapper.addTooltip(
                this.element,
                () => {
                    if (tooltipText) {
                        return [{
                            displayName: null,
                            value: tooltipText,
                        }];
                    }
                });

        } else {
            this.destroyComponents();
        }
    }

    public renderComponent(options: ISparklineComponentRenderOptions) {
        const {
            current,
            dataRepresentation: {
                viewportSize,
            },
        } = options;

        this.renderOptions = options;

        this.renderTopLabel(current.name, viewportSize, current.settings.sparklineLabel);
        this.renderBottomLabel(
            current.current ? current.current.y : NaN,
            viewportSize,
            current.settings.sparklineValue,
            current.settings.values);
        this.renderPlot(options);
    }

    public destroy(): void {
        super.destroy();

        this.topLabelComponent = null;
        this.plotComponent = null;
        this.bottomLabelComponent = null;

        this.components = [];
    }

    private onCurrentDataPointIndexChange(index: number): void {
        const current: IDataRepresentationPoint = this.renderOptions
            && this.renderOptions.current
            && this.renderOptions.current.points
            && this.renderOptions.current.points[index];

        const sparklineValue: SubtitleDescriptor = this.renderOptions
            && this.renderOptions.current
            && this.renderOptions.current.settings
            && this.renderOptions.current.settings.sparklineValue;

        const viewportSize: ViewportSize = this.renderOptions
            && this.renderOptions.dataRepresentation
            && this.renderOptions.dataRepresentation.viewportSize;

        const valuesSettings: ValuesDescriptor = this.renderOptions
            && this.renderOptions.current
            && this.renderOptions.current.settings
            && this.renderOptions.current.settings.values;

        if (current && sparklineValue) {
            setTimeout(this.renderBottomLabel.bind(this, current.y, viewportSize, sparklineValue, valuesSettings));
        }
    }

    private renderTopLabel(
        name: string,
        viewportSize: ViewportSize,
        settings: SubtitleDescriptor,
    ): void {
        const fontSize: number = this.getFontSizeByViewportSize(viewportSize);

        settings.titleText = name;
        settings.autoFontSizeValue = fontSize;

        this.topLabelComponent.render({ subtitleSettings: settings });
    }

    private renderBottomLabel(
        value: number,
        viewportSize: ViewportSize,
        subtitleSettings: SubtitleDescriptor,
        valueSettings: ValuesDescriptor,
    ): void {
        const fontSize: number = this.getFontSizeByViewportSize(viewportSize);
        const actualValueKPIFontSize: number = fontSize * this.getActualValueKPIFactorByViewportSize(viewportSize);

        subtitleSettings.titleText = getFormattedValueWithFallback(value, valueSettings);
        subtitleSettings.autoFontSizeValue = actualValueKPIFontSize;

        this.bottomLabelComponent.render({ subtitleSettings });
    }

    private renderPlot(options: ISparklineComponentRenderOptions): void {
        const plotComponentViewport: powerbi.IViewport = this.getReducedViewport(
            { ...options.viewport },
            [this.topLabelComponent, this.bottomLabelComponent],
        );

        this.plotComponent.render({
            ...options,
            viewport: plotComponentViewport,
        });
    }

    private getFontSizeByViewportSize(viewportSize: ViewportSize): number {
        switch (viewportSize) {
            case ViewportSize.tiny: {
                return 6;
            }
            case ViewportSize.small: {
                return 9;
            }
            case ViewportSize.normal: {
                return 14;
            }
            case ViewportSize.medium: {
                return 18;
            }
            case ViewportSize.big: {
                return 20;
            }
            case ViewportSize.big: {
                return 24;
            }
        }

        return 28;
    }

    private getActualValueKPIFactorByViewportSize(viewportSize: ViewportSize): number {
        switch (viewportSize) {
            case ViewportSize.tiny: {
                return 1;
            }
            default: {
                return 1.5;
            }
        }
    }

    private getReducedViewport(viewport: powerbi.IViewport, components: Array<IVisualComponent<any>>): powerbi.IViewport {
        return components.reduce<powerbi.IViewport>((
            previousViewport: powerbi.IViewport,
            component: IVisualComponent<any>,
        ): powerbi.IViewport => {
            const componentViewport: powerbi.IViewport = component.getViewport();

            return {
                height: previousViewport.height - componentViewport.height,
                width: previousViewport.width,
            };
        }, viewport);
    }

    private destroyComponents(): void {
        this.forEach(
            this.components.splice(0, this.components.length),
            (component: IVisualComponent<{}>) => {
                component.destroy();
            },
        );

        this.topLabelComponent = null;
        this.plotComponent = null;
        this.bottomLabelComponent = null;
    }
}
