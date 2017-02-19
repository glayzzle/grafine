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
