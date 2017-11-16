/*!
 * Copyright (C) 2017 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */

declare module "grafine" {
    export class shard {
        constructor(db: graph, id: Number);
        isChanged(): Boolean;
        getSize(): Number;
        export(): any;
        import(data: any): index;
        get(uuid: Number): point;
        attach(point: point): shard;
        remove(point: point): shard;
        factory(uuid: Number): point;
        factory(uuid: Number, data: any): point;
    }
    export class index {
        constructor(db: graph, id: Number);
        isChanged(): Boolean;
        getSize(): Number;
        export(): any;
        import(data: any): index;
        add(key: String, value: String, point: point): index;
        add(key: String, value: String, uuid: Number): index;
        remove(key: String, value: String, point: point): index;
        remove(key: String, value: String, uuid: Number): index;
        search(key: String, value: String): Number[];
        each(key: String, cb: (value: String, uuid: Number) => void): index;
    }
    export class point {
        uuid: Number;
        constructor(db: graph);
        export(): any;
        import(data: any): point;
        delete(): point;
        removeAttribute(name: String): point;
        removeIndex(name: String): point;
        getIndex(name: String): String;
        index(name: String, value: String): point;
        set(property: String, object: point): point;
        add(property: String, object: point): point;
        get(property: String): Number[];
        first(property: String): Number;
    }
    class ExportStructure {
        hash: Number;
        capacity: Number;
        uuid: Number;
        shards: any[];
        indexes: any[];
    }
    export class graph {
        constructor();
        constructor(shards: Number);
        constructor(shards: Number, capacity: Number);
        size(): Number;
        uuid(): Number;
        shard(uuid: Number): shard;
        createShard(id: Number): shard;
        getIndex(key:String): index;
        readIndex(key: String, cb: (value: String, uuid: Number) => void): graph;
        get(uuid: Number): point;
        resolve(data: Number): point;
        resolve(data: Number[]): point[];
        removeIndex(key: String, value: String, point: point): graph;
        removeIndex(key: String, value: String, uuid: Number): graph;
        createIndex(id: Number): index;
        export(): ExportStructure;
        import(data: ExportStructure): graph;
        create(): point;
        create(point: point): point;
        search(criteria: any): Number[];
        shards(): shard[];
        indexes(): index[];
    }
}
