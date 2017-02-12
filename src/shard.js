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
        this.points[uuid] = this.factory(
            uuid, points[uuid]
        );
        this.length ++;
    }

    return this;
};

/**
 * Factory function
 */
shard.prototype.factory = function(uuid, object) {
    var result = new point(this.db);
    result.import(uuid, object);
    return result;
};


module.exports = shard;
