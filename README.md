# BoundTemplate

A micro-library for binding data to [HTML Templates](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template).

## Goals

This library only aims to accomplish three things:

1. Provide a simple method of _inserting data_ in HTML Templates. This means no logic and no two-way bindings.
2. Efficiently update bound data by operating on the smallest number of Nodes possible.
3. Do 1 & 2 with as little code as possible while keeping the source code clear & readable.

That's it. The goals may change in the future, but for now the overarching theme is simplicity and doing one thing (data insertion) well.

## Syntax

The syntax to bind a value to the DOM is simple: `{{name}}`. You can bind to element attributes as well as text nodes.

```html
<template id="greeting">
  <p class="{{color}} greeting">Hello, {{name}}!</p>
</template>
```

You can bind multiple values as well:

```html
<template id="greeting">
  <p class="{{color}} {{type}}">{{greeting}}, {{name}}!</p>
</template>
```

Both text nodes and element attributes are coerced to `string` values before being inserted into the DOM. While this is obvious for text nodes, it is important to note this behavior for attributes as well (which can [only return `null` or `string` values](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute)).

If you want to bind non-string values, then you can bind directly to an element's properties by appending `$` to an attribute name:

```html
<p my-prop$={{data}}></p>
```

Properties will not appear in the DOM, but instead are set on a `props` property on the specified element. In other words, after rendering the above you might get:

```javascript
console.log(document.querySelector('p').props.data); // Logs the value of `data`, not coerced.
```

The special syntax makes it obvious that the value will be applied to a property and not an attribute. Note that you cannot apply more than one binding to a property. If more than one is specified, the subsequent bindings will simply be ignored.

Finally, you can also bind event handlers using the `on-` prefix:

```html
<p on-click={{clickHandler}}></p>
```

Anytime the binding for an event handler is updated, the old handler will be removed and the new one attached.

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

You can optionally pass an object to `create` which will be used to instantiate the bindings to default values:

```javascript
const [instance, bindings] = boundTemplate.create({
  color: 'red',
  name: 'Zelda'
});
```

Similarly, you can set multiple values at a time by passing an object to the `set` function:

```javascript
bindings.set({
  color: 'red',
  name: 'Zelda'
});
```

For further examples, see the [`Examples` folder](./examples).
