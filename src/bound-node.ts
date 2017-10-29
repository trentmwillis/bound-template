interface BoundNode {
  node: Node;
  originalValue?: string,
  values?: Map<string, string>
}

export default BoundNode;
