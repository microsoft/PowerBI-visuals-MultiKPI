/*
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

import "../styles/styles.less";

import powerbiVisualsApi from "powerbi-visuals-api";

import { dispatch, Dispatch } from "d3-dispatch";
import { select as d3Select } from "d3-selection";

import { DataConverter } from "./converter/data/dataConverter";

import { EventName } from "./event/eventName";

import { SeriesSettings } from "./settings/seriesSettings";
import { Settings } from "./settings/settings";

import { DataOrderConverter } from "./converter/data/dataOrderConverter";
import { DataOrderConverterWithDuplicates } from "./converter/data/dataOrderConverterWithDuplicates";

import { IDataRepresentation } from "./converter/data/dataRepresentation";

import { RootComponent } from "./visualComponent/rootComponent";
import { IVisualComponent } from "./visualComponent/visualComponent";
import { IVisualComponentRenderOptions } from "./visualComponent/visualComponentRenderOptions";

import { ScaleService } from "./services/scaleService";

// powerbi.extensibility.utils.tooltip
import { ITooltipServiceWrapper, TooltipServiceWrapper } from "powerbi-visuals-utils-tooltiputils";

export class MultiKpi implements powerbiVisualsApi.extensibility.visual.IVisual {
    private dataConverter: DataConverter;

    private minViewport: powerbiVisualsApi.IViewport = {
        height: 95,
        width: 200,
    };

    private dataRepresentation: IDataRepresentation;
    private settings: Settings;
    private viewport: powerbiVisualsApi.IViewport;
    private eventDispatcher: Dispatch<any> = dispatch(...Object.keys(EventName));
    private tooltipServiceWrapper: ITooltipServiceWrapper;
    private host: powerbiVisualsApi.extensibility.visual.IVisualHost;

    public rootComponent: IVisualComponent<IVisualComponentRenderOptions>;

    constructor(options: powerbiVisualsApi.extensibility.visual.VisualConstructorOptions) {
        if (window.location !== window.parent.location) {
            require("core-js/stable");
        }

        const {
            element,
            host,
        } = options;

        this.host = host;

        this.tooltipServiceWrapper = new TooltipServiceWrapper(
            {
                handleTouchDelay: 0,
                rootElement: options.element,
                tooltipService: host.tooltipService,
            });

        this.dataConverter = new DataConverter({
            createSelectionIdBuilder: host.createSelectionIdBuilder.bind(host),
        });

        this.eventDispatcher.on(
            EventName.onChartChange,
            this.onChartChange.bind(this),
        );

        this.eventDispatcher.on(
            EventName.onChartViewChange,
            this.onChartViewChange.bind(this),
        );

        this.eventDispatcher.on(
            EventName.onChartViewReset,
            () => this.render(this.dataRepresentation, this.settings, this.viewport),
        );

        this.rootComponent = new RootComponent({
            element: d3Select(element),
            eventDispatcher: this.eventDispatcher,
            scaleService: new ScaleService(element),
            style: host.colorPalette,
            tooltipServiceWrapper: this.tooltipServiceWrapper,
        });
    }

    public update(options: powerbiVisualsApi.extensibility.visual.VisualUpdateOptions) {
        if (!this.dataConverter || !this.rootComponent) {
            return;
        }

        try {
            this.host.eventService.renderingStarted(options);

            const dataView: powerbiVisualsApi.DataView = options
                && options.dataViews
                && options.dataViews[0];

            this.viewport = this.getViewport(options && options.viewport);

            this.settings = <Settings>(Settings.PARSE_SETTINGS(dataView));

            this.dataRepresentation = this.dataConverter.convert({
                dataView,
                settings: this.settings,
                viewport: this.viewport,
            });

            this.render(
                this.dataRepresentation,
                this.settings,
                this.viewport,
            );
        } catch (ex) {
            this.host.eventService.renderingFailed(options, JSON.stringify(ex));
        }
        this.host.eventService.renderingFinished(options);
    }

    public enumerateObjectInstances(options: powerbiVisualsApi.EnumerateVisualObjectInstancesOptions): powerbiVisualsApi.VisualObjectInstanceEnumeration {
        if (!this.settings) {
            return [];
        }

        const { objectName } = options;

        const shouldUseContainers: boolean = Object.keys(new SeriesSettings()).indexOf(objectName) !== -1;

        if (!shouldUseContainers) {
            return this.settings.enumerateObjectInstances(options);
        }

        const enumerationObject: powerbiVisualsApi.VisualObjectInstanceEnumerationObject
            = this.settings.enumerateObjectInstancesWithSelectionId(
                options,
                "[All]",
                null,
            );

        for (const series of this.dataRepresentation.sortedSeries) {
            if (series && series.settings) {
                series.settings.enumerateObjectInstancesWithSelectionId(
                    options,
                    series.name,
                    series.selectionId,
                    enumerationObject,
                );
            }
        }

        return enumerationObject;
    }

    private render(
        data: IDataRepresentation,
        settings: Settings,
        viewport: powerbiVisualsApi.IViewport,
    ): void {
        this.rootComponent.render({
            data,
            settings,
            viewport,
        });
    }

    private getViewport(currentViewport: powerbiVisualsApi.IViewport): powerbiVisualsApi.IViewport {
        if (!currentViewport) {
            return { ...this.minViewport };
        }

        return {
            height: Math.max(this.minViewport.height, currentViewport.height),
            width: Math.max(this.minViewport.width, currentViewport.width),
        };
    }

    private onChartChange(name: string): void {
        const dataOrderConverter: DataOrderConverter = new DataOrderConverter();

        this.dataRepresentation = dataOrderConverter.convert({
            data: this.dataRepresentation,
            firstSeriesName: name,
        });

        this.render(
            this.dataRepresentation,
            this.settings,
            this.viewport,
        );
    }

    private onChartViewChange(name: string): void {
        const dataOrderConverter: DataOrderConverterWithDuplicates = new DataOrderConverterWithDuplicates();

        const dataRepresentation: IDataRepresentation = dataOrderConverter.convert({
            data: this.dataRepresentation,
            firstSeriesName: name,
        });

        this.render(
            dataRepresentation,
            this.settings,
            this.viewport,
        );
    }
}
