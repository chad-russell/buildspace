import { DataNode } from "./DataNode"
import { HttpRequestNode } from "./HttpRequestNode"
import { SelectNode } from "./SelectNode"
import { InspectNode } from "./InspectNode"
import { PageNode } from "./PageNode"
import { ActionTriggerNode } from "./ActionTriggerNode"

export const nodeTypes = {
  data: DataNode,
  httpRequest: HttpRequestNode,
  select: SelectNode,
  inspect: InspectNode,
  page: PageNode,
  actionTrigger: ActionTriggerNode,
}

export { DataNode, HttpRequestNode, SelectNode, InspectNode, PageNode, ActionTriggerNode }

