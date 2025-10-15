import { ComponentConfig } from "@measured/puck"

export interface ContainerProps {
  padding: "none" | "small" | "medium" | "large"
  backgroundColor: string
  content: any[]
}

export const ContainerComponent: ComponentConfig<ContainerProps> = {
  fields: {
    padding: {
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Small", value: "small" },
        { label: "Medium", value: "medium" },
        { label: "Large", value: "large" },
      ],
    },
    backgroundColor: {
      type: "select",
      options: [
        { label: "White", value: "white" },
        { label: "Gray", value: "gray" },
        { label: "Blue", value: "blue" },
        { label: "Green", value: "green" },
      ],
    },
    content: {
      type: "slot",
      label: "Content",
    },
  },
  defaultProps: {
    padding: "medium",
    backgroundColor: "white",
    content: [],
  },
  render: ({ padding, backgroundColor, content: Content }) => {
    const paddingClasses: Record<string, string> = {
      none: "p-0",
      small: "p-2",
      medium: "p-4",
      large: "p-8",
    }

    const bgClasses: Record<string, string> = {
      white: "bg-white",
      gray: "bg-gray-100",
      blue: "bg-blue-50",
      green: "bg-green-50",
    }

    return (
      <div
        className={`${paddingClasses[padding]} ${bgClasses[backgroundColor]} border border-gray-200 rounded-md`}
      >
        <Content />
      </div>
    )
  },
}

