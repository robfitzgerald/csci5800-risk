#lang racket

(require "action.rkt"
         "node.rkt")

(provide
 (contract-out
  (mcts
   ((listof node?) procedure? procedure? . -> . action?))))

; The number of iterations of the mcts
(define-values (computational-budget) 10)

; mcts -> action?
;    s: (listof node?)
;    default-policy: procedure?
;    tree-policy: procedure?
;
;    Runs a Monte Carlo Tree Search from a given
;    state. The first node in s must be the node
;    to start the search from. 
(define (mcts s default-policy tree-policy)
  (define v0 (car s))

  (for ([i (in-range 0 computational-budget)])
    (define v (get-node (tree-policy v0)))
    (sim-and-backup (cons s v) default-policy))
  (best-action-on v0))

; sim-and-backup -> any
;    v: (listof node?)
;    default-policy: procedure?
;
;    Runs the default policy on the first node
;    in v and then updates the value of all
;    nodes in v
(define (sim-and-backup v default-policy)
  (define ∆ (default-policy (car v)))
  (backup v ∆))

; backup -> any
;    v: (listof node?)
;    ∆: number?
;
;    Updates the expected return for each
;    node in the list and sends the new value
;    to the server
(define (backup v ∆)
  (displayln "USING STUB PROCEDURE backup IN mcts.rkt")
  (for ([v1 v])
    (set! v1 (update-average-reward v1 ∆))   ; This needs to save the new node to
    (update-node v1)                         ; the list too
    (set! ∆ (- ∆))))

; best-action-on -> action?
;    v: node?
;
;    Given a node, v, this procedure returns the best
;    expected best action based on previous iterations
;    of the mcts algorithm.
(define (best-action-on v)
  (displayln "USING STUB PROCEDURE best-action-on IN mcts.rkt")
  (action 'blah))

