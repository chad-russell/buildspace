import { DataNode } from "./DataNode"
import { HttpRequestNode } from "./HttpRequestNode"
import { SelectNode } from "./SelectNode"
import { InspectNode } from "./InspectNode"
import { PageNode } from "./PageNode"

export const nodeTypes = {
  data: DataNode,
  httpRequest: HttpRequestNode,
  select: SelectNode,
  inspect: InspectNode,
  page: PageNode,
}

export { DataNode, HttpRequestNode, SelectNode, InspectNode, PageNode }

