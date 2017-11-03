import TemplateBindings from './template-bindings';
import TemplateBindingsFactory from './template-bindings-factory';
import TemplateBindingsParser from './template-bindings-parser';

/**
 * The only public export of the package. This class turns a standard HTML
 * Template element into a factory for creating template clones (instances)
 * with a set of named bindings to dynamically update the DOM.
 */
export default class BoundTemplate {

  _bindingsFactory: TemplateBindingsFactory;
  _template: HTMLTemplateElement;

  constructor(template: HTMLTemplateElement) {

    this._bindingsFactory = null;
    this._template = template;

  }

  /**
   * Creates a template clone and associated bindings object. If this is the
   * first instance created, it will also perform the initial parse of the
   * template.
   */
  create(data?: object): [Node, TemplateBindings] {

    if (!this._bindingsFactory) {

      this._bindingsFactory = TemplateBindingsParser.parse(this._template);

    }

    const instance = this._template.content.cloneNode(true);
    const bindings = this._bindingsFactory.applyTo(instance);

    if (data) {

      bindings.setData(data);

    }

    return [instance, bindings];

  }

}
