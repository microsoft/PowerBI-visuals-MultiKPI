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

import {
    dataViewObjects,
    dataViewObjectsParser,
} from "powerbi-visuals-utils-dataviewutils";

import { ColorHelper } from "powerbi-visuals-utils-colorutils";

import { IDescriptor } from "./descriptors/descriptor";

import { BaseDescriptor } from "./descriptors/baseDescriptor";

export class SettingsBase extends dataViewObjectsParser.DataViewObjectsParser {
    public static PARSE_SETTINGS(options: powerbiVisualsApi.DataView): SettingsBase {
        const settings: SettingsBase = this.parse<SettingsBase>(options);

        Object.keys(settings).forEach((descriptorName: string) => {
            if ((<IDescriptor>settings[descriptorName]).parse) {
                (<IDescriptor>settings[descriptorName]).parse();
            }
        });

        settings.parse();

        return settings;
    }

    public parse(): void {
        // This function is required to update settings once they are parsed from a data view object
    }

    public parseObjects(objects: powerbiVisualsApi.DataViewObjects): SettingsBase {
        if (objects) {
            const properties: dataViewObjectsParser.DataViewProperties = this.getProperties();

            for (const objectName of Object.keys(properties)) {
                for (const propertyName of Object.keys(properties[objectName])) {
                    const defaultValue: any = this[objectName][propertyName];

                    this[objectName][propertyName] = dataViewObjects.getCommonValue(
                        objects,
                        properties[objectName][propertyName],
                        defaultValue);
                }

                if ((<IDescriptor>this[objectName]).parse) {
                    (<IDescriptor>this[objectName]).parse();
                }
            }
        }

        this.parse();

        return this;
    }

    public enumerateObjectInstances(options: powerbiVisualsApi.EnumerateVisualObjectInstancesOptions): powerbiVisualsApi.VisualObjectInstanceEnumerationObject {
        const enumerationObject: powerbiVisualsApi.VisualObjectInstanceEnumerationObject = {
            containers: [],
            instances: [],
        };

        if (this.areOptionsValid(options)) {
            const { objectName } = options;

            this.addSettingsToInstances(
                objectName,
                enumerationObject,
                this.getSettings(this[objectName]),
            );
        }

        return enumerationObject;
    }

    public enumerateObjectInstancesWithSelectionId(
        options: powerbiVisualsApi.EnumerateVisualObjectInstancesOptions,
        displayName: string,
        selectionId: powerbiVisualsApi.visuals.ISelectionId,
        enumerationObject: powerbiVisualsApi.VisualObjectInstanceEnumerationObject = {
            containers: [],
            instances: [],
        },
    ): powerbiVisualsApi.VisualObjectInstanceEnumerationObject {
        if (this.areOptionsValid(options)) {
            const { objectName } = options;

            const selector: powerbiVisualsApi.data.Selector = selectionId && selectionId.getSelector();

            this.addSettingsToContainer(
                objectName,
                displayName,
                ColorHelper.normalizeSelector(selector),
                enumerationObject,
                this.getSettings(this[objectName]),
            );
        }

        return enumerationObject;
    }

    private areOptionsValid(options: powerbiVisualsApi.EnumerateVisualObjectInstancesOptions): boolean {
        return !!(options
            && options.objectName
            && this[options.objectName]
        );
    }

    private getSettings(settings: BaseDescriptor): { [propertyName: string]: powerbiVisualsApi.DataViewPropertyValue } {
        const properties: { [propertyName: string]: powerbiVisualsApi.DataViewPropertyValue; } = {};

        for (const descriptor of Object.keys(settings)) {
            const value: any = settings.getValueByPropertyName
                ? settings.getValueByPropertyName(descriptor)
                : settings[descriptor];

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

    private addSettingsToContainer(
        objectName: string,
        displayName: string,
        selector: powerbiVisualsApi.data.Selector,
        enumerationObject: powerbiVisualsApi.VisualObjectInstanceEnumerationObject,
        properties: { [propertyName: string]: powerbiVisualsApi.DataViewPropertyValue },
    ): void {
        const containerIdx: number = enumerationObject.containers.push({ displayName }) - 1;

        this.addSettingsToInstances(
            objectName,
            enumerationObject,
            properties,
            selector,
            containerIdx,
        );
    }

    private addSettingsToInstances(
        objectName: string,
        enumerationObject: powerbiVisualsApi.VisualObjectInstanceEnumerationObject,
        properties: { [propertyName: string]: powerbiVisualsApi.DataViewPropertyValue },
        selector: powerbiVisualsApi.data.Selector = null,
        containerIdx?: number,
    ): void {
        const instance: powerbiVisualsApi.VisualObjectInstance = {
            objectName,
            properties,
            selector,
        };

        if (containerIdx != null) {
            instance.containerIdx = containerIdx;
        }

        enumerationObject.instances.push(instance);
    }
}
