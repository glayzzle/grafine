/*!
 * Copyright (C) 2017 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-reflection/graphs/contributors
 * @url http://glayzzle.com
 */
'use strict';

var point = require('./point');
var shard = require('./shard');
var index = require('./index');

/**
 * Initialize a storage
 */
var graph = function(hash) {
    this.hash = hash;
    this.uuid = 0;
    this.shards = [];
    this.indexes = [];
};

/**
 * Generate a uuid (autoincrement)
 */
graph.prototype.uuid = function() {
    return ++this.uuid;
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
    return new shard(this, id);
};

/**
 * Retrieves an index shard from the specified key
 */
graph.prototype.index = function(key) {
    var id = 0;
    var size = key.length;
    // if too long truncate in order to maintain a stable speed
    if (size > this.hash) size = this.hash;
    // parsing each letter into the string
    for(var i = 0; i < size; i++) {
        id = (id + key.charCodeAt(i)) % this.hash;
    }
    // create the index if not ready
    if (!this.indexes[id]) {
        this.indexes[id] = this.createIndex(id);
    }
    return this.indexes[id];
};

/**
 * Index factory (lazy loading helper)
 */
graph.prototype.createIndex = function(id) {
    return new index(this, id);
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
        uuid: this.uuid,
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
    this.uuid = data.uuid;
    this.shards = [];
    this.indexes = [];

    // import shards
    if (data.shards && data.shards.length > 0) {
        for(var i = 0, size = data.shards.length; i < size; i++) {
            if (data.shards[i]) {
                this.shards[i] = new shard(this, i);
                this.shards[i].import(data.shards[i]);
            }
        }
    }

    // import indexes
    if (data.indexes && data.indexes.length > 0) {
        for(var i = 0, size = data.indexes.length; i < size; i++) {
            if (data.indexes[i]) {
                this.indexes[i] = new index(this, i);
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
    if (!result) {
        result = new point(this);
    }
    // attach it to a shard
    var uuid = this.uuid();
    this.shard(uuid).push(uuid, result);
    return result;
};

/**
 * Proceed to a multicriteria search
 */
graph.prototype.search = function(criteria) {
    var results = [];
    // preparing results
    for(var k in criteria) {
        if (k in this.index) {
            var hashes = this.index[k];
            var check = criteria[k];
            if (typeof check === 'function') {
                for(var i in hashes) {
                    if (check(i) === true) {
                        results.push(hashes[i]);
                    }
                }
            } else {
                if (check in hashes) {
                    results.push(hashes[check]);
                }
            }
        } else return []; // nobody matches
    }
    if (results.length === 1) {
        return results[0].filter(function(item) {
          return item != undefined;
        });
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

module.exports = graph;
