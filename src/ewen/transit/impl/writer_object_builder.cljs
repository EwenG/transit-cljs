(ns ewen.transit.impl.writer-object-builder)

(defn object-builder [m kfn vfn]
  (reduce-kv
   (fn [obj k v]
     (doto obj (.push (kfn k) (vfn v))))
   #js ["^ "] m))
