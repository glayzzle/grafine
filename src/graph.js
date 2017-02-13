/*!
 * Copyright (C) 2017 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-reflection/graphs/contributors
 * @url http://glayzzle.com
 */
'use strict';

module.exports = function(grafine) {

    /**
     * Initialize a storage
     */
    var graph = function(hash) {
        if (!hash) hash = 255;
        this.hash = hash;
        this.nextId = 0;
        this.shards = [];
        this.indexes = [];
    };

    /**
     * Calculate the number of nodes
     */
    graph.prototype.size = function() {
        var size = 0;
        for(var i = 0; i < this.shards.length; i++) {
            if (this.shards[i]) {
                size += this.shards[i].length;
            }
        }
        return size;
    };

    /**
     * Generate a uuid (autoincrement)
     */
    graph.prototype.uuid = function() {
        return ++this.nextId;
    };

    /**
     * Retrieves a shard from the specified uuid
     */
    graph.prototype.shard = function(uuid) {
        var id = uuid % this.hash;
        if (!this.shards[id]) {
            this.shards[id] = this.createShard(id);
        }
        return this.shards[id];
    };

    /**
     * Shard factory (lazy loading helper)
     */
    graph.prototype.createShard = function(id) {
        return new grafine.shard(this, id);
    };

    /**
     * Retrieves an index shard from the specified key
     */
    graph.prototype.getIndex = function(key) {
        var id = 0;
        if (typeof key === 'number') {
            id = key % this.hash;
        } else {
            var size = key.length;
            // if too long truncate in order to maintain a stable speed
            if (size > this.hash) size = this.hash;
            // parsing each letter into the string
            for(var i = 0; i < size; i++) {
                id = (id + key.charCodeAt(i)) % this.hash;
            }
        }
        // create the index if not ready
        if (!this.indexes[id]) {
            this.indexes[id] = this.createIndex(id);
        }
        return this.indexes[id];
    };

    /**
     * Retrieves an index shard from the specified key
     */
    graph.prototype.index = function(key, value, point) {
        var result = this.getIndex(value);
        result.add(key, value, point);
        return this;
    };

    /**
     * Retrieves an point from the specified uuid
     */
    graph.prototype.get = function(uuid) {
        return this.shard(uuid).points[uuid];
    };

    /**
     * Removes the specified entry from index
     */
    graph.prototype.removeIndex = function(key, value, point) {
        var result = this.getIndex(value);
        result.remove(key, value, point);
        return this;
    };

    /**
     * Index factory (lazy loading helper)
     */
    graph.prototype.createIndex = function(id) {
        return new grafine.index(this, id);
    };

    /**
     * Export all nodes as a plain object
     */
    graph.prototype.export = function() {
        var shards = [], indexes = [];
        for(var i = 0; i < this.shards.length; i++) {
            shards.push(this.shards[i] ? this.shards[i].export() : null);
        }
        for(var i = 0; i < this.indexes.length; i++) {
            indexes.push(this.indexes[i] ? this.indexes[i].export() : null);
        }
        return {
            hash: this.hash,
            uuid: this.nextId,
            shards: shards,
            indexes: indexes
        };
    };

    /**
     * Importing all nodes
     */
    graph.prototype.import = function(data) {

        // initialize the context
        this.hash = data.hash;
        this.nextId = data.uuid;
        this.shards = [];
        this.indexes = [];

        // import shards
        if (data.shards && data.shards.length > 0) {
            for(var i = 0, size = data.shards.length; i < size; i++) {
                if (data.shards[i]) {
                    this.shards[i] = new grafine.shard(this, i);
                    this.shards[i].import(data.shards[i]);
                }
            }
        }

        // import indexes
        if (data.indexes && data.indexes.length > 0) {
            for(var i = 0, size = data.indexes.length; i < size; i++) {
                if (data.indexes[i]) {
                    this.indexes[i] = new grafine.index(this, i);
                    this.indexes[i].import(data.indexes[i]);
                }
            }
        }

        // job is done
        return this;
    };

    /**
     * Create a node
     */
    graph.prototype.create = function(result) {
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
    graph.prototype.search = function(criteria) {
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

    return graph;
};
