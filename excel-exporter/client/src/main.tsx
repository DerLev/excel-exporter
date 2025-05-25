import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createTheme, MantineProvider } from "@mantine/core"
import "@mantine/core/styles.css"
import "@mantine/dates/styles.css"
import App from "./App.tsx"
import AppShell from "./AppShell.tsx"

const theme = createTheme({
  defaultRadius: "md",
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider defaultColorScheme="auto" theme={theme}>
      <AppShell>
        <App />
      </AppShell>
    </MantineProvider>
  </StrictMode>,
)
