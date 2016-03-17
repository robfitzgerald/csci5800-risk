#lang racket

(provide
 (contract-out
  (state?
   (any/c . -> . boolean?))
  (game-over?
   (state? . -> . boolean?))))

; state? -> boolean?
;    obj: any/c
;
;    Returns #t if the input is a state
(define (state? obj)
  (vector? obj))

; create-pair -> number?
;    player: number?
;    army-size: number?
;
;    Combines army size and player into a single
;    number pair
(define (create-pair player army-size)
  (bitwise-ior player (arithmetic-shift army-size 2)))

; get-army-size -> number?
;    pair: number?
;
;    Splits out the army size from the number
(define (get-army-size pair)
  (arithmetic-shift pair -2))

; get-player -> number?
;    pair: number?
;
;    Splits out the player who owns the country
(define (get-player pair)
  (bitwise-and pair 3))

; game-over? -> boolean?
;    a-state: state?
;
;    Determines whether a give state represents a game
;    over state
(define (game-over? a-state)
  (define team #f)
  (let/ec exit
    (for ([country (in-range 1 (vector-length a-state))])
      (cond [(eq? team #f)
             (set! team (get-player (vector-ref a-state country)))]
            [(not (= team (get-player (vector-ref a-state country))))
             (exit #f)]))
    (exit #t)))
