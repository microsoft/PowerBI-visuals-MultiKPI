import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import Selector = powerbi.data.Selector;
import FormattingComponent = powerbi.visuals.FormattingComponent;

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsContainer = formattingSettings.Container;
import FormattingSettingsSlice = formattingSettings.Slice;
import FontControl = formattingSettings.FontControl;
import { ColorHelper } from "powerbi-visuals-utils-colorutils";

import { FormatDescriptor } from "../formatDescriptor";
import { BaseDescriptor } from "../baseDescriptor";

export type BaseContainerItemType = FormatDescriptor | BaseDescriptor;

export abstract class BaseContainerDescriptor<BaseContainerItem extends BaseContainerItemType> extends FormattingSettingsCard {
    protected abstract getNewContainerItem(defaultContainerItem?: BaseContainerItem): BaseContainerItem;
    
    public defaultContainerItem: BaseContainerItem = this.getNewContainerItem();

    public container: FormattingSettingsContainer = {
        displayNameKey: "Visual_ApplySettingsTo",
        containerItems: [this.defaultContainerItem]
    };

    public createContainerItem(dataPoint: DataViewMetadataColumn, selectionId: ISelectionId): BaseContainerItem {
        const { displayName, objects, format } = dataPoint;

        const newContainerItem: BaseContainerItem = this.getNewContainerItem(this.defaultContainerItem);
        newContainerItem.displayName = displayName;

        if ((newContainerItem as FormatDescriptor)?.setColumnFormat){
            (newContainerItem as FormatDescriptor).setColumnFormat(format);
        }

        const selector: Selector = ColorHelper.normalizeSelector(selectionId?.getSelector());
        newContainerItem.slices.forEach((slice: FormattingSettingsSlice) => {
            slice.setPropertiesValues(objects, this.name);
            this.setSliceSelector(slice, selector);
        })

        return newContainerItem;
    }

    public populateContainer(containerItem: BaseContainerItem){
        this.container.containerItems.push(containerItem);
    }

    public getCurrentContainer(containerName: string): BaseContainerItem {
        const currentContainer = this.container.containerItems.find(el => el.displayName === containerName);
        return (currentContainer as BaseContainerItem);
    }

    private setSliceSelector(slice: FormattingSettingsSlice, selector: Selector) {
        if (slice instanceof formattingSettings.CompositeSlice){
            if (slice.type === FormattingComponent.FontControl){
                const fontControlSlice: FontControl = slice as FontControl;
                fontControlSlice.fontFamily.selector = selector;
                fontControlSlice.fontSize.selector = selector;
            }
        }
        else {
            slice.selector = selector;
        }        
    }
}