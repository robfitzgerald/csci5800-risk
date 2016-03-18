#lang racket

(require "state.rkt")

(provide
 node
 (contract-out
  (node?
   (any/c . -> . boolean?))
  (new-node
   (node? . -> . state?))
  (update-average-reward
   (node? number? . -> . node?))
  (get-node
   (state? . -> . node?))
  (update-node
   (node? . -> . any))))

; A node
;    children: The child nodes of the tree
;    open: Whether the child has been simulated before
;    average-reward: The averaged reward value of the node
;    times-visited: The number of times a child has been simulated
(struct node (state children average-reward times-visited)
  #:transparent)

; new-node -> node?
;    s: state?
;
;    Returns a new node with the given state
(define (new-node s)
  (node s '() 0 0))

; add-child -> node?
;    parent: node?
;
;    Adds a brand new child node to the parent
;    node
(define (add-new-child parent state)
  (add-child parent (state node '() 0 0)))
  
; add-child -> node?
;    parent: node?
;    child: node?
;
;    Adds the child node as a child to the parent
(define (add-child parent child)
  (node (node-state parent)
        (append (node-children parent) (list child))
        (node-average-reward parent)
        (node-times-visited)))

; update-average-reward -> node?
;    a-node: node?
;    new-value: number?
;
;    Updates the average value of the node based on the new
;    observed value
(define (update-average-reward a-node new-value)
  (node (node-state a-node)
        (node-children a-node)
        (calculate-average (node-average-reward a-node) new-value (node-times-visited a-node))
        (+ 1 (node-times-visited a-node))))

; calculate-average -> number?
;    a: number?
;    new-value: number?
;    n: number?
;
;    Calculates a new average based on a (the current average),
;    the new value and n (the number of previous terms averaged)
(define (calculate-average a new-value n)
  (+ a (/ (- new-value a) (+ n 1))))

; update-node -> any
;    v: node?
;
;    Updates the node on the knowledge server
(define (update-node v)
  (displayln "USING STUB PROCEDURE update-node IN mcts.rkt"))

; get-node -> node?
;    s: state?
;
;    Either generates a new node if the node hasn't
;    already been seen or returns the node it if
;    does exist
(define (get-node s)
  (displayln "USING STUB PROCEDURE get-node IN mcts.rkt")
  (new-node s))