import { serve } from "@hono/node-server"
import {
  type Auth,
  type Connection,
  createConnection,
  getStates,
} from "home-assistant-js-websocket"
import { Hono } from "hono"
import {
  AddonAuth,
  getRecorderStatisticsDuringPeriod,
} from "./ha-websocket-extends.js"
import { serveStatic } from "@hono/node-server/serve-static"
import { z } from "zod"
import { fromError } from "zod-validation-error"
import writeXlsxFile, { type Schema, type ValueType } from "write-excel-file"
import { stream } from "hono/streaming"

if (!process.env.SUPERVISOR_TOKEN?.length) {
  console.error("No SUPERVISOR_TOKEN provided! Exiting...")
  process.exit(1)
}

let connection: Connection

const app = new Hono()

app.use("*", serveStatic({ root: "public" }))

app.get("/api/entities", async (c) => {
  const states = await getStates(connection)

  const disallowedDomains = [
    "update",
    "automation",
    "conversation",
    "scene",
    "event",
  ]

  const res = states
    .map((item) => item.entity_id)
    .filter(
      (item) =>
        disallowedDomains.findIndex(
          (domain) => item.split(".")[0] === domain,
        ) === -1,
    )

  return c.json(res)
})

const exportSchema = z.object({
  entities: z.string().array().nonempty(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  period: z.enum(["5minute", "hour", "day", "week", "month"]),
  format: z.enum(["xlsx", "csv"]).default("xlsx"),
})

app.post("/api/export", async (c) => {
  const rawBody = await c.req.json()
  const { error, data: body } = exportSchema.safeParse(rawBody)
  if (error)
    return c.json(
      { code: 400, message: fromError(error, { prefix: null }).toString() },
      400,
    )

  const startDateTime = new Date(body.start)
  startDateTime.setMinutes(startDateTime.getMinutes() - 1)
  const endDateTime = new Date(body.end)
  endDateTime.setMinutes(endDateTime.getMinutes() - 1)

  const stats = await getRecorderStatisticsDuringPeriod(
    connection,
    startDateTime,
    endDateTime,
    body.period,
    body.entities,
    ["state"],
  )

  type Row = {
    timestamp: number
    [key: string]: unknown
  }
  const rows: Row[] = []

  for (const [key, value] of Object.entries(stats)) {
    value.forEach((state) => {
      const stateInRows = rows.findIndex((item) => item.timestamp === state.end)
      if (stateInRows === -1) {
        const obj: Row = { timestamp: state.end }
        obj[key] = state.state
        rows.push(obj)
      } else {
        rows[stateInRows][key] = state.state
      }
    })
  }

  const excelSchema: Schema<Row> = []

  for (const [key, value] of Object.entries(rows[0])) {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    let type: any = String
    switch (typeof value) {
      case "boolean":
        type = Boolean
        break
      case "number":
        type = Number
        break
    }
    if (key === "timestamp") type = Date

    const obj = {
      column: key,
      type: type,
      format: type === Date ? "yyyy-mm-dd hh:mm" : undefined,
      value: (row: Row) => row[key] as ValueType,
      width: 20,
    }

    excelSchema.push(obj)
  }

  const excelRows = rows
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((row) => ({
      ...row,
      timestamp: new Date(row.timestamp),
    }))

  if (body.format === "xlsx") {
    const fileStream = await writeXlsxFile(excelRows, {
      schema: excelSchema,
      stickyRowsCount: 1,
      sheet: "Home Assistant Statistics",
    })

    return stream(c, async (stream) => {
      await stream.pipe(fileStream.stream())
    })
  } else if (body.format === "csv") {
    const csv: string[] = []

    const header = excelSchema.map(
      (item) => JSON.stringify(item.column) as string,
    )
    csv.push(header.join(";"))

    excelRows.forEach((row) => {
      const newRow: string[] = []
      for (const [key, value] of Object.entries(row)) {
        const indexInHeader = header.findIndex(
          (item) => item === JSON.stringify(key),
        )
        if (indexInHeader === -1) continue

        newRow[indexInHeader] = JSON.stringify(value)
      }
      csv.push(newRow.join(";"))
    })

    const csvBlob = new Blob([csv.join("\n")], {
      type: "text/plain",
    })

    return stream(c, async (stream) => {
      await stream.pipe(csvBlob.stream())
    })
  }
})

const server = serve(
  {
    fetch: app.fetch,
    port: 8099,
  },
  async (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
    console.log("Initiating connection to HA WS API")

    try {
      const auth = new AddonAuth({
        hassUrl: "http://supervisor/core/websocket",
        clientId: null,
        expires: Date.now() + 1e11,
        refresh_token: "",
        access_token: process.env.SUPERVISOR_TOKEN || "",
        expires_in: 1e11,
      }) as Auth

      connection = await createConnection({ auth })

      console.log("Connected to HA WS API")
    } catch (err) {
      console.error("Could not connect to the HA WS API:", err)
      process.exit(1)
    }
  },
)

const shutdown = () => {
  console.log("Shutting down...")

  server.close()

  if (connection.connected) {
    connection.close()
  }

  console.log("Goodbye")
  process.exit(0)
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
