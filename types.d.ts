import { type collection } from '@tada/api'
import { ServiceBridge } from './tada/src/electron/services/bridge.js'

// type Statistics = {
//     cpuUsage: number;
//     ramUsage: number;
//     storageData: number;
// }

// type StaticData = {
//     totalStorage: number;
//     cpuModel: string;
//     totalMemoryGB: number;
// }

type UnsubscribeFunction = () => void;

// type EventPayloadMapping = {
//     statistics: Statistics;
//     getStaticData: StaticData;
//     getMovable: boolean;
// }

declare global {
    interface Window {
        // system: ServiceBridge<systemCollection>
        api: ServiceBridge<collection>
    }
}