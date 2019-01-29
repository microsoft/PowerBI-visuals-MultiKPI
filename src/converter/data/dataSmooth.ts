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

import { IConverter } from "../converter";
import { IDataRepresentationPoint } from "../data/dataRepresentation";

export interface ISmoothConstructorOptions {
    bandwidth?: number;
    robustnessIters?: number;
    accuracy?: number;
}

export class SmoothDataConverter implements IConverter<IDataRepresentationPoint[], IDataRepresentationPoint[]> {
    private bandwidth: number = 0.1;
    private robustnessIters: number = 2;
    private accuracy: number = 1e-12;

    constructor(options?: ISmoothConstructorOptions) {
        if (options) {
            this.bandwidth = options.bandwidth || this.bandwidth;
            this.robustnessIters = options.robustnessIters || this.robustnessIters;
            this.accuracy = options.accuracy || this.accuracy;
        }
    }

    public convert(points: IDataRepresentationPoint[]): IDataRepresentationPoint[] {
        const length = points.length;

        const bandwidthInPoints = Math.floor(this.bandwidth * length);

        const resultPoints: IDataRepresentationPoint[] = [];
        const residuals: number[] = [];
        const robustnessWeights: number[] = [];

        for (let i: number = 0; i < length; i++) {
            residuals[i] = 0;
            robustnessWeights[i] = 1;
        }

        let w: number;

        for (let iter: number = 0; iter < this.robustnessIters; iter++) {
            const bandwidthInterval: number[] = [0, bandwidthInPoints - 1];

            for (let i: number = 0; i < length; i++) {
                const x: number = points[i].x.getTime();

                if (i > 0) {
                    this.science_stats_loessUpdateBandwidthInterval(points, i, bandwidthInterval);
                }

                const ileft: number = bandwidthInterval[0];
                const iright: number = bandwidthInterval[1];

                if (!isNaN(ileft)
                    && !isNaN(iright)
                    && ileft !== iright
                    && ileft >= 0
                    && iright >= 0
                ) {
                    const edge: number = (points[i].x.getTime() - points[ileft].x.getTime())
                        > (points[iright].x.getTime() - points[i].x.getTime())
                        ? ileft
                        : iright;

                    let sumWeights: number = 0;
                    let sumX: number = 0;
                    let sumXSquared: number = 0;
                    let sumY: number = 0;
                    let sumXY: number = 0;

                    const denom: number = Math.abs(1 / (points[edge].x.getTime() - x));

                    for (let k: number = ileft; k <= iright; ++k) {
                        const xk: number = points[k].x.getTime();
                        const yk: number = points[k].y;
                        const dist: number = k < i ? x - xk : xk - x;

                        w = this.science_stats_loessTricube(dist * denom) * robustnessWeights[k];

                        const xkw: number = xk * w;

                        sumWeights += w;
                        sumX += xkw;
                        sumXSquared += xk * xkw;
                        sumY += yk * w;
                        sumXY += yk * xkw;
                    }

                    const meanX: number = sumX / sumWeights;
                    const meanY: number = sumY / sumWeights;
                    const meanXY: number = sumXY / sumWeights;
                    const meanXSquared: number = sumXSquared / sumWeights;

                    const beta: number = (Math.sqrt(Math.abs(meanXSquared - meanX * meanX)) < this.accuracy)
                        ? 0 : ((meanXY - meanX * meanY) / (meanXSquared - meanX * meanX));

                    const alpha: number = meanY - beta * meanX;

                    if (!isNaN(beta) && !isNaN(alpha)) {
                        resultPoints[i] = {
                            ...points[i],
                            y: beta * x + alpha,
                        };
                    } else {
                        resultPoints[i] = { ...points[i] };
                    }

                    residuals[i] = Math.abs(points[i].y - resultPoints[i].y);
                } else {
                    resultPoints[i] = { ...points[i] };
                }
            }

            if (iter === this.robustnessIters) {
                break;
            }

            const sortedResiduals: number[] = residuals
                .slice()
                .sort();

            const medianResidual: number = sortedResiduals[Math.floor(length / 2)];

            if (Math.abs(medianResidual) < this.accuracy) {
                break;
            }

            for (let i: number = 0; i < length; i++) {
                const arg: number = residuals[i] / (6 * medianResidual);
                robustnessWeights[i] = (arg >= 1) ? 0 : ((w = 1 - arg * arg) * w);
            }
        }

        return resultPoints;
    }

    /**
     * Computes the tricube weight function.
     * https://en.wikipedia.org/wiki/Local_regression#Weight_function
     */
    private science_stats_loessTricube(x) {
        return (x = 1 - x * x * x) * x * x;
    }

    private science_stats_loessUpdateBandwidthInterval(
        points: IDataRepresentationPoint[],
        i: number,
        bandwidthInterval: number[],
    ) {
        const left: number = bandwidthInterval[0];
        const right: number = bandwidthInterval[1];

        const nextRight: number = right + 1;

        if ((nextRight < points.length)
            && (points[nextRight].x.getTime() - points[i].x.getTime())
            < (points[i].x.getTime() - points[left].x.getTime())
        ) {

            const nextLeft: number = left + 1;

            bandwidthInterval[0] = nextLeft;
            bandwidthInterval[1] = nextRight;
        }
    }
}
