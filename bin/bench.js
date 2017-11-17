/*!
 * Copyright (C) 2017 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-reflection/graphs/contributors
 * @url http://glayzzle.com
 */
'use strict';

var grafine = require('../index');
var db = new grafine.graph(255);

var start = (new Date().getTime());
var elapsed_time = function(note, counter){
    // divide by a million to get nano to milli
    var elapsed = (new Date().getTime()) - start;
    var mem = process.memoryUsage();
    note += '\tin\t' + elapsed + "ms \t" + Math.round(mem.heapUsed / 1024 / 1024) + 'Mb';
    if (counter) {
        note += '\t' + Math.round(counter / elapsed * 1000) + '/sec';
    }
    console.log(note);
    start = (new Date().getTime()); // reset the timer
};

// writing tests
var last;
var size = process.argv.length === 3 ? process.argv[2] : 40000;
for(var i = 0; i < size; i++) {
    var node = db.create();
    node.index('name', i % 30); // (i % 54321).toString(36));
    node.index('type', i % 60); // (i % 12345).toString(36));
    if (i % 5 === 0) {
        if (last) {
            node.set('foo', last);
            node.set('bar', last);
            node.add('baz', last);
        }
    }
    if (i % 10 === 0) last = node;
}
elapsed_time('Create ' + size +  ' items', size);

// deleting items
var records = 10000;
var idx = 0;
for(var x = 0; x < 2; x++) {
    for(var i = 0; i < records; i++) {
        var record = db.get(++idx);
        if (record) {
            record.delete();
        } else {
            console.log('Not found', idx);
        }
    }
    elapsed_time(x + '. Deleted ' + records +  ' items', records);
    for(var i = 0; i < records; i++) {
        var node = db.create();
        node.index('name', i % 30);
        node.index('type', i % 60);
        if (i % 5 === 0) {
            if (last) {
                node.set('foo', last);
                node.set('bar', last);
                node.add('baz', last);
            }
        }
        if (i % 10 === 0) last = node;
    }
    // check memory liberation
    elapsed_time(x + '. Create ' + records +  ' items', records);
}

// searching tests
var search = 10;
var records = 0;
for(var i = 0; i < search; i++) {
    var found = db.search({
        name: i % 30,
        type: i % 60
    });
    records += found.length;
}
elapsed_time('Found ' + records +  ' items', records);
var data = db.export();
elapsed_time('Export ' + db.size() +  ' items', db.size());
db.import(data);
elapsed_time('Import ' + db.size() +  ' items', db.size());
// searching tests
search = 10;
records = 0;
for(var i = 0; i < search; i++) {
    var found = db.search({
        name: i % 10,
        type: i % 20
    });
    records += found.length;
}
elapsed_time('Found ' + records +  ' items', records);

// searching tests
search = 10;
records = 0;
for(var i = 0; i < search; i++) {
    var found = db.search({
        name: (i % 5) + '%',
        type: (i % 20) + '~'
    });
    records += found.length;
}
elapsed_time('Begin with ' + records +  ' items', records);

console.log('---------------------------');
console.log('Estimated size', Math.round(
  JSON.stringify(data).length / 1024 / 1024 * 10
) / 10, 'Mb\n');
