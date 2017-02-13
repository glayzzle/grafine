/*!
 * Copyright (C) 2017 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-reflection/graphs/contributors
 * @url http://glayzzle.com
 */
'use strict';

module.exports = function(grafine) {

    /**
     * Everything starts with the point
     * https://www.youtube.com/watch?v=0ca4miMMaCE
     */
    var point = function(graph) {
        this.graph = graph;
        this.properties = {};
        this.related = {};
        this.indexes = [];
        this.uuid = -1;
    };

    /**
     * Exports the point
     */
    point.prototype.export = function() {
        return {
            _p: this.properties,
            _i: this.indexes
        };
    };

    /**
     * Imports the point
     */
    point.prototype.import = function(data) {
        this.properties = data._p;
        this.indexes = data._i;
        for(var i = 0; i < this.indexes.length; i++) {
            var index = this.indexes[i];
            this.graph.index(index[0], index[1], this);
        }
        return this;
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
                var related = this.graph.get(relations[i]).related[property];
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
            if (!Array.isArray(relations)) relations = [relations];
            for(var i = 0, size = relations.length; i < size; i++) {
                var record = this.graph.get(relations[i]);
                var related = record.related[property];
                var id = related.indexOf(this.uuid);
                if (id !== -1) {
                    related.splice(id, 1);
                }
            }
        }
        // removes related properties nodes
        for(var property in this.related) {
            var relations = this.related[property];
            for(var i = 0, size = relations.length; i < size; i++) {
                var record = this.graph.get(relations[i]);
                var related = record.properties[property];
                if (related === this.uuid) {
                    delete record.properties[property];
                } else {
                    var id = related.indexOf(this.uuid);
                    if (id !== -1) {
                        related.splice(id, 1);
                    }
                }
            }
        }
        // removes from indexes
        for(var i = 0; i < this.indexes.length; i++) {
            var index = this.indexes[i];
            this.graph.removeIndex(index[0], index[1], this);
        }
        // removes from graph
        this.graph.shard(this.uuid).remove(this);
        return this;
    };

    /**
     * Attach current node into the specified index
     */
    point.prototype.index = function(name, value) {
        if (!value) value = '*';
        this.graph.index(name, value, this);
        this.indexes.push([name, value]);
    };

    /**
     * Creates a relation to the specified object
     */
    point.prototype.set = function(property, object) {
        if(!(property in object.related)) {
            object.related[property] = [];
        }
        object.related[property].push(this.uuid);

        if (property in this.properties) {
            // already exists, so cleanup old properties
            var relations = this.properties[property];
            if (!('length' in relations)) relations = [relations];
            for(var i = 0, size = relations.length; i < size; i++) {
                var related = this.graph.get(relations[i]).related[property];
                var id = related.indexOf(this.uuid);
                if (id !== -1) {
                    related.splice(id, 1);
                }
            }
        }
        this.properties[property] = object.uuid;
        return this;
    };

    /**
     * Add a new relation to the specified object
     */
    point.prototype.add = function(property, object) {
        if(!(property in object.related)) {
            object.related[property] = [];
        }
        object.related[property].push(this.uuid);

        if (!(property in this.properties)) {
            this.properties[property] = [];
        } else if (!Array.isArray(this.properties[property])) {
            // transform a single value into an array
            this.properties[property] = [
                this.properties[property]
            ];
        }
        this.properties[property].push(object.uuid);
        return this;
    };

    /**
     * Gets a list of objects
     */
    point.prototype.get = function(property) {
        if (property in this.properties) {
            var result = this.properties[property];
            if (!Array.isArray(result)) {
                result = [result];
            }
            return result;
        }
        return [];
    };

    /**
     * Gets the first child of the specified property
     */
    point.prototype.first = function(property) {
        if (property in this.properties) {
            var result = this.properties[property];
            if (Array.isArray(result)) {
                result = result[0];
            }
            return result;
        }
        return null;
    };

    return point;
};
