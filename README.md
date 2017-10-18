# BoundTemplate

A micro-library for binding data to [HTML Templates](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template).

## Goals

This library only aims to accomplish two things:

1. Provide a simple method of binding _data_ to templates. This means no logic.
2. Efficiently update bound data.

That's it. A future goal may be to provide a way to extend the library such that the "no logic" stance isn't always true.

## Example

```html
<template id="greeting">
  <p class="[[color]] greeting">Hello, [[name]]!</p>
</template>
```

```javascript
const template = document.getElementById('greeting');
const boundTemplate = new BoundTemplate(template);
const [instance, bindings] = boundTemplate.create();

// Insert template into DOM
component.shadowRoot.appendChild(instance);

// Update data in the DOM
bindings.set('color', 'red');
bindings.set('name', 'Zelda');
```
