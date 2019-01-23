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

export class MultiKpi implements powerbi.extensibility.visual.IVisual {
    private dataConverter: DataConverter = new DataConverter();

    private minViewport: IViewport = {
        height: 95,
        width: 200,
    };

    private dataRepresentation: DataRepresentation;
    private settings: Settings;
    private viewport: IViewport;

    private rootComponent: VisualComponent<VisualComponentRenderOptions>;

    private eventDispatcher: D3.Dispatch = d3.dispatch(...Object.keys(EventName));

    public init(options: VisualInitOptions): void {
        this.eventDispatcher.on(
            EventName.onChartChange,
            this.onChartChange.bind(this)
        );

        this.eventDispatcher.on(
            EventName.onChartViewChange,
            this.onChartViewChange.bind(this)
        );

        this.eventDispatcher.on(
            EventName.onChartViewReset,
            this.render.bind(this)
        );

        const element: HTMLElement = options.element.get(0);

        this.rootComponent = new RootComponent({
            style: options.style,
            element: d3.select(element),
            eventDispatcher: this.eventDispatcher,
            scaleService: new ScaleService(element),
        });
    }

    private onChartChange(name: string): void {
        const dataOrderConverter: DataOrderConverter = new DataOrderConverter();

        this.dataRepresentation = dataOrderConverter.convert({
            data: this.dataRepresentation,
            firstSeriesName: name
        });

        this.rootComponent.render({
            data: this.dataRepresentation,
            settings: this.settings,
            viewport: this.viewport,
        });
    }

    private onChartViewChange(name: string): void {
        const dataOrderConverter: DataOrderConverterWithDuplicates = new DataOrderConverterWithDuplicates();

        const dataRepresentation: DataRepresentation = dataOrderConverter.convert({
            data: this.dataRepresentation,
            firstSeriesName: name
        });

        this.rootComponent.render({
            data: dataRepresentation,
            settings: this.settings,
            viewport: this.viewport,
        });
    }

    public update(options: VisualUpdateOptions) {
        if (!this.dataConverter || !this.rootComponent) {
            return;
        }

        const dataView: DataView = options && options.dataViews && options.dataViews[0];

        this.viewport = this.getViewport(options && options.viewport);

        this.settings = Settings.parseSettings(dataView) as Settings;

        this.dataRepresentation = this.dataConverter.convert({
            dataView,
            settings: this.settings,
            viewport: this.viewport,
        });

        this.render();
    }

    private render(): void {
        this.rootComponent.render({
            data: this.dataRepresentation,
            settings: this.settings,
            viewport: this.viewport,
        });
    }

    private getViewport(currentViewport: IViewport): IViewport {
        if (!currentViewport) {
            return { ...this.minViewport };
        }

        return {
            width: Math.max(this.minViewport.width, currentViewport.width),
            height: Math.max(this.minViewport.height, currentViewport.height),
        };
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        const { objectName } = options;

        const shouldUseContainers: boolean = Object.keys(new SeriesSettings()).indexOf(objectName) !== -1;

        if (!shouldUseContainers) {
            return Settings.enumerateObjectInstances(
                this.settings || Settings.getDefault(),
                options
            );
        }

        const enumerationBuilder: ObjectEnumerationBuilder = new ObjectEnumerationBuilder();

        this.enumerateSettings(
            enumerationBuilder,
            options.objectName,
            this.getSettings.bind(this)
        );

        return enumerationBuilder.complete();
    }

    private enumerateSettings(
        enumerationBuilder: ObjectEnumerationBuilder,
        objectName: string,
        getSettings: (settings: BaseDescriptor) => { [propertyName: string]: DataViewPropertyValue }
    ): void {
        this.applySettings(
            objectName,
            "[All]",
            null,
            enumerationBuilder,
            getSettings(this.settings[objectName]));

        this.enumerateSettingsDeep(
            this.dataRepresentation.sortedSeries,
            objectName,
            enumerationBuilder,
            getSettings
        );
    }

    private getSettings(settings: BaseDescriptor): { [propertyName: string]: DataViewPropertyValue } {
        const properties: { [propertyName: string]: DataViewPropertyValue; } = {};

        for (const descriptor in settings) {
            const value: any = settings.getValueByPropertyName(descriptor);

            const typeOfValue: string = typeof value;

            if (typeOfValue === "undefined"
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
        selector: Selector,
        enumerationBuilder: ObjectEnumerationBuilder,
        properties: { [propertyName: string]: DataViewPropertyValue }
    ): void {
        enumerationBuilder.pushContainer({ displayName });

        const instance: VisualObjectInstance = {
            selector,
            objectName,
            properties,
        };

        enumerationBuilder.pushInstance(instance);
        enumerationBuilder.popContainer();
    }

    private enumerateSettingsDeep(
        seriesArray: DataRepresentationSeries[],
        objectName: string,
        enumerationBuilder: ObjectEnumerationBuilder,
        getSettings: (settings: BaseDescriptor) => { [propertyName: string]: DataViewPropertyValue }
    ): void {
        for (let series of seriesArray) {
            this.applySettings(
                objectName,
                series.name,
                ColorHelper.normalizeSelector(series.selectionId.getSelector()),
                enumerationBuilder,
                getSettings(series.settings[objectName]));
        }
    }
}
