# BoundTemplate

A micro-library for inserting data into an [HTML Template](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) via named bindings.

## Example (API not finalized)

```typescript
class CustomElement extends HTMLElement {

  constructor() {

    super();

    const boundTemplate = new BoundTemplate(<HTMLTemplateElement>document.getElementById('#template'));
    const [instance, bindings] = boundTemplate.create();

    this.templateBindings = bindings;
    this.shadowRoot.appendChild(instance);

  }

  attributeChangeCallback(name, oldValue, newValue) {

    this.templateBindings.set(name, newValue);

  }

}
```