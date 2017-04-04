(ns ewen.transit.impl.decoder-builders)

(deftype ^:no-doc MapBuilder []
  Object
  (init [_ node] (transient {}))
  (add [_ m k v node] (assoc! m k v))
  (finalize [_ m node] (persistent! m))
  (fromArray [_ arr node] (cljs.core/PersistentArrayMap.fromArray arr true true)))

(deftype ^:no-doc VectorBuilder []
  Object
  (init [_ node] (transient []))
  (add [_ v x node] (conj! v x))
  (finalize [_ v node] (persistent! v))
  (fromArray [_ arr node] (cljs.core/PersistentVector.fromArray arr true)))
