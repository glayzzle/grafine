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
     * Retrieves a list of shards
     */
    Graph.prototype.shards = function() {
        return this._shards;
    };

    /**
     * Retrieves a list of indexes
     */
    Graph.prototype.indexes = function() {
        return this._indexes;
    }

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
            this._indexes[i].each(key, cb);
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
