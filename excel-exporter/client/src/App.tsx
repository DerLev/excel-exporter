import {
  Button,
  Card,
  Container,
  Group,
  MultiSelect,
  Notification,
  Radio,
  Select,
  Stack,
} from "@mantine/core"
import { DateTimePicker } from "@mantine/dates"
import { useCallback, useState, useEffect } from "react"

const periods = [
  { value: "5minute", label: "5 Minutes" },
  { value: "hour", label: "Hourly" },
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
]

const App = () => {
  const [availableEntities, setAvailableEntities] = useState<string[]>([])
  const [selectedEntities, setSelectedEntities] = useState<string[]>([])
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [period, setPeriod] = useState("")
  const [format, setFormat] = useState<"xlsx" | "csv">("xlsx")

  const [formErrors, setFormErrors] = useState<{
    entities: string
    start: string
    end: string
    period: string
  }>({ entities: "", start: "", end: "", period: "" })

  const [fetchError, setFetchError] = useState("")

  const [loading, setLoading] = useState(false)

  const validateForm = useCallback(() => {
    if (!selectedEntities.length) {
      setFormErrors((prev) => ({
        ...prev,
        entities: "Select at least one entity",
      }))
    } else {
      setFormErrors((prev) => ({ ...prev, entities: "" }))
    }

    if (!startDate) {
      setFormErrors((prev) => ({
        ...prev,
        start: "Select a start date and time",
      }))
    } else {
      setFormErrors((prev) => ({ ...prev, start: "" }))
    }

    if (!endDate) {
      setFormErrors((prev) => ({ ...prev, end: "Select an end date and time" }))
    } else if (endDate.getTime() <= (startDate?.getTime() || 0)) {
      setFormErrors((prev) => ({
        ...prev,
        end: "End date and time need to be after the start date and time",
      }))
    } else {
      setFormErrors((prev) => ({ ...prev, end: "" }))
    }

    if (!period) {
      setFormErrors((prev) => ({ ...prev, period: "Select a period" }))
    } else {
      setFormErrors((prev) => ({ ...prev, period: "" }))
    }

    let hasErrors = false
    for (const value of Object.values(formErrors)) {
      if (value.length) hasErrors = true
    }

    return hasErrors
  }, [endDate, formErrors, period, selectedEntities.length, startDate])

  const submitForm = useCallback(
    async (format: "xlsx" | "csv") => {
      setLoading(true)
      const hasErrors = validateForm()
      if (hasErrors) {
        setLoading(false)
        return
      }

      try {
        await fetch("api/export", {
          method: "POST",
          body: JSON.stringify({
            entities: selectedEntities,
            start: startDate,
            end: endDate,
            period: period,
            format,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.blob())
          .then((blob) => {
            const file = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = file
            link.download = `ha-export-${new Date().getTime().toString(36)}.${format}`
            link.click()
            window.URL.revokeObjectURL(file)
          })
      } catch (err) {
        console.error(err)
        setFetchError(String(err))
      } finally {
        setLoading(false)
      }
    },
    [endDate, period, selectedEntities, startDate, validateForm],
  )

  const fetchAvailableEntities = useCallback(async () => {
    try {
      const res = await fetch("api/entities").then((res) => res.json())
      setAvailableEntities(res)
    } catch (err) {
      console.error(err)
      setFetchError(String(err))
    }
  }, [])

  useEffect(() => {
    if (!availableEntities.length) {
      fetchAvailableEntities()
    }
  }, [availableEntities.length, fetchAvailableEntities])

  return (
    <Container maw={420} w="100%">
      <Card shadow="lg" withBorder>
        <Stack>
          <MultiSelect
            label="Entities"
            placeholder={
              selectedEntities.length
                ? "Select more"
                : "sensor.outside_temperature"
            }
            data={availableEntities}
            maxDropdownHeight={220}
            value={selectedEntities}
            onChange={setSelectedEntities}
            error={formErrors.entities}
            disabled={loading}
            searchable
          />
          <DateTimePicker
            label="Start"
            placeholder="Pick a starting date and time"
            maxDate={new Date()}
            value={startDate}
            onChange={(value) => setStartDate(new Date(value))}
            error={formErrors.start}
            disabled={loading}
          />
          <DateTimePicker
            label="End"
            placeholder="Pick an ending date and time"
            maxDate={new Date()}
            value={endDate}
            onChange={(value) => setEndDate(new Date(value))}
            error={formErrors.end}
            disabled={loading}
          />
          <Select
            label="Period"
            placeholder="Select a period"
            data={periods}
            value={period}
            onChange={(value) => setPeriod(value || "")}
            error={formErrors.period}
            disabled={loading}
          />
          <Radio.Group
            label="Output format"
            value={format}
            onChange={(value) => setFormat(value as "xlsx" | "csv")}
          >
            <Group>
              <Radio value="xlsx" label="Excel" />
              <Radio value="csv" label="CSV" />
            </Group>
          </Radio.Group>
          <Button onClick={() => submitForm("xlsx")} loading={loading}>
            Download as .{format}
          </Button>
          {fetchError.length ? (
            <Notification
              withCloseButton={false}
              color="red"
              mt="md"
              title="An error occurred"
            >
              {fetchError}
            </Notification>
          ) : null}
        </Stack>
      </Card>
    </Container>
  )
}

export default App
