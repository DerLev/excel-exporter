const pad = (n: number) => `${Math.floor(Math.abs(n))}`.padStart(2, "0")

const getTimezoneOffset = (date: Date) => {
  const tzOffset = -date.getTimezoneOffset()
  const diff = tzOffset >= 0 ? "+" : "-"
  return diff + pad(tzOffset / 60) + ":" + pad(tzOffset % 60)
}

/**
 * Converts a date object into an ISO string with timezone data
 * @param date Date to be converted
 * @returns Date as an ISO string with TZData
 */
const toISOStringWithTimezone = (date: Date) => {
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds()) +
    getTimezoneOffset(date)
  )
}

export default toISOStringWithTimezone
