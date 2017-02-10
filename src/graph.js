/*!
 * Copyright (C) 2017 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-reflection/graphs/contributors
 * @url http://glayzzle.com
 */
'use strict';

var point = require('./point');

/**
 * Initialize a storage
 */
var graph = function() {
    this.points = [];
    this.index = {};
    this.length = 0;
    this.gaps = 0;
};

/**
 * Export all nodes as a plain object
 */
graph.prototype.export = function() {
    this.reindex();
    var nodes = [];
    for(var i = 0; i < this.points.length; i++) {
        nodes.push(this.points[i].export());
    }
    return nodes;
};

/**
 * Importing all nodes
 */
graph.prototype.import = function(points) {
    // initialize the context
    this.gaps = 0;
    this.length = points.length;
    this.points = [];
    this.index = {};
    // create points
    for(var i = 0, size = this.length; i < size; i++) {
        var node = this.factory(points[i]);
        this.points.push(node);
        // indexing
        var indexes = points[i]._i;
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
    // link points
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
 * Create a node
 */
graph.prototype.create = function(result) {
    if (!result) {
        result = new point(this);
    }
    this.points.push(result);
    this.length ++;
    return result;
};
/**
 * Cleanup gaps
 */
graph.prototype.reindex = function() {
    if (this.gaps === 0) return this;
    var index = {};
    this.points = this.points.filter(function(item) {
      if (item != undefined) {
          for(var i = 0; i < item.indexes.length; i++) {
              var key = item.indexes[i];
              if (!(key[0] in index)) {
                  index[key[0]] = {};
              }
              if (!(key[1] in index[key[0]])) {
                  index[key[0]][key[1]] = [];
              }
              index[key[0]][key[1]].push(item);
          };
          return true;
      }
      return false;
    });
    this.index = index;
    this.gaps = 0;
    return this;
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
