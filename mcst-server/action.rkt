#lang racket

(provide action
         action?)

(struct action (act)
  #:transparent)