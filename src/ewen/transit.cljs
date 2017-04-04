(ns ewen.transit
  (:refer-clojure :exclude [integer? uuid uuid?])
  (:require [ewen.transit.impl.writer-object-builder]
            [ewen.transit.impl.writer-unpack]
            [ewen.transit.impl.decoder-builders]
            [ewen.transit.cljs-handlers]
            [ewen.transit.impl.cljs-handlers]
            [ewen.transit.types :as ty]
            [ewen.transit.impl.reader :as reader]
            [ewen.transit.impl.writer :as writer]
            [goog.object :as o])
  (:import [goog.math Long]))

(extend-protocol IEquiv
  Long
  (-equiv [this other]
    (.com$cognitect$transit$equals this other))

  ty/TaggedValue
  (-equiv [this other]
    (.com$cognitect$transit$equals this other)))

(extend-protocol IHash
  Long
  (-hash [this]
    (.com$cognitect$transit$hashCode this))

  ty/TaggedValue
  (-hash [this]
    (.com$cognitect$transit$hashCode this)))

(defn reader
  "Return a transit reader. type may be either :json or :json-verbose.
   opts may be a map optionally containing a :handlers entry. The value
   of :handlers should be map from tag to a decoder function which returns
   then in-memory representation of the semantic transit value."
  ([type] (reader type nil))
  ([type opts]
   (let [type (name type)
         handlers (:handlers opts)
         opts (clj->js (or opts #js {}))]
     (if (or (= type "json") (= type "json-verbose") (nil? type))
       (reader/Reader. (reader/JSONUnmarshaller. opts)  opts)
       (throw (js/Error. (str "Cannot create reader of type " type)))))))

(defn read
  "Read a transit encoded string into ClojureScript values given a 
   transit reader."
  [r str]
  (.read r str))

(defn writer
  "Return a transit writer. type maybe either :json or :json-verbose.
  opts is a map containing a :handlers entry. :handlers is a map of
  type constructors to handler instances."
  ([type] (writer type nil))
  ([type opts]
   (let [type (name type)
         handlers (:handlers opts)
         opts (or (clj->js (dissoc opts :handlers)) #js {})]
     (o/set opts "handlers" handlers)
     (if (or (= type "json") (= type "json-verbose") (nil? type))
       (do (when (= type "json-verbose")
             (o/set opts "verbose" true))
           (writer/Writer. (writer/JSONMarshaller. opts) opts))
       (let [err (js/Error. "Type must be \"json\"")]
         (o/set err "data" #js {:type type})
         (throw err))))))

(defn write
  "Encode an object into a transit string given a transit writer."
  [w o]
  (.write w o))

(defn read-handler
  "Construct a read handler. Implemented as identity, exists primarily
   for API compatiblity with transit-clj"
  [from-rep]
  from-rep)

(defn write-handler
  "Creates a transit write handler whose tag, rep,
   stringRep, and verboseWriteHandler methods
   invoke the provided fns."
  ([tag-fn rep-fn]
     (write-handler tag-fn rep-fn nil nil))
  ([tag-fn rep-fn str-rep-fn]
     (write-handler tag-fn rep-fn str-rep-fn nil))
  ([tag-fn rep-fn str-rep-fn verbose-handler-fn]
     (reify
       Object
       (tag [_ o] (tag-fn o))
       (rep [_ o] (rep-fn o))
       (stringRep [_ o] (when str-rep-fn (str-rep-fn o)))
       (getVerboseHandler [_] (when verbose-handler-fn (verbose-handler-fn))))))

;; =============================================================================
;; Constructors & Predicates

(defn tagged-value
  "Construct a tagged value. tag must be a string and rep can
   be any transit encodeable value."
  [tag rep]
  (ty/taggedValue tag rep))

(defn tagged-value?
  "Returns true if x is a transit tagged value, false otherwise."
  [x]
  (ty/isTaggedValue x))

(defn integer
  "Construct a transit integer value. Returns JavaScript number if
  in the 53bit integer range, a goog.math.Long instance if above. s
  may be a string or a JavaScript number."
  [s]
  (ty/intValue s))

(defn integer?
  "Returns true if x is an integer value between the 53bit and 64bit
  range, false otherwise."
  [x]
  (ty/isInteger x))

(defn bigint
  "Construct a big integer from a string."
  [s]
  (ty/bigInteger s))

(defn bigint?
  "Returns true if x is a transit big integer value, false otherwise."
  [x]
  (ty/isBigInteger x))

(defn bigdec
  "Construct a big decimal from a string."
  [s]
  (ty/bigDecimalValue s))

(defn bigdec?
  "Returns true if x is a transit big decimal value, false otherwise."
  [x]
  (ty/isBigDecimal x))

(defn uri
  "Construct a URI from a string."
  [s]
  (ty/uri s))

(defn uri?
  "Returns true if x is a transit URI value, false otherwise."
  [x]
  (ty/isURI x))

(defn binary
  "Construct a transit binary value. s should be base64 encoded
   string."
  [s]
  (ty/binary s))

(defn binary?
  "Returns true if x is a transit binary value, false otherwise."
  [x]
  (ty/isBinary x))

(defn quoted
  "Construct a quoted transit value. x should be a transit
   encodeable value."
  [x]
  (ty/quoted x))

(defn quoted?
  "Returns true if x is a transit quoted value, false otherwise."
  [x]
  (ty/isQuoted x))

(defn link
  "Construct a transit link value. x should be an IMap instance
   containing at a minimum the following keys: :href, :rel. It
   may optionall include :name, :render, and :prompt. :href must
   be a transit URI, all other values are strings, and :render must
   be either :image or :link."
  [x]
  (ty/link x))

(defn link?
  "Returns true if x a transit link value, false if otherwise."
  [x]
  (ty/isLink x))


(defn roundtrip [x]
  (let [w (writer :json)
        r (reader :json)]
    (read r (write w x))))

(defn test-roundtrip []
  (let [list1 [:red :green :blue]
        list2 [:apple :pear :grape]
        data  {(integer 1) list1
               (integer 2) list2}
        data' (roundtrip data)]
    (assert (= data data'))))


#_(test-roundtrip)
#_(str (dissoc (assoc {:e "e"} 4 3) 't))
#_#{:e "e"}

