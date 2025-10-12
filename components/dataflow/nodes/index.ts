import { DataNode } from "./DataNode"
import { HttpRequestNode } from "./HttpRequestNode"
import { SelectNode } from "./SelectNode"
import { InspectNode } from "./InspectNode"

export const nodeTypes = {
  data: DataNode,
  httpRequest: HttpRequestNode,
  select: SelectNode,
  inspect: InspectNode,
}

export { DataNode, HttpRequestNode, SelectNode, InspectNode }

