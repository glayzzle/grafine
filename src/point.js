/*!
 * Copyright (C) 2017 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-reflection/graphs/contributors
 * @url http://glayzzle.com
 */
'use strict';

/**
 * Everything starts with the point
 * https://www.youtube.com/watch?v=0ca4miMMaCE
 */
var point = function(graph) {
    this.graph = graph;
    this.properties = {};
    this.related = {};
    this.indexes = [];
};

/**
 * Exports the point
 */
point.prototype.export = function() {
    var result = {
        _p: {},
        _i: this.indexes
    };
    for(var k in this.properties) {
        var relations = this.properties[k];
        if ('length' in relations) {
          if (relations.length > 0) {
              result._p[k] = [];
              for(var i = 0; i < relations.length; i++) {
                  var id = this.graph.points.indexOf(relations[i]);
                  if (id !== -1) result._p[k].push(id);
              }
          }
        } else {
            var id = this.graph.points.indexOf(relations);
            if (id !== -1) result._p[k] = id;
        }
    }
    return result;
};

/**
 * Just deletes a property
 */
point.prototype.remove = function(property) {
    if (property in this.properties) {
        var relations = this.properties[property];
        delete this.properties[property];
        if (!('length' in relations)) relations = [relations];
        for(var i = 0, size = relations.length; i < size; i++) {
            var related = relations[i].related[property];
            var id = related.indexOf(this);
            if (id !== -1) {
                related.splice(id, 1);
            }
        }
    }
    return this;
};

/**
 * Deletes the point from the graph
 */
point.prototype.delete = function() {
    // removes from related nodes
    for(var property in this.properties) {
        var relations = this.properties[property];
        if (!('length' in relations)) relations = [relations];
        for(var i = 0, size = relations.length; i < size; i++) {
            var related = relations[i].related[property];
            var id = related.indexOf(this);
            if (id !== -1) {
                related.splice(id, 1);
            }
        }
    }
    // removes related properties nodes
    for(var property in this.related) {
        var relations = this.related[property];
        for(var i = 0, size = relations.length; i < size; i++) {
            var related = relations[i].properties[property];
            if (related === this) {
                delete relations[i].properties[property];
            } else {
                var id = related.indexOf(this);
                if (id !== -1) {
                    related.splice(id, 1);
                }
            }
        }
    }
    // removes from indexes
    for(var i = 0; i < this.indexes.length; i++) {
        var index = this.indexes[i];
        var id = this.graph.index[index[0]][index[1]].indexOf(this);
        if (id !== -1) {
            this.graph.index[index[0]][index[1]][id] = null;
        }
    }
    // removes from graph
    var id = this.graph.points.indexOf(this);
    if (id !== -1) {
        this.graph.points[id] = null;
    }
    this.graph.length --;
    this.graph.gaps ++;
    return this;
};

/**
 * Attach current node into the specified index
 */
point.prototype.index = function(name, value) {
    if (!(name in this.graph.index)) {
        this.graph.index[name] = {};
    }
    if (!value) value = '*';
    if (!(value in this.graph.index[name])) {
        this.graph.index[name][value] = [];
    }
    this.graph.index[name][value].push(this);
    this.indexes.push([name, value]);
};

/**
 * Creates a relation to the specified object
 */
point.prototype.set = function(property, object) {
    if(!(property in object.related)) {
        object.related[property] = [];
    }
    object.related[property].push(this);
    if (property in this.properties) {
        // already exists, so cleanup
        var relations = this.properties[property];
        if (!('length' in relations)) relations = [relations];
        for(var i = 0, size = relations.length; i < size; i++) {
            var related = relations[i].related[property];
            var id = related.indexOf(this);
            if (id !== -1) {
                related.splice(id, 1);
            }
        }
    }
    this.properties[property] = object;
    return this;
};

/**
 * Add a new relation to the specified object
 */
point.prototype.add = function(property, object) {
    if(!(property in object.related)) {
        object.related[property] = [];
    }
    object.related[property].push(this);
    if (!(property in this.properties)) {
        this.properties[property] = [];
    } else if (!('length' in this.properties[property])) {
        this.properties[property] = [
            this.properties[property]
        ];
    }
    this.properties[property].push(object);
    return this;
};

/**
 * Gets a list of objects
 */
point.prototype.get = function(property) {
    if (property in this.properties) {
        return this.properties[property];
    }
    return [];
};

/**
 * Gets the first child of the specified property
 */
point.prototype.first = function(property) {
    var items = this.get(property);
    if (Array.isArray(items)) {
        if (items.length > 0) {
            return items[0];
        }
        return null;
    }
    return items;
};

module.exports = point;
