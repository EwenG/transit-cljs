(defproject ewen/transit-cljs "0.0.1"
  :source-paths ["src"]
  :resource-paths ["resources"]
  :test-paths ["test"]
  :dependencies [[org.clojure/clojure "1.9.0-alpha15" :scope "provided"]
                 [org.clojure/clojurescript "1.9.494" :scope "provided"]]
  :plugins [[lein-cljsbuild "1.1.5"]]
  
  :cljsbuild {:builds
              [{:source-paths ["src"]
                :compiler {:output-to "target/cljs/transit-cljs.min.js"
                           :optimizations :advanced
                           :pretty-print false}}]})
