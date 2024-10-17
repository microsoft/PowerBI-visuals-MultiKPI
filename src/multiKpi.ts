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

import powerbi from "powerbi-visuals-api";

import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;

import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";

import { dispatch, Dispatch } from "d3-dispatch";
import { select as d3Select } from "d3-selection";

import { DataConverter } from "./converter/data/dataConverter";

import { EventName } from "./event/eventName";

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

export class MultiKpi implements powerbi.extensibility.visual.IVisual {
    private dataConverter: DataConverter;

    private minViewport: powerbi.IViewport = {
        height: 95,
        width: 200,
    };

    private dataRepresentation: IDataRepresentation;
    private localizationManager: ILocalizationManager;
    private settings: Settings;
    private formattingSettingsService: FormattingSettingsService;
    private viewport: powerbi.IViewport;
    private eventDispatcher: Dispatch<object> = dispatch(...Object.keys(EventName));
    private tooltipServiceWrapper: ITooltipServiceWrapper;
    private host: powerbi.extensibility.visual.IVisualHost;
    private selectionManager: ISelectionManager;

    public rootComponent: IVisualComponent<IVisualComponentRenderOptions>;

    constructor(options: powerbi.extensibility.visual.VisualConstructorOptions) {
        const {
            element,
            host,
        } = options;

        this.host = host;

        this.localizationManager = options.host.createLocalizationManager()
        this.formattingSettingsService = new FormattingSettingsService(this.localizationManager);

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

        this.selectionManager = this.host.createSelectionManager();

        const visualSelection = d3Select(element);
        visualSelection.on("contextmenu", (event: PointerEvent, dataPoint) => {
            this.selectionManager.showContextMenu(dataPoint ? dataPoint : {}, {
                x: event.clientX,
                y: event.clientY
            });
            event.preventDefault();
        });
    }

    public update(options: powerbi.extensibility.visual.VisualUpdateOptions) {
        if (!this.dataConverter || !this.rootComponent) {
            return;
        }

        try {
            this.host.eventService.renderingStarted(options);

            const dataView: powerbi.DataView = options?.dataViews?.[0];

            this.viewport = this.getViewport(options?.viewport);

            this.settings = this.formattingSettingsService.populateFormattingSettingsModel(Settings, options.dataViews[0]);
            this.settings.parse();

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

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        this.settings.updateFormatPropertyValue();
        this.settings.setLocalizedOptions(this.localizationManager);
        
        return this.formattingSettingsService.buildFormattingModel(this.settings);
    }    

    private render(
        data: IDataRepresentation,
        settings: Settings,
        viewport: powerbi.IViewport,
    ): void {
        this.rootComponent.render({
            data,
            settings,
            viewport,
        });
    }

    private getViewport(currentViewport: powerbi.IViewport): powerbi.IViewport {
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
