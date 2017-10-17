import TemplateBindings from './template-bindings';

export default class BoundTemplate {

  bindings: TemplateBindings;
  template: HTMLTemplateElement;

  constructor(template: HTMLTemplateElement) {

    this.bindings = TemplateBindings.parse(template);
    this.template = template;

  }

  create(): [Node, Bindings] {

    const instance = this.template.cloneNode(true);
    const bindings = this._initBindings(instance);
    return [instance, bindings];

  }

  _initBindings(node: Node) {

    return this.bindings.applyTo(node);

  }

}