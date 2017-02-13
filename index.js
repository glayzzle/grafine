/*!
 * Copyright (C) 2017 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-reflection/graphs/contributors
 * @url http://glayzzle.com
 */
'use strict';

/**
 * Public classes (exposed in order to be extended)
 */
module.exports = {
    graph: null,
    index: null,
    point: null,
    shard: null
};

// retrieves definitions
module.exports.graph = require('./src/graph')(module.exports);
module.exports.index = require('./src/index')(module.exports);
module.exports.point = require('./src/point')(module.exports);
module.exports.shard = require('./src/shard')(module.exports);
