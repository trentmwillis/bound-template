import BoundNode, {
  BoundAttributeNode,
  BoundEventHandlerNode,
  BoundPropertyNode
} from './bound-node';

function isBoundEventHandlerNode(node: BoundNode): node is BoundEventHandlerNode {
  return node.hasOwnProperty('eventName');
}

function isBoundPropertyNode(node: BoundNode): node is BoundPropertyNode {
  return node.hasOwnProperty('propName');
}

/**
 * Provides a simple interface for directly inserting data into a template.
 */
export default class TemplateBindings {

  _map: Map<string, BoundNode[]>;

  constructor(bindingsMap: Map<string, BoundNode[]>) {

    this._map = bindingsMap;

  }

  set(name, value) {

    const boundNodes = this._map.get(name);
    if (boundNodes) {

      for (let boundNode of boundNodes) {

        const { node } = boundNode;
        if (node.nodeType === Node.TEXT_NODE) {

          node.textContent = value.toString();

        } else if (isBoundEventHandlerNode(boundNode)) {

          const { eventHandler, eventName } = boundNode;
          node.removeEventListener(eventName, eventHandler);
          node.addEventListener(eventName, value);
          boundNode.eventHandler = value;

        } else if (isBoundPropertyNode(boundNode)) {

          (node as Element).props[boundNode.propName] = value;

        } else {

          const { values, originalValue } = boundNode as BoundAttributeNode;
          values.set(name, value.toString());

          let attrValue = originalValue;
          for (let [k, v] of values) {
            attrValue = attrValue.replace(`{{${k}}}`, v);
          }

          (node as Attr).value = attrValue;

        }

      }

    }

  }

}
