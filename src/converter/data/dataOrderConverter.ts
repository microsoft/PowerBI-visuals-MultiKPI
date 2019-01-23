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

export interface DataOrderConverterOptions {
    data: DataRepresentation;
    firstSeriesName: string;
}

export class DataOrderConverter implements Converter<DataOrderConverterOptions, DataRepresentation> {
    public convert(options: DataOrderConverterOptions): DataRepresentation {
        const { data, firstSeriesName } = options;

        let selectedSeriesIndex: number = -1;

        const series: DataRepresentationSeries[] = data.series.map((
            series: DataRepresentationSeries,
            seriesIndex: number
        ) => {
            if (series.name === firstSeriesName) {
                selectedSeriesIndex = seriesIndex;
            }

            return series;
        });

        if (selectedSeriesIndex >= 0) {
            [series[0], series[selectedSeriesIndex]] = [series[selectedSeriesIndex], series[0]];
        }

        return {
            ...data,
            series,
        };
    }
}

export class DataOrderConverterWithDuplicates implements Converter<DataOrderConverterOptions, DataRepresentation> {
    public convert(options: DataOrderConverterOptions): DataRepresentation {
        const { data, firstSeriesName } = options;

        let selectedSeriesIndex: number = -1;

        const series: DataRepresentationSeries[] = data.series.map((
            series: DataRepresentationSeries,
            seriesIndex: number
        ) => {
            if (series.name === firstSeriesName) {
                selectedSeriesIndex = seriesIndex;
            }

            return series;
        });

        if (selectedSeriesIndex >= 0) {
            series[0] = series[selectedSeriesIndex];
        }

        return {
            ...data,
            series,
        };
    }
}

