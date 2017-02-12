/*!
 * Copyright (C) 2017 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-reflection/graphs/contributors
 * @url http://glayzzle.com
 */
'use strict';

/**
 * A shard storage
 */
var shard = function(db, id) {
    this.db = db;
    this.id = id;
    this.points = {};
    this.length = 0;
};


/**
 * Export all nodes as a plain object
 */
shard.prototype.export = function() {
    var nodes = {};
    for(var uuid in this.points) {
        nodes[uuid] = this.points[uuid].export();
    }
    return nodes;
};

/**
 * Importing all nodes
 */
shard.prototype.import = function(points) {
    // initialize the context
    this.length = 0;
    this.points = {};
    this.index = {};
    // create points
    for(var uuid in points) {
        var node = this.factory(points[uuid]);
        this.points[uuid] = node;
        this.length ++;
        // indexing
        var indexes = points[uuid]._i;
        for(var j = 0; j < indexes.length; j++) {
            var index = indexes[j];
            if (!(index[0] in this.index)) {
                this.index[index[0]] = {};
                this.index[index[0]][index[1]] = [];
            } else if (!(index[1] in this.index[index[0]])) {
                this.index[index[0]][index[1]] = [];
            }
            this.index[index[0]][index[1]].push(node);
        }
    }
    // -- link points
    for(var i = 0, size = this.length; i < size; i++) {
        var props = points[i]._p;
        for(var k in props) {
            var relations = props[k];
            if (typeof relations === 'number') {
                this.points[i].properties[k] = this.points[relations];
                if (!(k in this.points[relations].related)) {
                    this.points[relations].related[k] = [];
                }
                this.points[relations].related[k].push(this.points[i]);
            } else {
                this.points[i].properties[k] = [];
                for(var j = 0; j < relations.length; j++) {
                    var target = this.points[relations[j]];
                    this.points[i].properties[k].push(target);
                    if (!(k in this.points[relations[j]].related)) {
                        this.points[relations[j]].related[k] = [];
                    }
                    this.points[relations[j]].related[k].push(this.points[i]);
                }
            }
        }
    }

    return this;
};

/**
 * Factory function
 */
graph.prototype.factory = function(object) {
    return new point(this);
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

module.exports = shard;
