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

// powerbi.extensibility.utils.dataview
export class SettingsBase extends DataViewObjectsParser {
    public static parseSettings(options: DataView): SettingsBase {
        const settings: SettingsBase = this.parse<SettingsBase>(options);

        Object.keys(settings).forEach((descriptorName: string) => {
            if ((settings[descriptorName] as Descriptor).parse) {
                (settings[descriptorName] as Descriptor).parse();
            }
        });

        return settings;
    }

    public parse(dataView: DataView): SettingsBase {
        return this.parseObjects(dataView
            && dataView.metadata
            && dataView.metadata.objects
        );
    }

    public parseObjects(objects: DataViewObjects): SettingsBase {
        if (objects) {
            let properties: DataViewProperties = this.getProperties();

            for (let objectName in properties) {
                for (let propertyName in properties[objectName]) {
                    const defaultValue: any = this[objectName][propertyName];

                    this[objectName][propertyName] = DataViewObjects.getCommonValue(
                        objects,
                        properties[objectName][propertyName],
                        defaultValue);
                }

                if ((this[objectName] as Descriptor).parse) {
                    (this[objectName] as Descriptor).parse();
                }
            }
        }

        return this as any;
    }
}
