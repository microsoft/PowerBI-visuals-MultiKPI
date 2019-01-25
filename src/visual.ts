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

import "@babel/polyfill";

import "../styles/styles.less";

import powerbi from "powerbi-visuals-api";

import { ColorHelper } from "powerbi-visuals-utils-colorutils";

import { dispatch, Dispatch } from "d3-dispatch";
import { select as d3Select } from "d3-selection";

import { DataConverter } from "./converter/data/dataConverter";

import { EventName } from "./event/eventName";

import { SeriesSettings } from "./settings/seriesSettings";
import { Settings } from "./settings/settings";

import { BaseDescriptor } from "./settings/descriptors/baseDescriptor";

import { DataOrderConverter } from "./converter/data/dataOrderConverter";
import { DataOrderConverterWithDuplicates } from "./converter/data/dataOrderConverterWithDuplicates";

import {
    IDataRepresentation,
    IDataRepresentationSeries,
} from "./converter/data/dataRepresentation";

import { RootComponent } from "./visualComponent/rootComponent";
import { IVisualComponent } from "./visualComponent/visualComponent";
import { IVisualComponentRenderOptions } from "./visualComponent/visualComponentRenderOptions";

import { ScaleService } from "./services/scaleService";

export class MultiKpi implements powerbi.extensibility.visual.IVisual {
    private dataConverter: DataConverter;

    private minViewport: powerbi.IViewport = {
        height: 95,
        width: 200,
    };

    private dataRepresentation: IDataRepresentation;
    private settings: Settings;
    private viewport: powerbi.IViewport;

    private rootComponent: IVisualComponent<IVisualComponentRenderOptions>;

    private eventDispatcher: Dispatch<any> = dispatch(...Object.keys(EventName));

    constructor(options: powerbi.extensibility.visual.VisualConstructorOptions) {
        const {
            element,
            host,
        } = options;

        this.dataConverter = new DataConverter({
            colorPalette: null,
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
            this.render.bind(this),
        );

        this.rootComponent = new RootComponent({
            element: d3Select(element),
            eventDispatcher: this.eventDispatcher,
            scaleService: new ScaleService(element),
            style: host.colorPalette,
        });
    }

    public update(options: powerbi.extensibility.visual.VisualUpdateOptions) {
        if (!this.dataConverter || !this.rootComponent) {
            return;
        }

        const dataView: powerbi.DataView = options
            && options.dataViews
            && options.dataViews[0];

        this.viewport = this.getViewport(options && options.viewport);

        this.settings = Settings.parseSettings(dataView) as Settings;

        this.dataRepresentation = this.dataConverter.convert({
            dataView,
            settings: this.settings,
            viewport: this.viewport,
        });

        this.render();
    }

    public enumerateObjectInstances(options: powerbi.EnumerateVisualObjectInstancesOptions): powerbi.VisualObjectInstanceEnumeration {
        const { objectName } = options;

        const shouldUseContainers: boolean = Object.keys(new SeriesSettings()).indexOf(objectName) !== -1;

        if (!shouldUseContainers) {
            return Settings.enumerateObjectInstances(
                this.settings || Settings.getDefault(),
                options,
            );
        }

        const enumerationObject: powerbi.VisualObjectInstanceEnumerationObject = {
            containers: [],
            instances: [],
        };

        this.enumerateSettings(
            enumerationObject,
            options.objectName,
            this.getSettings.bind(this),
        );

        return enumerationObject;
    }

    private render(): void {
        this.rootComponent.render({
            data: this.dataRepresentation,
            settings: this.settings,
            viewport: this.viewport,
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

        this.rootComponent.render({
            data: this.dataRepresentation,
            settings: this.settings,
            viewport: this.viewport,
        });
    }

    private onChartViewChange(name: string): void {
        const dataOrderConverter: DataOrderConverterWithDuplicates = new DataOrderConverterWithDuplicates();

        const dataRepresentation: IDataRepresentation = dataOrderConverter.convert({
            data: this.dataRepresentation,
            firstSeriesName: name,
        });

        this.rootComponent.render({
            data: dataRepresentation,
            settings: this.settings,
            viewport: this.viewport,
        });
    }

    private enumerateSettings(
        enumerationObject: powerbi.VisualObjectInstanceEnumerationObject,
        objectName: string,
        getSettings: (settings: BaseDescriptor) => { [propertyName: string]: powerbi.DataViewPropertyValue },
    ): void {
        this.applySettings(
            objectName,
            "[All]",
            null,
            enumerationObject,
            getSettings(this.settings[objectName]));

        this.enumerateSettingsDeep(
            this.dataRepresentation.sortedSeries,
            objectName,
            enumerationObject,
            getSettings,
        );
    }

    private getSettings(settings: BaseDescriptor): { [propertyName: string]: powerbi.DataViewPropertyValue } {
        const properties: { [propertyName: string]: powerbi.DataViewPropertyValue; } = {};

        for (const descriptor in settings) {
            const value: any = settings.getValueByPropertyName(descriptor);

            const typeOfValue: string = typeof value;

            if (typeOfValue === "undefined"
                || value === null
                || typeOfValue === "number"
                || typeOfValue === "string"
                || typeOfValue === "boolean"
            ) {
                properties[descriptor] = value;
            }
        }

        return properties;
    }

    private applySettings(
        objectName: string,
        displayName: string,
        selector: powerbi.data.Selector,
        enumerationObject: powerbi.VisualObjectInstanceEnumerationObject,
        properties: { [propertyName: string]: powerbi.DataViewPropertyValue },
    ): void {
        const containerIdx: number = enumerationObject.containers.push({ displayName }) - 1;

        enumerationObject.instances.push({
            containerIdx,
            objectName,
            properties,
            selector,
        });
    }

    private enumerateSettingsDeep(
        seriesArray: IDataRepresentationSeries[],
        objectName: string,
        enumerationObject: powerbi.VisualObjectInstanceEnumerationObject,
        getSettings: (settings: BaseDescriptor) => { [propertyName: string]: powerbi.DataViewPropertyValue },
    ): void {
        for (const series of seriesArray) {
            const selector: powerbi.data.Selector = series.selectionId
                && (series.selectionId as powerbi.visuals.ISelectionId).getSelector();

            this.applySettings(
                objectName,
                series.name,
                ColorHelper.normalizeSelector(selector),
                enumerationObject,
                getSettings(series.settings[objectName]),
            );
        }
    }
}
