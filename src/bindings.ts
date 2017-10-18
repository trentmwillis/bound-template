import BoundNode from './bound-node';

export default class Bindings {

  _map: Map<string, BoundNode[]>;

  constructor(bindingsMap: Map<string, BoundNode[]>) {

    this._map = bindingsMap;

  }

  set(name, value) {

    const nodes = this._map.get(name);
    if (nodes) {

      for (let i = 0; i < nodes.length; i++) {

        const { node, originalValue } = nodes[i];
        if (node.nodeType === Node.TEXT_NODE) {

          node.textContent = value.toString();

        } else {

          (<Attr>node).value = originalValue.replace(`[[${name}]]`, value.toString());

        }


      }

    }

  }

}
