package main

import ("github.com/wmaxlees/clips"
        "fmt"
        "github.com/emicklei/go-restful"
        "net/http"
        "strings")
// import "github.com/wmaxlees/clips/factparser"

func main () {
    ws := new(restful.WebService)

    ws.Path("/sim").
        Consumes(restful.MIME_JSON).
        Produces(restful.MIME_JSON)

    ws.Route(ws.GET("/{state}").To(runSimulation))

    restful.Add(ws)
    http.ListenAndServe(":8080", nil)

    //list := clips.GetFactList()
    //fmt.Printf(list)

    // act := clips.GetNextActivation()
    // str := clips.GetActivationName(act)
    // fmt.Printf(str)
}

func runSimulation(request *restful.Request, response *restful.Response) {
    state := request.PathParameter("state")

    fmt.Printf("%s\n", state)

    clips.CreateEnvironment()

    clips.Load("risk.clips")

    clips.SetStrategy(clips.RANDOM_STRATEGY)

    clips.Reset()

    clips.Run(-1)

    resultPtr := clips.FindGlobal("result")

    response.WriteAsJson("{\"result\": " + strings.Split(clips.GetGlobalValueForm(resultPtr, 15), " ")[2] + "}")
}