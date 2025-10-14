import { DataNode } from "./DataNode"
import { HttpRequestNode } from "./HttpRequestNode"
import { InspectNode } from "./InspectNode"
import { PageNode } from "./PageNode"
import { ActionTriggerNode } from "./ActionTriggerNode"
import { SetValueNode } from "./SetValueNode"

export const nodeTypes = {
  data: DataNode,
  httpRequest: HttpRequestNode,
  inspect: InspectNode,
  page: PageNode,
  actionTrigger: ActionTriggerNode,
  setValue: SetValueNode,
}

export { DataNode, HttpRequestNode, InspectNode, PageNode, ActionTriggerNode, SetValueNode }

