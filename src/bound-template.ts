import TemplateBindings from './template-bindings';

export default class BoundTemplate {

  bindings: TemplateBindings;
  template: HTMLTemplateElement;

  constructor(template: HTMLTemplateElement) {

    this.bindings = TemplateBindings.parse(template);
    this.template = template;

  }

  create() {

    const instance = this.template.content.cloneNode(true);
    const bindings = this.bindings.applyTo(instance);
    return [instance, bindings];

  }

}