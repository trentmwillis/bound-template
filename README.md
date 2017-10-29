# BoundTemplate

A micro-library for binding data to [HTML Templates](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template).

## Goals

This library only aims to accomplish three things:

1. Provide a simple method of _inserting data_ in templates. This means no logic and no two-way bindings.
2. Efficiently update bound data by operating on the smallest number of Nodes possible.
3. Do 1 & 2 with as little code as possible while keeping the source code clear & readable.

That's it. A future goal may be to provide a way to extend the library such that the "no logic" stance isn't always true.

## Syntax

The syntax to bind a value to the DOM is simple: `[[name]]`. You can bind to attributes as well as text.

```html
<template id="greeting">
  <p class="[[color]] greeting">Hello, [[name]]!</p>
</template>
```

You can also bind to properties by appending `$` to an attribute name:

```html
<p my-prop$=[[data]]></p>
```

This makes it obvious that the value will be applied to a property and not an attribute.

You can also bind event handlers using the `on-` prefix:

```html
<p on-click=[[clickHandler]]></p>
```

## Usage

```javascript
const template = document.getElementById('greeting');
const boundTemplate = new BoundTemplate(template);
const [instance, bindings] = boundTemplate.create();

// Insert template instance into DOM
component.shadowRoot.appendChild(instance);

// Update data in the DOM
bindings.set('color', 'red');
bindings.set('name', 'Zelda');
```
