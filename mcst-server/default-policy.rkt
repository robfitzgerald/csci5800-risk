#lang racket

(require "state.rkt"
         "node.rkt")

(provide
 (contract-out
  (simple-default-policy
   (state? . -> . number?))))

(define (simple-default-policy s)        
  (displayln "USING STUB PROCEDURE simple-default-policy IN default-policy.rkt")

  1)
