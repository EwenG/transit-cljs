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

goog.provide("ewen.transit.types");
goog.require("ewen.transit.util");
goog.require("goog.math.Long");
goog.require("cljs.core");

goog.scope(function() {

    var types = ewen.transit.types,
        util  = ewen.transit.util,
        Long  = goog.math.Long;

    if(typeof Symbol != "undefined") {
        types.ITERATOR = Symbol.iterator;
    } else {
        types.ITERATOR = "@@iterator";
    }

    /**
     * @constructor
     */
    types.TaggedValue = function Transit$TaggedValue(tag, rep) {
        this.tag = tag;
        this.rep = rep;
        this.hashCode = -1;
    };

    types.TaggedValue.prototype.toString = function() {
        return "[TaggedValue: " + this.tag + ", " + this.rep + "]";
    };

    types.TaggedValue.prototype.com$cognitect$transit$equals = function(other) {
        if(other instanceof types.TaggedValue) {
            return (this.tag === other.tag) && (cljs.core._EQ_(this.rep, other.rep));
        } else {
            return false;
        }
    };

    types.TaggedValue.prototype.com$cognitect$transit$hashCode = function() {
        if(this.hashCode === -1) {
            this.hashCode = cljs.core.hash_combine(cljs.core.__hash(this.tag), cljs.core.__(this.rep));
        }
        return this.hashCode;
    };

    types.taggedValue = function(tag, rep) {
        return new types.TaggedValue(tag, rep);
    };

    types.isTaggedValue = function(x) {
        return x instanceof types.TaggedValue;
    };

    types.nullValue = function() {
        return null;
    };

    types.boolValue = function(s) {
        return s === "t";
    };

    types.MAX_INT = Long.fromString("9007199254740991");
    types.MIN_INT = Long.fromString("-9007199254740991");

    types.intValue = function(s) {
        if(typeof s === "number") {
            return s;
        } else if(s instanceof Long) {
            return s;
        } else {
            var n = Long.fromString(s, 10);
            if(n.greaterThan(types.MAX_INT) ||
                n.lessThan(types.MIN_INT)) {
                return n;
            } else {
                return n.toNumber();
            }
        }
    };

    Long.prototype.com$cognitect$transit$equals = function(other) {
        return (other instanceof Long) && this.equals(other);
    };

    Long.prototype.com$cognitect$transit$hashCode = function() {
        return this.toInt();
    };

    types.isInteger = function(x) {
        if(x instanceof Long) {
            return true;
        } else {
            return (typeof x === "number") && !isNaN(x) && !(x === Infinity) && (parseFloat(x) === parseInt(x, 10));
        }
    };

    types.floatValue = function(s) {
        return parseFloat(s);
    };

    types.bigInteger = function(s) {
        return types.taggedValue("n", s);
    };

    types.isBigInteger = function(x) {
        return (x instanceof types.TaggedValue) && (x.tag === "n");
    };

    types.bigDecimalValue = function(s) {
        return types.taggedValue("f", s);
    };

    types.isBigDecimal = function(x) {
        return (x instanceof types.TaggedValue) && (x.tag === "f");
    };

    types.charValue = function(s) {
        return s;
    };

    types.date = function(s) {
        s = typeof s === "number" ? s : parseInt(s, 10);
        return new Date(s);
    };

    types.verboseDate = function(s) {
        return new Date(s);
    };

    /**
     * @param {string} str
     * @param {*=} decoder
     * @returns {ewen.transit.types.TaggedValue|Uint8Array}
     */
    types.binary = function(str, decoder) {
        if((!decoder || (decoder.preferBuffers !== false)) && (typeof Buffer != "undefined")) {
            return new Buffer(str, "base64");
        } else if(typeof Uint8Array != "undefined") {
            return util.Base64ToUint8(str);
        } else {
            return types.taggedValue("b", str);
        }
    };

    types.isBinary = function(x) {
        if((typeof Buffer != "undefined") && (x instanceof Buffer)) {
            return true;
        } else if((typeof Uint8Array != "undefined") && (x instanceof Uint8Array)) {
            return true;
        } else {
            return (x instanceof types.TaggedValue) && (x.tag === "b");
        }
    };

    types.uri = function(s) {
        return types.taggedValue("r", s);
    };

    types.isURI = function(x) {
        return (x instanceof types.TaggedValue) && (x.tag === "r");
    };

    types.quoted = function(obj) {
        return types.taggedValue("'", obj);
    };

    types.isQuoted = function(x) {
        return (x instanceof types.TaggedValue) && (x.tag === "'");
    };

    types.link = function(rep) {
        return types.taggedValue("link", rep);
    };

    types.isLink = function(x) {
        return (x instanceof types.TaggedValue) && (x.tag === "link")
    };

    types.specialDouble = function(v) {
        switch(v) {
            case "-INF":
                return -Infinity;
            case "INF":
                return Infinity;
            case "NaN":
                return NaN;
            default:
                throw new Error("Invalid special double value " + v);
                break;
        }
    };

});

