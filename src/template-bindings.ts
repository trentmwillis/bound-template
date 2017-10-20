import Bindings from './bindings';
import BoundNode from './bound-node';

interface TextBinding {
  name: string;
  path: number[];
}

interface AttributeBinding {
  name: string;
  attrName: string;
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

  static parseAttributes(bindings: TemplateBindings, attributes: NamedNodeMap, path: number[]) {

    for (let i = 0; i < attributes.length; i++) {

      this.parseAttribute(bindings, attributes[i], path);

    }

  }

  static parseAttribute(bindings: TemplateBindings, attribute: Attr, path: number[]) {

    const match = attribute.value.match(this.BINDING_REGEX);
    if (match) {

      bindings.addAttributeBinding(match[1], attribute.name, path);

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
        node.splitText(match[0].length);
      }

      const name = match[1];
      bindings.addTextBinding(name, path);
    }

  }

  _textBindings: TextBinding[];
  _attributeBindings: AttributeBinding[];

  constructor() {

    this._textBindings = [];
    this._attributeBindings = [];

  }

  addTextBinding(name: string, path: number[]) {

    this._textBindings.push({ name, path: path.slice() });

  }

  addAttributeBinding(name: string, attrName: string, path: number[]) {

    this._attributeBindings.push({ name, attrName, path: path.slice() });

  }

  applyTo(node: Node) {

    const bindingsMap = new Map<string, BoundNode[]>();
    for (let i = 0 ; i < this._textBindings.length; i++) {

      const { name, path } = this._textBindings[i]
      const nodeToBind = this.findNodeFromPath(node, path);

      nodeToBind.textContent = '';

      if (!bindingsMap.has(name)) {

        bindingsMap.set(name, []);

      }

      bindingsMap.get(name).push({
        node: nodeToBind
      });

    }

    for (let i = 0 ; i < this._attributeBindings.length; i++) {

      const { name, attrName, path } = this._attributeBindings[i]
      const nodeToBind = this.findNodeFromPath(node, path);

      if (!bindingsMap.has(name)) {

        bindingsMap.set(name, []);

      }

      const attrNode = (<Element>nodeToBind).getAttributeNode(attrName);
      bindingsMap.get(name).push({
        node: attrNode,
        originalValue: attrNode.value
      });
      attrNode.value = attrNode.value.replace(`[[${name}]]`, '');

    }
    return new Bindings(bindingsMap);

  }

  findNodeFromPath(node: Node, path: number[]) {

    let result = node;
    for (let i = 0; i < path.length; i++) {

      result = result.childNodes[path[i]];

    }
    return result;

  }

}
