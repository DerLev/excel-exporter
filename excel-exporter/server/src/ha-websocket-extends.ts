import { Auth, type Connection } from "home-assistant-js-websocket"
import toISOStringWithTimezone from "./toISOStringWithTimezone.js"

/**
 * Fixes the websocket URL for Addons
 */
export class AddonAuth extends Auth {
  get wsUrl() {
    // Convert from http:// -> ws://, https:// -> wss://
    return `ws${this.data.hassUrl.substring(4)}`
  }
}

type RecorderPeriods = "5minute" | "hour" | "day" | "week" | "month"
type RecorderTypes =
  | "change"
  | "last_reset"
  | "max"
  | "mean"
  | "min"
  | "state"
  | "sum"

type RecorderStatisticsDuringPeriodReturn = {
  [key: string]: {
    start: number
    end: number
    state: boolean | string | number
    last_reset: number
    max: number
    mean: number
    min: number
    sum: number
  }[]
}

/**
 * Get statistics from the recorder in Home Assistant (short-term and long-term data)
 * @param connection Websocket connection object
 * @param startTime Start of the data to be returned
 * @param endTime End of the data to be returned
 * @param period Amount of time one data block merges together
 * @param entityIds Entity IDs to get the data from
 * @param types Types of data to be returned
 * @returns Connection message promise which returns the historical data for each selected entity
 */
export const getRecorderStatisticsDuringPeriod = (
  connection: Connection,
  startTime: Date,
  endTime: Date,
  period: RecorderPeriods,
  entityIds: string[],
  types: RecorderTypes[],
) => {
  return connection.sendMessagePromise<RecorderStatisticsDuringPeriodReturn>({
    type: "recorder/statistics_during_period",
    start_time: toISOStringWithTimezone(startTime),
    end_time: toISOStringWithTimezone(endTime),
    period,
    statistic_ids: entityIds,
    types,
  })
}
