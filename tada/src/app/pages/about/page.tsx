import { createRoot } from "react-dom/client"
import { useEffect, useState } from "react"
import "normalize.css"
import "../../assets/global.css"
import { Button } from "@tada/ui/components/ui/button.js"
import { X } from "lucide-react"
import { WindowProvider } from '../../providers/window'

interface AppInfo {
  name: string
  version: string
  electron: string
}

function AboutContent() {
  // const [appInfo, setAppInfo] = useState<AppInfo | null>(null)

  useEffect(() => {
    // window.api.invoke("getAppInfo").then((info: AppInfo) => setAppInfo(info))
  }, [])

  const handleClose = () => {
    console.log("closeNotNoteWindow")
    window.api.invoke("closeNotNoteWindow", {})
  }

  return (
    <div className="min-h-screen flex flex-col item-center justify-center bg-gradient-to-b from-background via-background to-muted/30">
      {/* Draggable header area for macOS */}
      <div className="h-10 flex-shrink-0 drag-region" />

      <main className="flex-1 flex flex-col items-center justify-center px-8 pb-8 -mt-6">
        {/* App name */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold tracking-tight mb-2">
            tada
          </h1>
          <p className="text-muted-foreground text-sm tracking-wide uppercase">
            Note-taking, simplified
          </p>
        </div>

        {/* Version info card */}
        <div className="flex flex-col items-center justify-center w-full rounded-lg border border-border bg-card/50 px-5 py-4 shadow-sm mb-10">
            <div className="h-12 flex items-center justify-center text-muted-foreground text-sm">
              Loading…
            </div>

        </div>

        <div className="flex flex-col items-center justify-center">
          <p className="text-muted-foreground text-xs text-center max-w-[240px] mb-10">
            A lightweight note-taking app that stays out of your way.
          </p>
          <Button
            variant="outline"
            size="lg"
            onClick={handleClose}
            className="gap-2 no-drag"
          >
            <X className="size-4" />
          </Button>
        </div>
      </main>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(
  <WindowProvider>
    <AboutContent />
  </WindowProvider>
)
