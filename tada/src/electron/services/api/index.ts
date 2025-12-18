import { ServiceBridge } from '../bridge.js'
import system from './system.js'
import data from './data.js'

export const collection = {
  ...system,
  ...data,
}

export const api = ServiceBridge.createBridge<typeof collection>("api")
