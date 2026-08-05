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

// esbuild (used by Vite) cannot inline the ambient `const enum`s of powerbi-visuals-api,
// so their members must exist at runtime, both as a module and as the sandbox global `powerbi`.

const ValidatorType = {
    Min: 0,
    Max: 1,
    Required: 2,
};

const AlignmentGroupMode = {
    Horizonal: "horizontalAlignment",
    Vertical: "verticalAlignment",
};

// every FormattingComponent member holds a string equal to its own name
const FormattingComponent = new Proxy({}, {
    get: (_target: object, name: string | symbol) => name,
});

// fails loudly instead of silently yielding undefined when the code under test needs an unstubbed member
function failOnMissingMember<T extends object>(target: T, path: string): T {
    return new Proxy(target, {
        get: (object: T, name: string | symbol, receiver: unknown) => {
            if (typeof name === "symbol" || name in object) {
                return Reflect.get(object, name, receiver);
            }

            throw new Error(`powerbi-visuals-api stub is missing "${path}.${name}". Add it to specs/powerbiApiStub.ts.`);
        },
    });
}

const powerbiApiStub = failOnMissingMember({
    visuals: failOnMissingMember({
        AlignmentGroupMode,
        FormattingComponent,
        ValidatorType,
    }, "powerbi.visuals"),
}, "powerbi");

(globalThis as unknown as { powerbi: unknown }).powerbi = powerbiApiStub;

export default powerbiApiStub;
