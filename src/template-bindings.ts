import BoundNode from './bound-node';

/**
 * Provides a simple interface for directly inserting data into a template.
 */
export default class TemplateBindings {

  _map: Map<string, BoundNode[]>;

  constructor(bindingsMap: Map<string, BoundNode[]>) {

    this._map = bindingsMap;

  }

  set(name, value) {

    const nodes = this._map.get(name);
    if (nodes) {

      for (let i = 0; i < nodes.length; i++) {

        const { node, originalValue, values } = nodes[i];
        if (node.nodeType === Node.TEXT_NODE) {

          node.textContent = value.toString();

        } else {

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
