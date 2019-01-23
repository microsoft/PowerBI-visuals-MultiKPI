import { valueFormatter } from "powerbi-visuals-utils-formattingutils";

import { NumericDescriptor } from "../../settings/descriptors/numericDescriptor";
import { VarianceChecker } from "../variance/varianceChecker";

export class DataFormatter {
    public static getFormattedVariance(variance: number): string {
        if (!VarianceChecker.isVarianceValid(variance)) {
            return "N/A";
        }

        return valueFormatter.valueFormatter
            .create({
                format: "+0.00%;-0.00%;0.00%",
                precision: 2,
                value: variance,
            })
            .format(variance);
    }

    public static getFormattedDate(date: Date, format: string = valueFormatter.valueFormatter.DefaultDateFormat): string {
        return valueFormatter.valueFormatter
            .create({ format })
            .format(date);
    }

    public static getFormattedValue(value: number, settings: NumericDescriptor): string {
        return this.getValueFormatter(value, settings).format(value);
    }

    public static getValueFormatter(value: number, settings: NumericDescriptor): valueFormatter.IValueFormatter {
        return valueFormatter.valueFormatter.create({
            displayUnitSystemType: 2,
            format: settings.getFormat(),
            precision: settings.precision,
            value: settings.displayUnits || value,
        });
    }
}
