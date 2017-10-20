import TemplateBindings from './template-bindings';

/**
 * The only public export of the package. This class turns a standard HTML
 * Template element into a factory for creating template clones (instances)
 * with a set of named bindings to dynamically update the DOM.
 */
export default class BoundTemplate {

  _bindings: TemplateBindings;
  _template: HTMLTemplateElement;

  constructor(template: HTMLTemplateElement) {

    this._bindings = null;
    this._template = template;

  }

  /**
   * Creates a template clone and associated bindings object. If this is the
   * first instance created, it will also perform the initial parse of the
   * template.
   */
  create() {

    if (!this._bindings) {

      this._bindings = TemplateBindings.parse(this._template);

    }

    const instance = this._template.content.cloneNode(true);
    const bindings = this._bindings.applyTo(instance);

    return [instance, bindings];

  }

}