/*!
 * Copyright (C) 2017 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-reflection/graphs/contributors
 * @url http://glayzzle.com
 */
'use strict';

module.exports = function(grafine) {

    /**
     * Defines a point entry
     * @constructor Point
     */
    var Point = function(db) {
        /**
         * @property {Graph} _db The graph container instance
         */
        this._db = db;
        /**
         * @property {Object} _properties List of relations towards other points
         */
        this._properties = {};
        /**
         * @property {Object} _related List of related nodes
         */
        this._related = {};
        /**
         * @property {Array} _indexes List of indexed values
         */
        this._indexes = [];
        /**
         * @property {Number} uuid Unique point identifier
         */
        this.uuid = -1;
    };

    /**
     * Exports the point (for serialisation/caching purpose)
     * @return {Object}
     */
    Point.prototype.export = function() {
        return {
            _p: this._properties,
            _i: this._indexes
        };
    };

    /**
     * Imports the point (from a unserialized value previously 
     * generated with export function)
     * @param {Object} data The data to be imported (properties & indexes)
     * @return {Point}
     */
    Point.prototype.import = function(data) {
        this._properties = data._p;
        this._indexes = data._i;
        return this;
    };

    /**
     * Deletes the point from the graph
     */
    Point.prototype.delete = function() {
        // removes from related nodes
        for(var property in this._properties) {
            var relations = this._properties[property];
            if (!(relations instanceof Array)) relations = [relations];
            for(var i = 0, size = relations.length; i < size; i++) {
                var record = this._db.get(relations[i]);
                var related = record._related[property];
                var id = related.indexOf(this.uuid);
                if (id !== -1) {
                    related.splice(id, 1);
                }
            }
        }
        // removes related properties nodes
        for(var property in this._related) {
            var relations = this._related[property];
            for(var i = 0, size = relations.length; i < size; i++) {
                var record = this._db.get(relations[i]);
                var related = record._properties[property];
                if (related === this.uuid) {
                    delete record._properties[property];
                } else {
                    var id = related.indexOf(this.uuid);
                    if (id !== -1) {
                        related.splice(id, 1);
                    }
                }
            }
        }
        // removes from indexes
        for(var i = 0; i < this._indexes.length; i++) {
            var idx = this._indexes[i];
            this._db.removeIndex(idx[0], idx[1], this);
        }
        // removes from graph
        this._db.shard(this.uuid).remove(this);
        return this;
    };

    /**
     * Just deletes a property (and their links)
     */
    Point.prototype.removeAttribute = function(property) {
        if (property in this._properties) {
            var relations = this._properties[property];
            delete this._properties[property];
            if (!(relations instanceof Array)) relations = [relations];
            for(var i = 0, size = relations.length; i < size; i++) {
                var related = this._db.get(relations[i]);
                if (related) {
                    related = related._related[property];
                    var id = related.indexOf(this.uuid);
                    if (id !== -1) {
                        related.splice(id, 1);
                    }
                }
            }
        }
        return this;
    };

    /**
     * Removes an index entry
     */
    Point.prototype.removeIndex = function(name) {
        for(var i = 0; i < this._indexes.length; i++) {
            var index = this._indexes[i];
            if (index[0] === name) {
                this._db.removeIndex(index[0], index[1], this);
                this._indexes.splice(i, 1);
                break;
            }
        }
        return this;
    };

    /**
     * Reads an indexed entry value
     */
    Point.prototype.getIndex = function(name) {
        for(var i = 0; i < this._indexes.length; i++) {
            var index = this._indexes[i];
            if (index[0] === name) {
                return index[1];
            }
        }
        return null;
    };

    /**
     * Attach current node into the specified index
     */
    Point.prototype.index = function(name, value) {
        if (!value) value = '*';
        this._db.index(name, value, this);
        this._indexes.push([name, value]);
    };

    /**
     * Creates a relation to the specified object
     */
    Point.prototype.set = function(property, object) {
        if(!(property in object._related)) {
            object._related[property] = [];
        }
        object._related[property].push(this.uuid);

        if (property in this._properties) {
            // already exists, so cleanup old properties
            var relations = this._properties[property];
            if (!(relations instanceof Array)) relations = [relations];
            for(var i = 0, size = relations.length; i < size; i++) {
                var related = this._db.get(relations[i]);
                if (related) {
                    related = related._related[property];
                    var id = related.indexOf(this.uuid);
                    if (id !== -1) {
                        related.splice(id, 1);
                    }
                }
            }
        }
        this._properties[property] = object.uuid;
        return this;
    };

    /**
     * Add a new relation to the specified object
     */
    Point.prototype.add = function(property, object) {
        if(!(property in object._related)) {
            object._related[property] = [];
        }
        object._related[property].push(this.uuid);

        if (!(property in this._properties)) {
            this._properties[property] = [];
        } else if (!(this._properties[property] instanceof Array)) {
            // transform a single value into an array
            this._properties[property] = [
                this._properties[property]
            ];
        }
        this._properties[property].push(object.uuid);
        return this;
    };

    /**
     * Gets a list of objects
     */
    Point.prototype.get = function(property) {
        if (property in this._properties) {
            var result = this._properties[property];
            if (!(result instanceof Array)) {
                result = [result];
            }
            return result;
        }
        return [];
    };

    /**
     * Gets the first child of the specified property
     */
    Point.prototype.first = function(property) {
        if (property in this._properties) {
            var result = this._properties[property];
            if (result instanceof Array) {
                result = result[0];
            }
            return result;
        }
        return null;
    };

    return Point;
};
