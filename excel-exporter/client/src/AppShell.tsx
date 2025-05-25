import {
  AppShell as MAppShell,
  AppShellHeader,
  AppShellMain,
  useComputedColorScheme,
  Title,
  Group,
} from "@mantine/core"
import type { PropsWithChildren } from "react"

const AppShell = ({ children }: PropsWithChildren) => {
  const computedColorScheme = useComputedColorScheme()

  return (
    <MAppShell
      padding="md"
      header={{ height: 60 }}
      styles={(theme) => ({
        main: {
          backgroundColor:
            computedColorScheme === "light"
              ? theme.colors.gray[0]
              : theme.colors.dark[8],
          position: "relative",
          display: "grid",
        },
        header: {
          backgroundColor:
            computedColorScheme === "light" ? theme.colors.gray[1] : undefined,
        },
      })}
      transitionDuration={0}
    >
      <AppShellHeader px="md">
        <Group align="center" h="100%">
          <Title size="h3">Excel Exporter</Title>
        </Group>
      </AppShellHeader>
      <AppShellMain>{children}</AppShellMain>
    </MAppShell>
  )
}

export default AppShell
