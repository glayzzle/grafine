/*!
 * Copyright (C) 2017 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-reflection/graphs/contributors
 * @url http://glayzzle.com
 */
'use strict';

var point = require('./point');

/**
 * A shard storage
 */
var shard = function(db, id) {
    this.db = db;
    this.id = id;
    this.points = {};
    this.length = 0;
    this.changed = false;
};


/**
 * Export all nodes as a plain object
 */
shard.prototype.export = function() {
    var nodes = {};
    for(var uuid in this.points) {
        nodes[uuid] = this.points[uuid].export();
    }
    this.changed = false;
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
    this.changed = false;
    return this;
};

/**
 * Factory function
 */
shard.prototype.attach = function(object) {
    this.points[object.uuid] = object;
    this.length ++;
    this.changed = true;
    return this;
};


/**
 * Factory function
 */
shard.prototype.remove = function(point) {
    if (point.uuid) point = point.uuid;
    delete this.points[point];
    this.length --;
    this.changed = true;
    return this;
};

/**
 * Factory function
 */
shard.prototype.factory = function(uuid, object) {
    var result = new point(this.db);
    result.uuid = uuid;
    if (object) {
        result.import(object);
    }
    return result;
};


module.exports = shard;
