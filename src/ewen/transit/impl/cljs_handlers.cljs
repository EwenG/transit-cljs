(ns ewen.transit.impl.cljs-handlers)

(defn cmap-handler [v]
  (loop [i 0 ret (transient {})]
    (if (< i (alength v))
      (recur (+ i 2)
             (assoc! ret (aget v i) (aget v (inc i))))
      (persistent! ret))))
