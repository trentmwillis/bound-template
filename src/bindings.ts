export default class Bindings {

  _map: Map<string, Node[]>;

  constructor(bindingsMap: Map<string, Node[]>) {

    this._map = bindingsMap;

  }

  set(name, value) {

    const nodes = this._map.get(name);
    if (nodes) {

      for (let i = 0; i < nodes.length; i++) {

        nodes[i].textContent = value.toString();

      }

    }

  }

}
