/*! grafine - BSD3 License - 2017-02-19 */

require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * Copyright (C) 2017 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-reflection/graphs/contributors
 * @url http://glayzzle.com
 */
'use strict';

module.exports = function(grafine) {

    /**
     * Initialize a storage
     * @constructor Graph
     */
    var Graph = function (hash, capacity) {
        if (!hash) hash = 255;
        if (!capacity) capacity = hash * 4;
        this._hash = hash;
        this._capacity = capacity;
        this._nextId = 0;
        this._shards = [];
        this._indexes = [];
    };

    /**
     * Calculate the number of nodes
     */
    Graph.prototype.size = function() {
        var size = 0;
        for(var i = 0; i < this._shards.length; i++) {
            if (this._shards[i]) {
                size += this._shards[i]._size;
            }
        }
        return size;
    };

    /**
     * Generate a uuid (autoincrement)
     */
    Graph.prototype.uuid = function() {
        return ++this._nextId;
    };

    /**
     * Retrieves a shard from the specified uuid
     */
    Graph.prototype.shard = function(uuid) {
        // hashing function take in account capacity in order
        // to avoid spreading related nodes between too many shards
        var id = ((uuid - (uuid % this._capacity)) / this._capacity) % this._hash;
        if (!this._shards[id]) {
            this._shards[id] = this.createShard(id);
        }
        return this._shards[id];
    };

    /**
     * Shard factory (lazy loading helper)
     */
    Graph.prototype.createShard = function(id) {
        return new grafine.shard(this, id);
    };

    /**
     * Retrieves an index shard from the specified key
     */
    Graph.prototype.getIndex = function(key) {
        var id = 0;
        if (typeof key === 'number') {
            id = key % this._hash;
        } else {
            var size = key.length;
            // if too long truncate in order to maintain a stable speed
            if (size > this._hash) size = this._hash;
            // parsing each letter into the string
            for(var i = 0; i < size; i++) {
                id = (id + key.charCodeAt(i)) % this._hash;
            }
        }
        // create the index if not ready
        if (!this._indexes[id]) {
            this._indexes[id] = this.createIndex(id);
        }
        return this._indexes[id];
    };

    /**
     * Retrieves each index entry
     */
    Graph.prototype.readIndex = function(key, cb) {
        for(var i = 0; i < this._hash; i++) {
            if (!this._indexes[i]) {
                this._indexes[i] = this.createIndex(i);
            }
            if (key in this._indexes[i]) {
              cb(this._indexes[i][k]);
            }
        }
        return this;
    };

    /**
     * Retrieves an index shard from the specified key
     */
    Graph.prototype.index = function(key, value, point) {
        var result = this.getIndex(value);
        result.add(key, value, point);
        return this;
    };

    /**
     * Retrieves an point from the specified uuid
     */
    Graph.prototype.get = function(uuid) {
        return this.shard(uuid).get(uuid);
    };

    /**
     * Retrieves an point from the specified uuid
     */
    Graph.prototype.resolve = function(data) {
        if (Array.isArray(data)) {
            var result = [];
            for(var i = 0; i < data.length; i++) {
                var item = this.get(data[i]);
                if (item) {
                    result.push(item);
                }
            }
            return result;
        }
        if (typeof data === 'number') {
            return this.get(data);
        }
        return null;
    };

    /**
     * Removes the specified entry from index
     */
    Graph.prototype.removeIndex = function(key, value, point) {
        var result = this.getIndex(value);
        result.remove(key, value, point);
        return this;
    };

    /**
     * Index factory (lazy loading helper)
     */
    Graph.prototype.createIndex = function(id) {
        return new grafine.index(this, id);
    };

    /**
     * Export all nodes as a plain object
     */
    Graph.prototype.export = function() {
        var shards = [], indexes = [];
        for(var i = 0; i < this._shards.length; i++) {
            shards.push(this._shards[i] ? this._shards[i].export() : null);
        }
        for(var i = 0; i < this._indexes.length; i++) {
            indexes.push(this._indexes[i] ? this._indexes[i].export() : null);
        }
        return {
            hash: this._hash,
            capacity: this._capacity,
            uuid: this._nextId,
            shards: shards,
            indexes: indexes
        };
    };

    /**
     * Importing all nodes
     */
    Graph.prototype.import = function(data) {

        // initialize the context
        this._hash = data.hash;
        this._capacity = data.capacity;
        this._nextId = data.uuid;
        this._shards = [];
        this._indexes = [];

        // import shards
        if (data.shards && data.shards.length > 0) {
            for(var i = 0, size = data.shards.length; i < size; i++) {
                if (data.shards[i]) {
                    this._shards[i] = new grafine.shard(this, i);
                    this._shards[i].import(data.shards[i]);
                }
            }
        }

        // import indexes
        if (data.indexes && data.indexes.length > 0) {
            for(var i = 0, size = data.indexes.length; i < size; i++) {
                if (data.indexes[i]) {
                    this._indexes[i] = new grafine.index(this, i);
                    this._indexes[i].import(data.indexes[i]);
                }
            }
        }

        // job is done
        return this;
    };

    /**
     * Create a node
     */
    Graph.prototype.create = function(result) {
        var uuid = this.uuid();
        var shard = this.shard(uuid);
        if (!result) {
            result = shard.factory(uuid);
        } else {
            result.uuid = uuid;
        }
        // attach it to a shard
        shard.attach(result);
        return result;
    };

    /**
     * Proceed to a multicriteria search
     */
    Graph.prototype.search = function(criteria) {
        var results = [];
        // preparing results
        for(var k in criteria) {
            var check = criteria[k];
            results.push(
                this.getIndex(check).search(k, check)
            );
        }
        if (results.length === 1) {
            return results[0];
        }
        // intersect results (quick & dirty / may improve)
        var data = [];
        for(var s = 0; s < results.length; s++) {
            var set = results[s];
            for(var i = 0, size = set.length; i < size; i++) {
                var miss = false;
                var item = set[i];
                if (!item) continue;
                // scan other sets to check if exists
                for(var j = 0; j < results.length; j++) {
                    if (j !== s && results[j].indexOf(item) === -1) {
                        miss = true;
                        break;
                    }
                }
                if (!miss) data.push(item);
            }
        }
        return data;
    };

    return Graph;
};

},{}],2:[function(require,module,exports){
/*!
 * Copyright (C) 2017 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-reflection/graphs/contributors
 * @url http://glayzzle.com
 */
'use strict';

module.exports = function(grafine) {

    /**
     * An index storage
     * @constructor Index
     */
    var Index = function(db, id) {
        this._db = db;
        this._id = id;
        this._index = new Map();
        this._size = 0;
        this._changed = false;
    };

    /**
     * Check if current index contains changes
     * @return {Boolean}
     */
    Index.prototype.isChanged = function() {
        return this._changed;
    };


    /**
     * Gets number of indexed items
     * @return {Number}
     */
    Index.prototype.getSize = function() {
        return this._size;
    };

    /**
     * Exports the index
     */
    Index.prototype.export = function() {
        this._changed = false;
        var toJson = [], k, v, key, value, inner;
        for([key, value] of this._index) {
            if (value) {
                inner = [];
                for([k, v] of value) {
                    if (v && v.length > 0) {
                        inner.push([k, v]);
                    }
                }
                toJson.push([key, inner]);
            }
        }
        return [
            this._size,
            toJson
        ];
    };

    /**
     * Imports the index
     */
    Index.prototype.import = function(data) {
        this._size = data[0];
        var indexMap = [];
        for(var i = 0; i < data[1].length; i++) {
            indexMap.push(
                [
                    data[1][i][0],          // key
                    new Map(data[1][i][1])  // value
                ]
            );
        }
        this._index = new Map(indexMap);
        this._changed = false;
        return this;
    };

    /**
     * Indexing the specified value
     */
    Index.prototype.add = function(key, value, point) {
        var values = this._index.get(key);
        if (!values) {
            values = new Map();
            this._index.set(key, values);
        }
        var indexes = values.get(value);
        if (!indexes) {
            indexes = [];
            values.set(value, indexes);
        }
        if (point.uuid) point = point.uuid;
        if (indexes.indexOf(point) === -1) {
            indexes.push(point);
            this._changed = true;
            this._size ++;
        }
        return this;
    };

    /**
     * Removes an entry from index
     */
    Index.prototype.remove = function(key, value, point) {
        var values = this._index.get(key);
        if (values) {
            var indexes = values.get(value);
            if (indexes) {
                if (point.uuid) point = point.uuid;
                var index = indexes.indexOf(point);
                if (index !== -1) {
                    if (indexes.length === 1) {
                        values.set(value, null);
                    } else {
                        indexes.splice(index, 1);
                    }
                    this._changed = true;
                    this._size --;
                }
            }
        }
        return this;
    };

    /**
     * Retrieves an index values (list of points)
     */
    Index.prototype.search = function(key, value) {
        var values = this._index.get(key);
        if (values) {
            var indexes = values.get(value);
            if (indexes) {
                return indexes;
            }
        }
        return [];
    };

    /**
     * Iterate over a list of items
     */
    Index.prototype.each = function(key, cb) {
        var values = this._index.get(key), k, v;
        if (values) {
            for([k, v] of values) {
                if (v) {
                    cb(k, v);
                }
            }
        }
        return this;
    };

    return Index;
};

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
/*!
 * Copyright (C) 2017 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-reflection/graphs/contributors
 * @url http://glayzzle.com
 */
'use strict';

module.exports = function(grafine) {

    /**
     * A shard storage (contains a list of grouped points)
     * @constructor Shard
     */
    var Shard = function(db, id) {
        this._db = db;
        this._id = id;
        this._points = {};
        this._size = 0;
        this._changed = false;
    };

    /**
     * Checks is the current shard contains changed nodes
     * @return {Boolean}
     */
    Shard.prototype.isChanged = function() {
        return this._changed;
    };

    /**
     * Gets the number of nodes in current shard
     * @return {Number}
     */
    Shard.prototype.getSize = function() {
        return this._size;
    };

    /**
     * Get a point from specified UUID
     */
    Shard.prototype.get = function(uuid) {
        return this._points[uuid];
    };

    /**
     * Export all nodes as a plain object
     */
    Shard.prototype.export = function() {
        var nodes = {};
        for(var uuid in this._points) {
            nodes[uuid] = this._points[uuid].export();
        }
        this._changed = false;
        return nodes;
    };

    /**
     * Importing all nodes
     */
    Shard.prototype.import = function(points) {
        // initialize the context
        this._size = 0;
        this._points = {};

        // create points
        for(var uuid in points) {
            this._points[uuid] = this.factory(
                uuid, points[uuid]
            );
            this._size ++;
        }
        this._changed = false;
        return this;
    };

    /**
     * Factory function
     */
    Shard.prototype.attach = function(object) {
        this._points[object.uuid] = object;
        this._size ++;
        this._changed = true;
        return this;
    };


    /**
     * Factory function
     */
    Shard.prototype.remove = function(point) {
        if (point.uuid) point = point.uuid;
        delete this._points[point];
        this._size --;
        this._changed = true;
        return this;
    };

    /**
     * Factory function
     */
    Shard.prototype.factory = function(uuid, object) {
        var result = new grafine.point(this._db);
        result.uuid = uuid;
        if (object) {
            result.import(object);
        }
        return result;
    };

    return Shard;
};

},{}],"grafine":[function(require,module,exports){
/*!
 * Copyright (C) 2017 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-reflection/graphs/contributors
 * @url http://glayzzle.com
 */
'use strict';

/**
 * Public classes (exposed in order to be extended)
 */
module.exports = {
    graph: null,
    index: null,
    point: null,
    shard: null
};

// retrieves definitions
module.exports.graph = require('./src/graph')(module.exports);
module.exports.index = require('./src/index')(module.exports);
module.exports.point = require('./src/point')(module.exports);
module.exports.shard = require('./src/shard')(module.exports);

},{"./src/graph":1,"./src/index":2,"./src/point":3,"./src/shard":4}]},{},["grafine"]);
