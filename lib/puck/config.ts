import { Config } from "@measured/puck"
import { TextComponent } from "./components/TextComponent"
import { HeadingComponent } from "./components/HeadingComponent"
import { ContainerComponent } from "./components/ContainerComponent"
import { DataDisplayComponent } from "./components/DataDisplayComponent"
import { InputComponent } from "./components/InputComponent"
import { ButtonComponent } from "./components/ButtonComponent"

export const puckConfig: Config = {
  components: {
    Text: TextComponent,
    Heading: HeadingComponent,
    Container: ContainerComponent,
    DataDisplay: DataDisplayComponent,
    Input: InputComponent,
    Button: ButtonComponent,
  },
}

export default puckConfig

