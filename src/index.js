/*!
 * Copyright (C) 2017 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-reflection/graphs/contributors
 * @url http://glayzzle.com
 */
'use strict';

/**
 * An index storage
 */
var index = function(db, id) {
    this.db = db;
    this.id = id;
    this.index = {};
    this.length = 0;
    this.changed = false;
};

/**
 * Exports the index
 */
index.prototype.export = function() {
    this.changed = false;
    return [
        this.length,
        this.index
    ];
};

/**
 * Imports the index
 */
index.prototype.import = function(data) {
    this.length = data[0];
    this.index = data[1];
    this.changed = false;
};

/**
 * Indexing the specified value
 */
index.prototype.add = function(key, value, point) {
    if (!(key in this.index)) {
        this.index[key] = {};
    }
    if (!(value in this.index[key])) {
        this.index[key][value] = [];
    }
    if (point.uuid) point = point.uuid;
    if (this.index[key][value].indexOf(point) === -1) {
        this.changed = true;
        this.index[key][value].push(point);
        this.length ++;
    }
    return this;
};

/**
 * Removes an entry from index
 */
index.prototype.remove = function(key, value, point) {
    if (key in this.index && value in this.index[key]) {
        if (point.uuid) point = point.uuid;
        var index = this.index[key][value].indexOf(point);
        if (index !== -1) {
            this.changed = true;
            if (this.index[key][value].length === 1) {
                delete this.index[key][value];
            } else {
                this.index[key][value].splice(index, 1);
            }
        }
    }
    return this;
};

/**
 * Retrieves an index values (list of points)
 */
index.prototype.search = function(key, value) {
    if (key in this.index && value in this.index[key]) {
        return this.index[key][value];
    }
    return [];
};

module.exports = index;
