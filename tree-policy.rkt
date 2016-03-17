#lang racket

(require "node.rkt")

(provide
 (contract-out
  (simple-tree-policy
   (node? . -> . (listof node?)))))

; simple-tree-policy -> (listof node?)
;    v: node?
;
;    Generates a list of nodes that is a
;    path from v to the desired node to
;    simulate on. The first node in the list
;    is the node to simulate from
(define (simple-tree-policy v)
  (define result (list v))

  (displayln "USING STUB PROCEDURE simple-tree-policy IN tree-policy.rkt")
  
  result)