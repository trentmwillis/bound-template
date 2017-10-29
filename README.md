# BoundTemplate

A micro-library for binding data to [HTML Templates](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template).

## Goals

This library only aims to accomplish three things:

1. Provide a simple method of _inserting data_ in templates. This means no logic and no two-way bindings.
2. Efficiently update bound data by operating on the smallest number of Nodes possible.
3. Do 1 & 2 with as little code as possible while keeping the source code clear & readable.

That's it. The goals may change in the future, but for now the overarching theme is simplicity and doing one thing (data insertion) well.

## Syntax

The syntax to bind a value to the DOM is simple: `[[name]]`. You can bind to attributes as well as text.

```html
<template id="greeting">
  <p class="[[color]] greeting">Hello, [[name]]!</p>
</template>
```

You can bind multiple values as well:

```html
<template id="greeting">
  <p class="[[color]] [[type]]">[[greeting]], [[name]]!</p>
</template>
```

You can also bind to properties by appending `$` to an attribute name:

```html
<p my-prop$=[[data]]></p>
```

This makes it obvious that the value will be applied to a property and not an attribute. Note that you cannot apply more than one binding to a property. If more than one is specified, the subsequent bindings will be ignored.

The primary difference between attributes and properties is that attribute values will always be coerced to strings and appear in the DOM whereas properties will not be coerced and set directly on the element object and thus may not appear in the DOM.

You can also bind event handlers using the `on-` prefix:

```html
<p on-click=[[clickHandler]]></p>
```

Anytime the binding for an event handler is updated, the old handler will be removed and the new one attached. If a non-function value is passed, an error will occur.

## Usage

The API surface is relatively small and thus simple to use.

To get started, simply pass a reference to a template you would like to bind into the `BoundTemplate` constructor (the only export from this package):

```javascript
const template = document.getElementById('greeting');
const boundTemplate = new BoundTemplate(template);
```

The resulting `boundTemplate` object is a factory function with only one method, `create()`:

```javascript
const [instance, bindings] = boundTemplate.create();
```

`create()` will return a cloned instance of the template, which you can then insert into the DOM, and a bindings object which allows you to set values directly into the template instance:

```javascript
// Insert template instance into DOM
component.shadowRoot.appendChild(instance);

// Update data in the DOM
bindings.set('color', 'red');
bindings.set('name', 'Zelda');
```

For further examples, see the [`Examples` folder](./examples).

## Version 1.0 Todo
- Property bindings
  - Property bindings should always be put on `.props` to avoid collisions (is this React standard as well?). This will also make it easy to do nested bindings in Custom Elements.
- Event handler bindings
- Handle nested templates
