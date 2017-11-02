export default interface BoundNode {
  node: Node;
}

export interface BoundAttributeNode extends BoundNode {
  originalValue: string;
  values: Map<string, string>;
}

export interface BoundPropertyNode extends BoundNode {
  propName: string;
}

export interface BoundEventHandlerNode extends BoundNode {
  eventName: string;
  eventHandler: (event: Event) => void;
}
