import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

const powerbiApiStub = fileURLToPath(new URL("./specs/powerbiApiStub.ts", import.meta.url));

export default defineConfig({
    test: {
        include: ["specs/**/*.spec.ts"],
        globals: true,
        alias: {
            "powerbi-visuals-api": powerbiApiStub
        },
        setupFiles: [powerbiApiStub],
        browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [
                { browser: "chromium" }
            ]
        },
        coverage: {
            provider: "v8",
            include: ["src/**/*.ts"],
            reporter: ["text", "html", "lcov"]
        }
    }
});
