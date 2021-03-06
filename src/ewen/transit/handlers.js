// Copyright 2014 Cognitect. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide("ewen.transit.handlers");
goog.require("ewen.transit.util");
goog.require("ewen.transit.types");
goog.require("goog.math.Long");
goog.require("cljs.core");
goog.require("ewen.transit.cljs_handlers");

goog.scope(function () {

    var handlers = ewen.transit.handlers,
        util     = ewen.transit.util,
        types    = ewen.transit.types,
        Long     = goog.math.Long;

    handlers.ctorGuid = 0;

    /**
     * @const
     * @type {string}
     */
    handlers.ctorGuidProperty = "transit$guid$" + util.randomUUID();

    handlers.typeTag = function (ctor) {
        if (ctor == null) {
            return "null";
        } else if (ctor === String) {
            return "string";
        } else if (ctor === Boolean) {
            return "boolean";
        } else if (ctor === Number) {
            return "number";
        } else if (ctor === Array) {
            return "array";
        } else if (ctor === Object) {
            return "map";
        } else {
            var tag = ctor[handlers.ctorGuidProperty];
            if (tag == null) {
                if (typeof Object.defineProperty != "undefined") {
                    tag = ++handlers.ctorGuid;
                    Object.defineProperty(ctor, handlers.ctorGuidProperty, {
                        value: tag,
                        enumerable: false
                    });
                } else {
                    ctor[handlers.ctorGuidProperty] = tag = ++handlers.ctorGuid;
                }
            }
            return tag;
        }
    };

    handlers.constructor = function (x) {
        if (x == null) {
            return null;
        } else {
            return x.constructor;
        }
    };

    handlers.padZeros = function (n, m) {
        var s = n.toString();
        for (var i = s.length; i < m; i++) {
            s = "0" + s;
        }
        return s;
    };

    handlers.stringableKeys = function (m) {
        var stringable = false,
            ks = util.objectKeys(m);

        for (var i = 0; i < ks.length; i++) {
        }

        return true;
    };

    /**
     * @constructor
     */
    handlers.NilHandler = function Transit$NilHandler() {
    };
    handlers.NilHandler.prototype.tag = function (v) {
        return "_";
    };
    handlers.NilHandler.prototype.rep = function (v) {
        return null;
    };
    handlers.NilHandler.prototype.stringRep = function (v) {
        return "null";
    };

    /**
     * @constructor
     */
    handlers.StringHandler = function Transit$StringHandler() {
    };
    handlers.StringHandler.prototype.tag = function (v) {
        return "s";
    };
    handlers.StringHandler.prototype.rep = function (v) {
        return v;
    };
    handlers.StringHandler.prototype.stringRep = function (v) {
        return v;
    };

    /**
     * @constructor
     */
    handlers.NumberHandler = function Transit$NumberHandler() {
    };
    handlers.NumberHandler.prototype.tag = function (v) {
        return "i";
    };
    handlers.NumberHandler.prototype.rep = function (v) {
        return v;
    };
    handlers.NumberHandler.prototype.stringRep = function (v) {
        return v.toString();
    };

    /**
     * @constructor
     */
    handlers.IntegerHandler = function Transit$IntegerHandler() {
    };
    handlers.IntegerHandler.prototype.tag = function (v) {
        return "i";
    };
    handlers.IntegerHandler.prototype.rep = function (v) {
        return v.toString();
    };
    handlers.IntegerHandler.prototype.stringRep = function (v) {
        return v.toString();
    };

    /**
     * @constructor
     */
    handlers.BooleanHandler = function Transit$BooleanHandler() {
    };
    handlers.BooleanHandler.prototype.tag = function (v) {
        return "?";
    };
    handlers.BooleanHandler.prototype.rep = function (v) {
        return v;
    };
    handlers.BooleanHandler.prototype.stringRep = function (v) {
        return v.toString();
    };

    /**
     * @constructor
     */
    handlers.ArrayHandler = function Transit$ArrayHandler() {
    };
    handlers.ArrayHandler.prototype.tag = function (v) {
        return "array";
    };
    handlers.ArrayHandler.prototype.rep = function (v) {
        return v;
    };
    handlers.ArrayHandler.prototype.stringRep = function (v) {
        return null;
    };

    /**
     * @constructor
     */
    handlers.MapHandler = function Transit$MapHandler() {
    };
    handlers.MapHandler.prototype.tag = function (v) {
        return "map";
    };
    handlers.MapHandler.prototype.rep = function (v) {
        return v;
    };
    handlers.MapHandler.prototype.stringRep = function (v) {
        return null;
    };

    /**
     * @constructor
     */
    handlers.VerboseDateHandler = function Transit$VerboseDateHandler() {
    };
    handlers.VerboseDateHandler.prototype.tag = function (v) {
        return "t";
    };
    handlers.VerboseDateHandler.prototype.rep = function (v) {
        return v.getUTCFullYear() + "-" + handlers.padZeros(v.getUTCMonth() + 1, 2) + "-" +
            handlers.padZeros(v.getUTCDate(), 2) + "T" + handlers.padZeros(v.getUTCHours(), 2) + ":" +
            handlers.padZeros(v.getUTCMinutes(), 2) + ":" + handlers.padZeros(v.getUTCSeconds(), 2) + "." +
            handlers.padZeros(v.getUTCMilliseconds(), 3) + "Z";
    };
    handlers.VerboseDateHandler.prototype.stringRep = function (v, h) {
        return h.rep(v);
    };

    /**
     * @constructor
     */
    handlers.DateHandler = function Transit$DateHandler() {
    };
    handlers.DateHandler.prototype.tag = function (v) {
        return "m";
    };
    handlers.DateHandler.prototype.rep = function (v) {
        return v.valueOf();
    };
    handlers.DateHandler.prototype.stringRep = function (v) {
        return v.valueOf().toString();
    };
    handlers.DateHandler.prototype.getVerboseHandler = function (v) {
        return new handlers.VerboseDateHandler();
    };

    /**
     * @constructor
     */
    handlers.UUIDHandler = function Transit$UUIDHandler() {
    };
    handlers.UUIDHandler.prototype.tag = function (v) {
        return "u";
    };
    handlers.UUIDHandler.prototype.rep = function (v) {
        return v.uuid;
    };
    handlers.UUIDHandler.prototype.stringRep = function (v, h) {
        return h.rep(v);
    };

    /**
     * @constructor
     */
    handlers.KeywordHandler = function Transit$KeywordHandler() {
    };
    handlers.KeywordHandler.prototype.tag = function (v) {
        return ":";
    };
    handlers.KeywordHandler.prototype.rep = function (v) {
        return v.fqn;
    }; // NOTE: should be fqn
    handlers.KeywordHandler.prototype.stringRep = function (v, h) {
        return h.rep(v);
    };

    /**
     * @constructor
     */
    handlers.SymbolHandler = function Transit$SymbolHandler() {
    };
    handlers.SymbolHandler.prototype.tag = function (v) {
        return "$";
    };
    handlers.SymbolHandler.prototype.rep = function (v) {
        return v.str;
    }; // NOTE: should be str
    handlers.SymbolHandler.prototype.stringRep = function (v, h) {
        return h.rep(v);
    };

    /**
     * @constructor
     */
    handlers.TaggedHandler = function Transit$TaggedHandler() {
    };
    handlers.TaggedHandler.prototype.tag = function (v) {
        return v.tag;
    };
    handlers.TaggedHandler.prototype.rep = function (v) {
        return v.rep;
    };
    handlers.TaggedHandler.prototype.stringRep = function (v, h) {
        return null;
    };

    /**
     * @constructor
     */
    handlers.TransitArrayMapHandler = function Transit$ArrayMapHandler() {
    };
    handlers.TransitArrayMapHandler.prototype.tag = function (v) {
        return "map";
    };
    handlers.TransitArrayMapHandler.prototype.rep = function (v) {
        return v;
    };
    handlers.TransitArrayMapHandler.prototype.stringRep = function (v, h) {
        return null;
    };

    /**
     * @constructor
     */
    handlers.TransitMapHandler = function Transit$MapHandler() {
    };
    handlers.TransitMapHandler.prototype.tag = function (v) {
        return "map";
    };
    handlers.TransitMapHandler.prototype.rep = function (v) {
        return v;
    };
    handlers.TransitMapHandler.prototype.stringRep = function (v, h) {
        return null;
    };

    /**
     * @constructor
     */
    handlers.BufferHandler = function Transit$BufferHandler() {
    };
    handlers.BufferHandler.prototype.tag = function (v) {
        return "b";
    };
    handlers.BufferHandler.prototype.rep = function (v) {
        return v.toString("base64");
    };
    handlers.BufferHandler.prototype.stringRep = function (v, h) {
        return null;
    };

    /**
     * @constructor
     */
    handlers.Uint8ArrayHandler = function Transit$Uint8ArrayHandler() {
    };
    handlers.Uint8ArrayHandler.prototype.tag = function (v) {
        return "b";
    };
    handlers.Uint8ArrayHandler.prototype.rep = function (v) {
        return util.Uint8ToBase64(v);
    };
    handlers.Uint8ArrayHandler.prototype.stringRep = function (v, h) {
        return null;
    };

    handlers.defaultHandlers = function (hs) {
        hs.set(null, new handlers.NilHandler());
        hs.set(String, new handlers.StringHandler());
        hs.set(Number, new handlers.NumberHandler());
        hs.set(Long, new handlers.IntegerHandler());
        hs.set(Boolean, new handlers.BooleanHandler());
        hs.set(Array, new handlers.ArrayHandler());
        hs.set(Object, new handlers.MapHandler());
        hs.set(Date, new handlers.DateHandler());
        hs.set(cljs.core.UUID, new handlers.UUIDHandler());
        hs.set(cljs.core.Keyword, new handlers.KeywordHandler());
        hs.set(cljs.core.Symbol, new handlers.SymbolHandler());
        hs.set(types.TaggedValue, new handlers.TaggedHandler());
        hs.set(cljs.core.PersistentHashSet, new ewen.transit.cljs_handlers.__GT_SetHandler());
        hs.set(cljs.core.PersistentArrayMap, new handlers.TransitArrayMapHandler());
        hs.set(cljs.core.PersistentHashMap, new handlers.TransitMapHandler());

        hs.set(cljs.core.Range, new ewen.transit.cljs_handlers.__GT_ListHandler());
        hs.set(cljs.core.List, new ewen.transit.cljs_handlers.__GT_ListHandler());
        hs.set(cljs.core.Cons, new ewen.transit.cljs_handlers.__GT_ListHandler());
        hs.set(cljs.core.EmptyList, new ewen.transit.cljs_handlers.__GT_ListHandler());
        hs.set(cljs.core.LazySeq, new ewen.transit.cljs_handlers.__GT_ListHandler());
        hs.set(cljs.core.RSeq, new ewen.transit.cljs_handlers.__GT_ListHandler());
        hs.set(cljs.core.IndexedSeq, new ewen.transit.cljs_handlers.__GT_ListHandler());
        hs.set(cljs.core.ChunkedCons, new ewen.transit.cljs_handlers.__GT_ListHandler());
        hs.set(cljs.core.ChunkedSeq, new ewen.transit.cljs_handlers.__GT_ListHandler());
        hs.set(cljs.core.PersistentQueueSeq, new ewen.transit.cljs_handlers.__GT_ListHandler());
        hs.set(cljs.core.PersistentQueue, new ewen.transit.cljs_handlers.__GT_ListHandler());
        hs.set(cljs.core.PersistentArrayMapSeq, new ewen.transit.cljs_handlers.__GT_ListHandler());
        hs.set(cljs.core.PersistentTreeMapSeq, new ewen.transit.cljs_handlers.__GT_ListHandler());
        hs.set(cljs.core.NodeSeq, new ewen.transit.cljs_handlers.__GT_ListHandler());
        hs.set(cljs.core.ArrayNodeSeq, new ewen.transit.cljs_handlers.__GT_ListHandler());
        hs.set(cljs.core.KeySeq, new ewen.transit.cljs_handlers.__GT_ListHandler());
        hs.set(cljs.core.ValSeq, new ewen.transit.cljs_handlers.__GT_ListHandler());

        hs.set(cljs.core.PersistentTreeMap, new handlers.TransitMapHandler());

        hs.set(cljs.core.PersistentTreeSet, new ewen.transit.cljs_handlers.__GT_SetHandler());

        hs.set(cljs.core.PersistentVector, new ewen.transit.cljs_handlers.__GT_VectorHandler());
        hs.set(cljs.core.Subvec, new ewen.transit.cljs_handlers.__GT_VectorHandler());

        if (typeof Buffer != "undefined") {
            hs.set(Buffer, new handlers.BufferHandler());
        }

        if (typeof Uint8Array != "undefined") {
            hs.set(Uint8Array, new handlers.Uint8ArrayHandler());
        }

        return hs;
    };

    /**
     * @constructor
     */
    handlers.Handlers = function Transit$Handlers() {
        this.handlers = {};
        handlers.defaultHandlers(this);
    };

    handlers.Handlers.prototype.get = function (ctor) {
        var h = null;
        if (typeof ctor === "string") {
            h = this.handlers[ctor];
        } else {
            h = this.handlers[handlers.typeTag(ctor)];
        }
        if (h != null) {
            return h;
        } else {
            return this.handlers["default"];
        }
    };
    handlers.Handlers.prototype["get"] = handlers.Handlers.prototype.get;

    handlers.validTag = function (tag) {
        switch (tag) {
            case "null":
            case "string":
            case "boolean":
            case "number":
            case "array":
            case "map":
                return false;
                break;
        }
        return true;
    };

    handlers.Handlers.prototype.set = function (ctor, handler) {
        if (typeof ctor === "string" && handlers.validTag(ctor)) {
            this.handlers[ctor] = handler;
        } else {
            this.handlers[handlers.typeTag(ctor)] = handler;
        }
    };

});    
