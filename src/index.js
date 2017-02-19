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
        this._index = {};
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
        return [
            this._size,
            this._index
        ];
    };

    /**
     * Imports the index
     */
    Index.prototype.import = function(data) {
        this._size = data[0];
        this._index = data[1];
        this._changed = false;
        return this;
    };

    /**
     * Indexing the specified value
     */
    Index.prototype.add = function(key, value, point) {
        if (!(key in this._index)) {
            this._index[key] = {};
        }
        if (!(value in this._index[key])) {
            this._index[key][value] = [];
        }
        if (point.uuid) point = point.uuid;
        if (this._index[key][value].indexOf(point) === -1) {
            this._index[key][value].push(point);
            this._changed = true;
            this._size ++;
        }
        return this;
    };

    /**
     * Removes an entry from index
     */
    Index.prototype.remove = function(key, value, point) {
        if (key in this._index && value in this._index[key]) {
            if (point.uuid) point = point.uuid;
            var index = this._index[key][value].indexOf(point);
            if (index !== -1) {
                if (this._index[key][value].length === 1) {
                    delete this._index[key][value];
                } else {
                    this._index[key][value].splice(index, 1);
                }
                this._changed = true;
                this._size --;
            }
        }
        return this;
    };

    /**
     * Retrieves an index values (list of points)
     */
    Index.prototype.search = function(key, value) {
        if (key in this._index && value in this._index[key]) {
            return this._index[key][value];
        }
        return [];
    };

    /**
     * Iterate over a list of items
     */
    Index.prototype.each = function(key, cb) {
        if (key in this._index) {
            var entries = this._index[key];
            for(var k in entries) {
                cb(k, entries[k]);
            }
        }
        return this;
    };

    return Index;
};
