import BoundNode, { BoundAttributeNode, BoundEventHandlerNode } from './bound-node';

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

      for (let i = 0; i < boundNodes.length; i++) {

        const boundNode = boundNodes[i];
        const { node } = boundNode;
        if (node.nodeType === Node.TEXT_NODE) {

          node.textContent = value.toString();

        } else if (boundNode.hasOwnProperty('eventHandler')) {

          const { eventHandler, eventName } = <BoundEventHandlerNode>boundNode;
          node.removeEventListener(eventName, eventHandler);
          node.addEventListener(eventName, value);
          (<BoundEventHandlerNode>boundNode).eventHandler = value;

        } else {

          const { values, originalValue } = <BoundAttributeNode>boundNode;
          values.set(name, value.toString());

          let attrValue = originalValue;
          for (let [name, value] of values) {
            attrValue = attrValue.replace(`[[${name}]]`, value);
          }

          (<Attr>node).value = attrValue;

        }


      }

    }

  }

}
