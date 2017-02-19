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
