
import { LayerType } from './LayerType.js';

export const LayerBucketMap = Object.freeze({
    [LayerType.BACKGROUND]: 'backgroundLayers',
    [LayerType.TILE]: 'mapLayers',
    [LayerType.EVENT]: 'eventLayers',
    [LayerType.UI]: 'UILayer'
});