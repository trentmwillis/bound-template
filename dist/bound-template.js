var BoundTemplate = (function () {
'use strict';

function isBoundEventHandlerNode(node) {
    return node.hasOwnProperty('eventName');
}
function isBoundPropertyNode(node) {
    return node.hasOwnProperty('propName');
}
/**
 * Provides a simple interface for directly inserting data into a template.
 */
class TemplateBindings {
    constructor(bindingsMap) {
        this._map = bindingsMap;
    }
    setData(data) {
        Object.keys(data).forEach(key => this.set(key, data[key]));
    }
    set(name, value) {
        const boundNodes = this._map.get(name);
        if (boundNodes) {
            for (let boundNode of boundNodes) {
                const { node } = boundNode;
                if (node.nodeType === Node.TEXT_NODE) {
                    node.textContent = value.toString();
                }
                else if (isBoundEventHandlerNode(boundNode)) {
                    const { eventHandler, eventName } = boundNode;
                    node.removeEventListener(eventName, eventHandler);
                    node.addEventListener(eventName, value);
                    boundNode.eventHandler = value;
                }
                else if (isBoundPropertyNode(boundNode)) {
                    node.props[boundNode.propName] = value;
                }
                else {
                    const { values, originalValue } = boundNode;
                    values.set(name, value.toString());
                    let attrValue = originalValue;
                    for (let [k, v] of values) {
                        attrValue = attrValue.replace(`{{${k}}}`, v);
                    }
                    node.value = attrValue;
                }
            }
        }
    }
}

/**
 * Stores info about bindings for a parsed template. It can then apply the
 * binding info to a cloned instance of the template quickly and return a
 * TemplateBindings instance to interact with the data directly.
 */
class TemplateBindingsFactory {
    constructor() {
        this._textBindings = [];
        this._attributeBindings = [];
    }
    addTextBinding(name, path) {
        this._textBindings.push({ name, path: path.slice() });
    }
    addAttributeBinding(names, attrName, path) {
        const eventName = (attrName.startsWith('on-') ? attrName.substr(3) : '').replace(/-([a-z])/g, g => g[1].toUpperCase());
        const isProperty = attrName.endsWith('$');
        this._attributeBindings.push({
            names,
            attrName,
            eventName,
            isProperty,
            path: path.slice()
        });
    }
    applyTo(node) {
        const bindingsMap = new Map();
        for (let { name, path } of this._textBindings) {
            const nodeToBind = this.findNodeFromPath(node, path);
            nodeToBind.textContent = '';
            if (!bindingsMap.has(name)) {
                bindingsMap.set(name, []);
            }
            bindingsMap.get(name).push({
                node: nodeToBind
            });
        }
        for (let { names, attrName, path, eventName, isProperty } of this._attributeBindings) {
            const nodeToBind = this.findNodeFromPath(node, path);
            const attrNode = nodeToBind.getAttributeNode(attrName);
            if (eventName) {
                const ownerElement = attrNode.ownerElement;
                const binding = {
                    node: ownerElement,
                    eventName,
                    eventHandler: null
                };
                ownerElement.removeAttribute(attrNode.name);
                if (!bindingsMap.has(names[0])) {
                    bindingsMap.set(names[0], []);
                }
                bindingsMap.get(names[0]).push(binding);
            }
            else if (isProperty) {
                const ownerElement = attrNode.ownerElement;
                const propName = attrNode.name.slice(0, -1).replace(/-([a-z])/g, g => g[1].toUpperCase());
                const binding = {
                    node: ownerElement,
                    propName
                };
                ownerElement.props = ownerElement.props || {};
                ownerElement.props[propName] = null;
                ownerElement.removeAttribute(attrNode.name);
                if (!bindingsMap.has(names[0])) {
                    bindingsMap.set(names[0], []);
                }
                bindingsMap.get(names[0]).push(binding);
            }
            else {
                const binding = {
                    node: attrNode,
                    originalValue: attrNode.value,
                    values: new Map()
                };
                for (let name of names) {
                    if (!bindingsMap.has(name)) {
                        bindingsMap.set(name, []);
                    }
                    binding.values.set(name, '');
                    bindingsMap.get(name).push(binding);
                }
                let attrValue = binding.originalValue;
                for (let [name, value] of binding.values) {
                    attrValue = attrValue.replace(`{{${name}}}`, value);
                }
                attrNode.value = attrValue;
            }
        }
        return new TemplateBindings(bindingsMap);
    }
    findNodeFromPath(node, path) {
        let result = node;
        for (let pathSegment of path) {
            result = result.childNodes[pathSegment];
        }
        return result;
    }
}

/**
 * Responsible for parsing an HTMLTemplateElement and turning it into a
 * TemplateBindingsFactory instance that can then produce TemplateBindings for
 * individual instances of the template.
 */
class TemplateBindingsParser {
    static parse(template) {
        const bindings = new TemplateBindingsFactory();
        this.parseNodes(bindings, template.content.childNodes, []);
        return bindings;
    }
    // Parses a set of nodes to see if they have any template bindings
    static parseNodes(bindings, nodes, path) {
        // We do a depth-first traversal of the nodes with prefix visiting for
        // actually parsing bindings
        for (let i = 0; i < nodes.length; i++) {
            path.push(i);
            this.parseNode(bindings, nodes[i], path);
            path.pop();
        }
    }
    // Parses a single node to see if it has any template bindings
    static parseNode(bindings, node, path) {
        if (node.nodeType === Node.TEXT_NODE) {
            return this.parseTextBindings(bindings, node, path);
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.hasAttributes()) {
                this.parseAttributes(bindings, node.attributes, path);
            }
            if (node.hasChildNodes()) {
                this.parseNodes(bindings, node.childNodes, path);
            }
        }
    }
    // Parses the attributes of a node to see if they have any template bindings
    static parseAttributes(bindings, attributes, path) {
        // tslint:disable-next-line prefer-for-of
        for (let i = 0; i < attributes.length; i++) {
            this.parseAttribute(bindings, attributes[i], path);
        }
    }
    // Parses a single attribute node for template bindings
    static parseAttribute(bindings, attribute, path) {
        const regex = new RegExp(this.BINDING_REGEX.source, 'g');
        const names = [];
        let match = regex.exec(attribute.value);
        while (match) {
            names.push(match[1]);
            match = regex.exec(attribute.value);
        }
        if (names.length) {
            bindings.addAttributeBinding(names, attribute.name, path);
        }
    }
    // Parses a single text node for template bindings
    static parseTextBindings(bindings, node, path) {
        const regex = new RegExp(this.BINDING_REGEX.source, 'g');
        const match = regex.exec(node.textContent);
        if (match) {
            if (match.index) {
                node.splitText(match.index);
                return;
            }
            if (node.length > match[0].length) {
                node.splitText(match[0].length);
            }
            const name = match[1];
            bindings.addTextBinding(name, path);
        }
    }
}
TemplateBindingsParser.BINDING_REGEX = /{{([a-zA-z0-9]*)}}/;

/**
 * The only public export of the package. This class turns a standard HTML
 * Template element into a factory for creating template clones (instances)
 * with a set of named bindings to dynamically update the DOM.
 */
class BoundTemplate {
    constructor(template) {
        this._bindingsFactory = null;
        this._template = template;
    }
    /**
     * Creates a template clone and associated bindings object. If this is the
     * first instance created, it will also perform the initial parse of the
     * template.
     */
    create(data) {
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

return BoundTemplate;

}());
