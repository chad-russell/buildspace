import { ComponentConfig } from "@measured/puck"
import { usePageState } from "../context/PageStateContext"
import { useState } from "react"

export interface ButtonProps {
  text: string
  actionName: string
  variant: "primary" | "secondary" | "outline"
}

export const ButtonComponent: ComponentConfig<ButtonProps> = {
  fields: {
    text: {
      type: "text",
      label: "Button Text",
    },
    actionName: {
      type: "text",
      label: "Action Name",
    },
    variant: {
      type: "radio",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Outline", value: "outline" },
      ],
    },
  },
  defaultProps: {
    text: "Click Me",
    actionName: "",
    variant: "primary",
  },
  render: ({ text, actionName, variant }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{
      type: "success" | "error"
      text: string
    } | null>(null)

    // Check if we're in a context with page state (runtime)
    let triggerAction: any = null

    try {
      const context = usePageState()
      triggerAction = context.triggerAction
    } catch {
      // Not in PageStateProvider context (design-time)
    }

    const isInteractive = !!triggerAction

    const handleClick = async () => {
      if (!triggerAction || !actionName) return

      setIsLoading(true)
      setMessage(null)

      const result = await triggerAction(actionName)

      setIsLoading(false)

      if (result.success) {
        setMessage({ type: "success", text: "Action completed successfully" })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({
          type: "error",
          text: result.error || "Action failed",
        })
      }
    }

    const variantClasses = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      secondary:
        "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
      outline:
        "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
    }

    return (
      <div className="w-full">
        <button
          onClick={handleClick}
          disabled={!isInteractive || isLoading || !actionName}
          className={`
            px-4 py-2 rounded-md font-medium text-sm
            focus:outline-none focus:ring-2 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            ${variantClasses[variant]}
          `}
        >
          {isLoading ? "Loading..." : text}
        </button>

        {message && (
          <div
            className={`
              mt-2 text-xs p-2 rounded
              ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }
            `}
          >
            {message.text}
          </div>
        )}

        {!isInteractive && (
          <p className="text-xs text-gray-500 mt-1">
            {actionName
              ? `Triggers action: ${actionName} (preview mode)`
              : "No action selected"}
          </p>
        )}
      </div>
    )
  },
}

