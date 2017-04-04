(ns ewen.transit.impl.writer-unpack)

(defn unpack [x]
  (if (instance? cljs.core/PersistentArrayMap x)
    (.-arr x)
    false))
