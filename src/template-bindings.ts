interface TextBinding {
  name: string;
  path: number[];
}

interface AttributeBinding {
  name: string;
  path: number[];
}

export default class TemplateBindings {

  static BINDING_REGEX = /\[\[([a-z]*)\]\]/;

  // Generates template binding info from the provide HTML Template
  static parse(template: HTMLTemplateElement) {

    const bindings = new TemplateBindings();

    this.parseNodes(bindings, template.content.childNodes, []);

    return bindings;

  }

  // Parses a set of nodes to see if they have any template bindings
  static parseNodes(bindings: TemplateBindings, nodes: NodeList, path: number[]) {

    for (let i = 0; i < nodes.length; i++) {

      path.push(i);
      this.parseNode(bindings, nodes[i], path);
      path.pop();

    }

  }

  // Parses a single node to see if it has any template bindings
  static parseNode(bindings: TemplateBindings, node: Node, path: number[]) {

    if (node.nodeType === Node.TEXT_NODE) {

      return this.parseBindings(bindings, <Text>node, path);

    }

    if (node.nodeType === Node.ELEMENT_NODE) {

      if (node.hasAttributes()) {

        this.parseAttributes(bindings, node.attributes, path);

      }

      if (node.hasChildNodes()) {

        this.parseNodes(bindings, node.childNodes, path);

      }

    }

  }

  // Parses bindings from a text node. This is where info is actually added
  // to the bindings data structure
  static parseBindings(bindings: TemplateBindings, node: Text, path: number[]) {

    const match = node.textContent.match(this.BINDING_REGEX);
    if (match) {
      if (match.index) {
        node.splitText(match.index);
        return;
      }

      if (node.length > match[0].length) {
        node.splitText(match.index);
      }

      const name = match[1];
      bindings.addTextBinding(name, path);
    }

  }

  // Parses bindings from a set of attributes
  static parseAttributes(bindings: TemplateBindings, attributes: NamedNodeMap, path: number[]) {
    // TODO
  }

  // Parses bindings from an attribute. This is where info is actually added
  // to the bindings data structure.
  static parseAttribute(bindings: TemplateBindings, attribute, path: number[]) {
    // TODO
  }

  _textBindings: TextBinding[];
  _attributeBindings: AttributeBinding[];

  addTextBinding(name: string, path: number[]) {
    this._textBindings.push({ name, path });
  }

  applyTo(node: Node) {

    for (let i = 0 ; i < this._textBindings.length; i++) {

      const binding = this._textBindings[i]
      this.applyTextBinding(binding, node);

    }

  }

  applyTextBinding(binding: TextBinding, node: Node) {



  }

  findNodeFromPath(node: Node, path: number[]) {

  }

  addAttributeBinding() {

  }

}
