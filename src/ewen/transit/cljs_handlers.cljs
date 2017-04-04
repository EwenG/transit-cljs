(ns ewen.transit.cljs-handlers
  (:require [ewen.transit.types :as t]))

(deftype ^:no-doc ListHandler []
  Object
  (tag [_ v] "list")
  (rep [_ v]
    (let [ret #js []]
      (doseq [x v] (.push ret x))
      (t/taggedValue "array" ret)))
  (stringRep [_ v] nil))

(deftype ^:no-doc SetHandler []
  Object
  (tag [_ v] "set")
  (rep [_ v]
    (let [ret #js []]
      (doseq [x v] (.push ret x))
      (t/taggedValue "array" ret)))
  (stringRep [v] nil))

(deftype ^:no-doc VectorHandler []
  Object
  (tag [_ v] "array")
  (rep [_ v]
    (let [ret #js []]
      (doseq [x v] (.push ret x))
      ret))
  (stringRep [_ v] nil))
