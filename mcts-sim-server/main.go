package main

import "github.com/wmaxlees/clips"

func main () {
    clips.CreateEnvironment()

    clips.Load("risk.clips")

    clips.SetStrategy(clips.RANDOM_STRATEGY)

    clips.Reset()

    clips.Run(-1)

}