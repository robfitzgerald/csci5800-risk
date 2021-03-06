#include <clips/clips.h>

namespace clipslib {

    void defineRules(void* env) {
        // Templates
        EnvEval(env, "(deftemplate adjacent     \
                        (slot one)              \
                        (slot two))", NULL);

        EnvEval(env, "(deftemplate armies\
                        (slot country)\
                        (slot num))", NULL);

        EnvEval(env, "(deftemplate controls\
                        (slot country)\
                        (slot player))", NULL);

        EnvEval(env, "(deftemplate phase\
                        (slot current))", NULL);

        EnvEval(env, "(defglobal\
                ?*result* = -1)", NULL);


        // Facts
        EnvEval(env, "(deffacts risk\
                        (adjacent (one Alaska) (two NorthwestTerritory))\
                        (adjacent (one Alaska) (two Alberta))\
\
                        (adjacent (one NorthwestTerritory) (two Alaska))\
                        (adjacent (one NorthwestTerritory) (two Alberta))\
                        (adjacent (one NorthwestTerritory) (two Ontario))\
                        (adjacent (one NorthwestTerritory) (two Greenland))\
\
                        (adjacent (one Greenland) (two NorthwestTerritory))\
                        (adjacent (one Greenland) (two Ontario))\
                        (adjacent (one Greenland) (two Quebec))\
  \
                        (adjacent (one Alberta) (two Alaska))\
                        (adjacent (one Alberta) (two NorthwestTerritory))\
                        (adjacent (one Alberta) (two Ontario))\
                        (adjacent (one Alberta) (two WesternUnitedStates))\
  \
                        (adjacent (one Ontario) (two NorthwestTerritory))\
                        (adjacent (one Ontario) (two Greenland))\
                        (adjacent (one Ontario) (two Alberta))\
                        (adjacent (one Ontario) (two Quebec))\
                        (adjacent (one Ontario) (two WesternUnitedStates))\
                        (adjacent (one Ontario) (two EasternUnitedStates))\
  \
                        (adjacent (one WesternUnitedStates) (two Alberta))\
                        (adjacent (one WesternUnitedStates) (two Ontario))\
                        (adjacent (one WesternUnitedStates) (two EasternUnitedStates))\
                        (adjacent (one WesternUnitedStates) (two CentralAmerica))\
  \
                        (adjacent (one EasternUnitedStates) (two Ontario))\
                        (adjacent (one EasternUnitedStates) (two Quebec))\
                        (adjacent (one EasternUnitedStates) (two WesternUnitedStates))\
                        (adjacent (one EasternUnitedStates) (two CentralAmerica))\
  \
                        (adjacent (one CentralAmerica) (two WesternUnitedStates))\
                        (adjacent (one CentralAmerica) (two EasternUnitedStates))\
                        (adjacent (one CentralAmerica) (two Venezuela))\
  \
                        (adjacent (one Venezuela) (two CentralAmerica))\
                        (adjacent (one Venezuela) (two Peru))\
                        (adjacent (one Venezuela) (two Brazil))\
  \
                        (adjacent (one Peru) (two Venezuela))\
                        (adjacent (one Peru) (two Brazil))\
                        (adjacent (one Peru) (two Argentina))\
  \
                        (adjacent (one Brazil) (two Venezuela))\
                        (adjacent (one Brazil) (two Peru))\
                        (adjacent (one Brazil) (two Argentina))\
  \
                        (adjacent (one Argentina) (two Peru))\
                        (adjacent (one Argentina) (two Brazil)))", NULL);

        EnvEval(env, "(deffunction rolls (?a ?d)\
                        (bind ?a-rolls (if (< ?a 3)\
                            then 1\
                            else (if (< ?a 4)\
                                then 2 else 3)))\
\
                        (bind ?b-rolls (if (< ?d 2)\
                            then 1\
                            else 2))\
\
                        (bind ?rolls (min ?d (- ?a 1) 2))\
\
                        ?rolls)", NULL);

        EnvEval(env, "(deffunction a-wins (?rolls)\
                        (bind ?a 0)\
                        (loop-for-count ?rolls\
                            (if (> (random 0 1) 0)\
                                then (bind ?a (+ ?a 1))))\
\
                        ?a)", NULL);

        EnvEval(env, "(deffunction calc-result ()\
                        (bind ?inc-0 0)\
                        (bind ?inc-1 0)\
                        (do-for-all-facts\
                            ((?c controls))\
                            (eq ?c:player 0)\
                            (bind ?inc-1 (+ ?inc-1 1)))\
\
                        (do-for-all-facts\
                            ((?c controls))\
                            (eq ?c:player 0)\
                            (bind ?inc-1 (+ ?inc-1 1)))\
\
                        (if (> ?inc-0 ?inc-1)\
                            then 1\
                            else 0))", NULL);

        EnvEval(env, "(defrule out-of-time\
                        (steps 0)\
                        =>\
                        (bind ?*result* (calc-result))\
                        (printout t \"--- Ran out of time: \" ?*result* crlf)\
                        (halt))", NULL);

        EnvEval(env, "(defrule start-place\
                        ?steps-fact <- (steps ?steps&:(> ?steps 0))\
                        ?turn-fact <- (turn ?player)\
                        ?phase-fact <- (phase (current start))\
                        ?free-armies-fact <- (free-armies ?free)\
                        (controls (country ?country) (player ?player))\
                        ?armies-fact <- (armies (country ?country) (num ?armies))\
                        (players ?num)\
                        =>\
                        (retract ?armies-fact)\
                        (assert (armies (country ?country) (num (+ ?armies 1))))\
                        (retract ?turn-fact)\
                        (assert (turn (mod (+ ?player 1) ?num)))\
                        (if (= (mod (+ ?player 1) ?num) 0)\
                            then (retract ?free-armies-fact)\
                                 (assert (free-armies (- ?free 1)))\
                                 (if (= 0 (- ?free 1))\
                                     then (retract ?phase-fact)\
                                          (assert (phase (current placement)))))\
                        (retract ?steps-fact)\
                        (assert (steps (- ?steps 1))))", NULL);

        EnvEval(env, "(defrule game-over\
                        (controls (country ?) (player ?p))\
                        (forall (controls (country ?) (player ?player))\
                            (test (= ?p ?player)))\
                        =>\
                        (if (= ?p 0)\
                            then (bind ?*result* 1)\
                            else (bind ?*result* 0))\
                        (halt))", NULL);

        EnvEval(env, "(defrule fortify-move\
                        ?steps-fact <- (steps ?steps&:(> ?steps 0))\
                        ?turn-fact <- (turn ?player)\
                        (players ?num)\
                        ?phase-fact <- (phase (current attack))\
                        (controls (country ?country-a) (player ?player-a))\
                        (controls (country ?country-b) (player ?player-b&:(= ?player-a ?player-b)))\
                        (adjacent (one ?country-a) (two ?country-b))\
                        ?armies-a-fact <- (armies (country ?country-a) (num ?a&:(> ?a 1)))\
                        ?armies-b-fact <- (armies (country ?country-b) (num ?b))\
                        =>\
                        (retract ?armies-a-fact)\
                        (assert (armies (country ?country-a) (num 1)))\
                        (retract ?armies-b-fact)\
                        (assert (armies (country ?country-b) (num (+ ?b (- ?a 1)))))\
                        (retract ?phase-fact)\
                        (assert (phase (current placement)))\
                        (assert (free-armies 1))\
                        (retract ?turn-fact)\
                        (assert (turn (mod (+ ?player 1) ?num)))\
                        (printout t ?steps \" Action: Player \" ?player-a \" fortified \" ?country-b \" from \" ?country-a crlf)\
                        (printout t \"Action: Player \" ?player-a \" ends turn\" crlf)\
                        (retract ?steps-fact)\
                        (assert (steps (- ?steps 1))))", NULL);

        EnvEval(env, "(defrule next-turn\
                        ?steps-fact <- (steps ?steps&:(> ?steps 0))\
                        (players ?num)\
                        ?turn-fact <- (turn ?player)\
                        ?phase-fact <- (phase (current attack))\
                        =>\
                        (retract ?phase-fact)\
                        (assert (phase (current placement)))\
                        (assert (free-armies 1))\
                        (retract ?turn-fact)\
                        (assert (turn (mod (+ ?player 1) ?num)))\
                        (printout t ?steps \" Action: Player \" ?player \" ends turn\" crlf)\
                        (retract ?steps-fact)\
                        (assert (steps (- ?steps 1))))", NULL);

        EnvEval(env, "(defrule place-army\
                        ?steps-fact <- (steps ?steps&:(> ?steps 0))\
                        (turn ?player)\
                        ?phase-fact <- (phase (current placement))\
                        (controls (country ?country) (player ?player))\
                        ?armies-fact <- (armies (country ?country) (num ?armies))\
                        ?free-armies-fact <- (free-armies ?free)\
                        =>\
                        (retract ?armies-fact)\
                        (assert (armies (country ?country) (num (+ ?armies 1))))\
                        (retract ?free-armies-fact)\
                        (if (> (- ?free 1)0) \
                            then\
                                (assert (free-armies (- ?free 1)))\
                            else\
                                (retract ?phase-fact)\
                                (assert (phase (current attack))))\
                        (printout t ?steps \" Action: Player \" ?player \" placed 1 army on \" ?country crlf)\
                        (retract ?steps-fact)\
                        (assert (steps (- ?steps 1))))", NULL);

        EnvEval(env, "(defrule attack-all\
                        ?steps-fact <- (steps ?steps&:(> ?steps 0))\
                        (turn ?a-player)\
                        (phase (current attack))\
                        (controls (country ?a-country) (player ?a-player))\
                        ?a-army-fact <- (armies (country ?a-country) (num ?a-army&:(> ?a-army 1)))\
                        (adjacent (one ?a-country) (two ?d-country))\
                        ?d-controls-fact <- (controls (country ?d-country) (player ?d-player&:(not (= ?a-player ?d-player))))\
                        ?d-army-fact <- (armies (country ?d-country) (num ?d-army))\
                        =>\
                        (bind ?roll-count (rolls ?a-army ?d-army))\
                        (bind ?a (a-wins ?roll-count))\
                        (bind ?d (- ?roll-count ?a))\
\
                        (if (>= ?a ?d-army)\
                            then\
                                (bind ?a-remaining (- ?a-army ?d))\
                                (retract ?d-army-fact)\
                                (assert (armies (country ?d-country) (num (- ?a-remaining 1))))\
                                (retract ?a-army-fact)\
                                (assert (armies (country ?a-country) (num 1)))\
                                (retract ?d-controls-fact)\
                                (assert (controls (country ?d-country) (player ?a-player)))\
                                (printout t \">> Player \" ?a-player \" captures \" ?d-country crlf)\
                            else\
                                (retract ?d-army-fact)\
                                (assert (armies (country ?d-country) (num (- ?d-army ?a))))\
                                (retract ?a-army-fact)\
                                (assert (armies (country ?a-country) (num (- ?a-army ?d)))))\
                        (printout t ?steps \" Action: Player \" ?a-player \" attacked \" ?d-player \":\" ?d-country \" from \" ?a-country crlf)\
                        (retract ?steps-fact)\
                        (assert (steps (- ?steps 1))))", NULL);
    }
}

