import { Config } from "@measured/puck"
import { TextComponent } from "./components/TextComponent"
import { HeadingComponent } from "./components/HeadingComponent"
import { ContainerComponent } from "./components/ContainerComponent"
import { DataDisplayComponent } from "./components/DataDisplayComponent"

export const puckConfig: Config = {
  components: {
    Text: TextComponent,
    Heading: HeadingComponent,
    Container: ContainerComponent,
    DataDisplay: DataDisplayComponent,
  },
}

export default puckConfig

