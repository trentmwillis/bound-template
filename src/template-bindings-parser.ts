import TemplateBindingsFactory from './template-bindings-factory';

/**
 * Responsible for parsing an HTMLTemplateElement and turning it into a
 * TemplateBindingsFactory instance that can then produce TemplateBindings for
 * individual instances of the template.
 */
export default class TemplateBindingsParser {

  static BINDING_REGEX = /\[\[([a-zA-z0-9]*)\]\]/;

  static parse(template: HTMLTemplateElement) {

    const bindings = new TemplateBindingsFactory();

    this.parseNodes(bindings, template.content.childNodes, []);

    return bindings;

  }

  // Parses a set of nodes to see if they have any template bindings
  static parseNodes(bindings: TemplateBindingsFactory, nodes: NodeList, path: number[]) {

    // We do a depth-first traversal of the nodes with prefix visiting for
    // actually parsing bindings
    for (let i = 0; i < nodes.length; i++) {

      path.push(i);
      this.parseNode(bindings, nodes[i], path);
      path.pop();

    }

  }

  // Parses a single node to see if it has any template bindings
  static parseNode(bindings: TemplateBindingsFactory, node: Node, path: number[]) {

    if (node.nodeType === Node.TEXT_NODE) {

      return this.parseTextBindings(bindings, <Text>node, path);

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

  // Parses the attributes of a node to see if they have any template bindings
  static parseAttributes(bindings: TemplateBindingsFactory, attributes: NamedNodeMap, path: number[]) {

    for (let i = 0; i < attributes.length; i++) {

      this.parseAttribute(bindings, attributes[i], path);

    }

  }

  // Parses a single attribute node for template bindings
  static parseAttribute(bindings: TemplateBindingsFactory, attribute: Attr, path: number[]) {

    const regex = new RegExp(this.BINDING_REGEX.source, 'g');
    const names: string[] = [];
    let match: RegExpMatchArray;
    while (match = regex.exec(attribute.value)) {

      names.push(match[1]);

    }

    if (names.length) {

      bindings.addAttributeBinding(names, attribute.name, path);

    }

  }

  // Parses a single text node for template bindings
  static parseTextBindings(bindings: TemplateBindingsFactory, node: Text, path: number[]) {

    const regex = new RegExp(this.BINDING_REGEX.source, 'g');
    const match = regex.exec(node.textContent);
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

}
