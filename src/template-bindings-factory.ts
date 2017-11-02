import TemplateBindings from './template-bindings';
import BoundNode, {
  BoundAttributeNode,
  BoundPropertyNode,
  BoundEventHandlerNode
} from './bound-node';

interface Binding {
  path: number[];
}

interface TextBinding extends Binding {
  name: string;
}

interface AttributeBinding extends Binding {
  names: string[];
  attrName: string;
  eventName: string;
  isProperty: boolean;
}

declare global {
  interface Element {
    props: object;
  }
}

/**
 * Stores info about bindings for a parsed template. It can then apply the
 * binding info to a cloned instance of the template quickly and return a
 * TemplateBindings instance to interact with the data directly.
 */
export default class TemplateBindingsFactory {

  _textBindings: TextBinding[];
  _attributeBindings: AttributeBinding[];

  constructor() {

    this._textBindings = [];
    this._attributeBindings = [];

  }

  addTextBinding(name: string, path: number[]) {

    this._textBindings.push({ name, path: path.slice() });

  }

  addAttributeBinding(names: string[], attrName: string, path: number[]) {

    const eventName = attrName.startsWith('on-') ? attrName.substr(3) : '';
    const isProperty = attrName.endsWith('$');

    this._attributeBindings.push({
      names,
      attrName,
      eventName,
      isProperty,
      path: path.slice()
    });

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

      const { names, attrName, path, eventName, isProperty } = this._attributeBindings[i]
      const nodeToBind = this.findNodeFromPath(node, path);
      const attrNode = (<Element>nodeToBind).getAttributeNode(attrName);

      if (eventName) {

        const node = attrNode.ownerElement;
        const binding: BoundEventHandlerNode = {
          node,
          eventName,
          eventHandler: null
        };

        node.removeAttribute(attrNode.name);
        if (!bindingsMap.has(names[0])) {

          bindingsMap.set(names[0], []);

        }

        bindingsMap.get(names[0]).push(binding);

      } else if (isProperty) {

        const node = attrNode.ownerElement;
        const propName = attrNode.name.slice(0, -1);
        const binding: BoundPropertyNode = {
          node,
          propName
        };

        node.props = node.props || {};
        node.props[propName] = null;
        node.removeAttribute(attrNode.name);
        if (!bindingsMap.has(names[0])) {

          bindingsMap.set(names[0], []);

        }

        bindingsMap.get(names[0]).push(binding);

      } else {

          const binding: BoundAttributeNode = {
            node: attrNode,
            originalValue: attrNode.value,
            values: new Map<string, string>()
          };

          for (let j = 0; j < names.length; j++) {

            const name = names[j];
            if (!bindingsMap.has(name)) {

              bindingsMap.set(name, []);

            }

            binding.values.set(name, '');
            bindingsMap.get(name).push(binding);

          }

          let attrValue = binding.originalValue;
          for (let [name, value] of binding.values) {
            attrValue = attrValue.replace(`{{${name}}}`, value);
          }

          attrNode.value = attrValue;

      }

    }
    return new TemplateBindings(bindingsMap);

  }

  findNodeFromPath(node: Node, path: number[]) {

    let result = node;
    for (let i = 0; i < path.length; i++) {

      result = result.childNodes[path[i]];

    }
    return result;

  }

}
