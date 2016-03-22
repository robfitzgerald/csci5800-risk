package main

import "github.com/wmaxlees/clips"

func main () {
    clips.CreateEnvironment()
    clips.Reset()

    clips.Load("risk.clips")

    clips.Run(-1)

}