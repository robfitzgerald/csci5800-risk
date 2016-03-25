package main

import "github.com/wmaxlees/clips"
import "fmt"
// import "github.com/wmaxlees/clips/factparser"

func main () {
    clips.CreateEnvironment()

    clips.Load("risk.clips")

    clips.SetStrategy(clips.RANDOM_STRATEGY)

    clips.Reset()

    clips.Run(-1)

    resultPtr := clips.FindGlobal("result")
    fmt.Printf("%s\n", clips.GetGlobalValueForm(resultPtr, 15))

    //list := clips.GetFactList()
    //fmt.Printf(list)

    // act := clips.GetNextActivation()
    // str := clips.GetActivationName(act)
    // fmt.Printf(str)
}