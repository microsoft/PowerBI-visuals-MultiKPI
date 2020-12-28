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

import { mouse as d3Mouse } from "d3-selection";

import { BaseContainerComponent } from "./baseContainerComponent";

import { IVisualComponentConstructorOptions } from "./visualComponentConstructorOptions";

import { ISubtitleWarningComponentRenderOptions } from "./subtitleWarningComponent";
import { IVisualComponent } from "./visualComponent";
import { IVisualComponentRenderOptions } from "./visualComponentRenderOptions";

import { EventName } from "../event/eventName";

import { MainChartComponent } from "./mainChart/mainChartComponent";
import { SparklineGroupComponent } from "./sparkline/sparklineGroupComponent";
import { SubtitleWarningComponent } from "./subtitleWarningComponent";

import { ViewportSize } from "../converter/data/dataRepresentation";

export class RootComponent extends BaseContainerComponent<IVisualComponentConstructorOptions, IVisualComponentRenderOptions, any> {
    private className: string = "multiKpi";

    private printModeClassName: string = this.getClassNameWithPrefix("printMode");

    private mainChartComponent: IVisualComponent<IVisualComponentRenderOptions>;
    private sparklineGroupComponent: IVisualComponent<IVisualComponentRenderOptions>;
    private subtitleComponent: IVisualComponent<ISubtitleWarningComponentRenderOptions>;

    private isPrintModeActivated: boolean = false;

    private mainChartComponentViewport: powerbiVisualsApi.IViewport;

    private onChartChangeDelay: number = 300;
    private onChartChangeTimer: number = null;
    private currentChartName: string;
    private currentlyHoveringChartName: string;
    private startCoordinates: [number, number];

    constructor(options: IVisualComponentConstructorOptions) {
        super();

        this.initElement(options.element, this.className);
        this.bindPrintEvents();

        this.constructorOptions = {
            ...options,
            element: this.element,
        };

        this.mainChartComponent = new MainChartComponent(this.constructorOptions);
        this.sparklineGroupComponent = new SparklineGroupComponent(this.constructorOptions);
        this.subtitleComponent = new SubtitleWarningComponent(this.constructorOptions);

        this.components = [
            this.mainChartComponent,
            this.sparklineGroupComponent,
            this.subtitleComponent,
        ];

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onChartChangeClick}.${this.className}`,
            this.onChartChangeClickHandler.bind(this),
        );

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onChartChangeHover}.${this.className}`,
            this.onChartChangeHoverHandler.bind(this),
        );

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onChartChangeStop}.${this.className}`,
            this.clearHoverValues.bind(this),
        );

        this.element.on("mousemove", this.mousemoveHandler.bind(this));

        this.element.on(
            "mouseout",
            this.onChartViewReset.bind(this),
        );
        this.element.on(
            "mouseleave",
            this.onChartViewReset.bind(this),
        );
        this.element.on(
            "touchleave",
            this.onChartViewReset.bind(this),
        );
    }

    public render(options: IVisualComponentRenderOptions) {
        const previousViewportSize: ViewportSize = this.renderOptions
            && this.renderOptions.data
            && this.renderOptions.data.viewportSize;

        this.renderOptions = options;

        if (options
            && options.data
            && options.data.series
            && options.data.series.length
        ) {
            this.show();
            this.renderComponent(options);
        } else {
            this.hide();
        }

        this.updateFontSizeAccordingToViewportSize(
            options.data.viewportSize,
            previousViewportSize,
        );

        if (this.isExecutedInPhantomJs()) {
            this.turnOnPrintMode();
        } else {
            this.turnOffPrintMode();
        }
    }

    public destroy(): void {
        super.destroy();

        this.mainChartComponent = null;
        this.sparklineGroupComponent = null;
        this.subtitleComponent = null;
    }

    private mousemoveHandler(): void {
        const event: MouseEvent = require("d3").event;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (!this.startCoordinates) {
            return;
        }

        const coordinates: [number, number] = <[number, number]>d3Mouse(this.element.node());
        const delay: number = this.getOnChartChangeDelay(coordinates);

        if (delay) {
            this.clearOnChartChangeTimer();

            this.onChartChangeTimer = <number>(<unknown>setTimeout(
                this.applyCurrentlyHoveringChartName.bind(
                    this,
                    this.currentlyHoveringChartName,
                    coordinates,
                ),
                delay,
            ));
        } else {
            this.applyCurrentlyHoveringChartName(
                this.currentlyHoveringChartName,
                coordinates,
            );
        }
    }

    private getOnChartChangeDelay([x, y]): number {
        const scale: powerbiVisualsApi.IViewport = this.constructorOptions.scaleService.getScale();

        const scaledX: number = x / scale.width;
        const scaledY: number = y / scale.height;

        const isCursorInRegion: boolean = this.startCoordinates
            && this.mainChartComponentViewport
            && scaledY > this.mainChartComponentViewport.height
            && scaledX >= 0
            && scaledX < this.mainChartComponentViewport.width
            && y < this.startCoordinates[1];

        return isCursorInRegion
            ? this.onChartChangeDelay
            : 0;
    }

    private renderComponent(options: IVisualComponentRenderOptions): void {
        const {
            data,
            settings,
        } = options;
        this.subtitleComponent.render({
            series: data.series,
            staleDataDifference: data.staleDateDifference,
            staleDataSettings: settings.staleData,
            subtitleSettings: settings.subtitle,
            warningState: data.warningState,
            subtitle: data.subtitle,
        });

        const subtitleComponentHeight: number = this.subtitleComponent.getViewport().height;

        const viewportFactor: number = this.getViewportFactorByViewportSize(data.viewportSize);

        const viewport: powerbiVisualsApi.IViewport = {
            height: options.viewport.height / viewportFactor,
            width: options.viewport.width,
        };

        this.mainChartComponent.render({
            ...options,
            viewport,
        });

        this.mainChartComponentViewport = this.mainChartComponent.getViewport();

        const height: number = options.viewport.height
            - this.mainChartComponent.getViewport().height
            - subtitleComponentHeight;

        this.sparklineGroupComponent.render({
            ...options,
            data: {
                ...options.data,
                series: options.data.series.slice(1),
            },
            viewport: {
                height,
                width: options.viewport.width,
            },
        });
    }

    private getViewportFactorByViewportSize(viewportSize: ViewportSize): number {
        switch (viewportSize) {
            default: {
                return 2;
            }
        }
    }

    private updateFontSizeAccordingToViewportSize(
        viewportSize: ViewportSize,
        previousViewportSize: ViewportSize,
    ): void {
        if (previousViewportSize) {
            this.element.classed(this.getClassNameWithPrefix(previousViewportSize), false);
        }

        this.element.classed(this.getClassNameWithPrefix(viewportSize), true);
    }

    private turnOnPrintMode(): void {
        if (this.isPrintModeActivated
            || !this.renderOptions
            || !this.renderOptions.settings
            || !this.renderOptions.settings.printMode
            || !this.renderOptions.settings.printMode.show
        ) {
            return;
        }

        this.element.classed(this.printModeClassName, true);

        this.isPrintModeActivated = true;
    }

    private turnOffPrintMode(): void {
        if (!this.isPrintModeActivated) {
            return;
        }

        this.element.classed(this.printModeClassName, false);

        this.isPrintModeActivated = false;
    }

    private bindPrintEvents(): void {
        try {
            if (!window
                || !window.addEventListener
                || !("onbeforeprint" in <any>window)
                || !("onafterprint" in <any>window)
            ) {
                return;
            }

            window.addEventListener("beforeprint", this.turnOnPrintMode.bind(this));
            window.addEventListener("afterprint", this.turnOffPrintMode.bind(this));
        }
        catch (_) {
            // No need to handle this exception as CVs do not have any logger so far
        }
    }

    /**
     * We detect Phantom JS in order to detect PBI Snapshot Service
     * This is required to force Print Mode in Snapshot Service
     */
    private isExecutedInPhantomJs(): boolean {
        try {
            return /PhantomJS/.test(window.navigator.userAgent);
        } catch (_) {
            return false;
        }
    }

    private onChartChangeClickHandler(seriesName: string): void {
        this.clearOnChartChangeTimer();

        if (!this.constructorOptions
            || !this.constructorOptions.eventDispatcher
        ) {
            return;
        }

        this.constructorOptions.eventDispatcher.call(EventName.onChartChange, undefined, seriesName);
    }

    private onChartChangeHoverHandler(
        seriesName: string,
        coordinates: number[],
    ): void {
        const toggleSparklineOnHover: boolean = this.renderOptions
            && this.renderOptions.settings
            && this.renderOptions.settings.grid
            && this.renderOptions.settings.grid.toggleSparklineOnHover;

        if (!toggleSparklineOnHover) {
            return;
        }

        if (this.currentChartName === undefined && seriesName) {
            this.currentChartName = seriesName;
            this.currentlyHoveringChartName = undefined;

            this.startCoordinates = <[number, number]>(coordinates
                ? coordinates
                : d3Mouse(this.element.node()));

            if (!this.constructorOptions
                || !this.constructorOptions.eventDispatcher
            ) {
                return;
            }

            this.constructorOptions.eventDispatcher.call(EventName.onChartViewChange, undefined, seriesName);
        } else if (this.currentChartName && this.currentChartName !== seriesName) {
            this.currentlyHoveringChartName = seriesName;
        }
    }

    private clearOnChartChangeTimer(): void {
        if (!this.onChartChangeTimer) {
            return;
        }

        clearTimeout(this.onChartChangeTimer);

        this.onChartChangeTimer = null;
    }

    private applyCurrentlyHoveringChartName(currentlyHoveringChartName: string, positions: number[]): void {
        this.clearOnChartChangeTimer();

        if (currentlyHoveringChartName) {
            this.currentChartName = undefined;

            this.onChartChangeHoverHandler(
                currentlyHoveringChartName,
                <[number, number]>positions,
            );
        }
    }

    private onChartViewReset(): void {
        const event: MouseEvent = require("d3").event;

        if (event.target !== this.element.node()) {
            return;
        }

        this.clearHoverValues();

        this.constructorOptions.eventDispatcher.call(EventName.onChartViewReset);
    }

    private clearHoverValues(): void {
        this.clearOnChartChangeTimer();
        this.currentChartName = undefined;
        this.currentlyHoveringChartName = undefined;
        this.startCoordinates = null;
    }
}
