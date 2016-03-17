#lang racket

(require "state.rkt"
         "action.rkt"
         "node.rkt")

(provide
 (contract-out
  (mcts
   ((listof state?) procedure? procedure? . -> . action?))))

; The number of iterations of the mcts
(define-values (computational-budget) 10)

; mcts -> action?
;    s: (listof state?)
;    default-policy: procedure?
;    tree-policy: procedure?
;
;    Runs a Monte Carlo Tree Search from a given
;    state. The first node in s must be the node
;    to start the search from. 
(define (mcts s default-policy tree-policy)
  (define v0 (get-node (car s)))

  (for ([i (in-range 0 computational-budget)])
    (define v (get-node (tree-policy v0)))
    (define ∆ (default-policy (car v)))
    (backup (cons s v) ∆))
  (best-action-on v0))

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
    (set! v1 (update-average-reward v1 ∆))
    (update-node v1)))

; get-node -> node?
;    s: state?
;
;    Either generates a new node if the node hasn't
;    already been seen or returns the node it if
;    does exist
(define (get-node s)
  (displayln "USING STUB PROCEDURE get-node IN mcts.rkt")
  (new-node s))

; best-action-on -> action?
;    v: node?
;
;    Given a node, v, this procedure returns the best
;    expected best action based on previous iterations
;    of the mcts algorithm.
(define (best-action-on v)
  (displayln "USING STUB PROCEDURE best-action-on IN mcts.rkt")
  (action 'blah))

; update-node -> any
;    v: node?
;
;    Updates the node on the knowledge server
(define (update-node v)
  (displayln "USING STUB PROCEDURE update-node IN mcts.rkt"))