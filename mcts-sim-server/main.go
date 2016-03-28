package main

import ("github.com/wmaxlees/clips"
        "fmt"
        "github.com/emicklei/go-restful"
        "net/http"
        "strings"
        "strconv")
// import "github.com/wmaxlees/clips/factparser"

type Country struct {
    Name string
    Player int
    Armies int
}

type State struct {
    Players int
    Free int
    Phase string
    Turn int
    Steps int
    Countries []Country
}

func main () {
    ws := new(restful.WebService)

    ws.Path("/").
        Consumes(restful.MIME_JSON).
        Produces(restful.MIME_JSON)

    ws.Route(ws.POST("sim").To(runSimulation))
    ws.Route(ws.POST("actions").To(getActions))

    restful.Add(ws)
    http.ListenAndServe(":8080", nil)
}


func getActions(request *restful.Request, response *restful.Response) {
    state := new(State)
    request.ReadEntity(state)

    fmt.Printf("Actions: %s\n", state)

    env := clips.CreateEnvironment()
    clips.Load(env, "risk.clips")
    clips.Reset(env)
    assertState(env, *state)

    str := clips.GetFactList(env)
    fmt.Printf(str)

    // Get the possible actions

    response.WriteAsJson("STUB")
}


func runSimulation(request *restful.Request, response *restful.Response) {
    state := new(State)
    request.ReadEntity(state)

    fmt.Printf("Sim: %s\n", state)

    env := clips.CreateEnvironment()
    clips.Load(env, "risk.clips")
    clips.Reset(env)
    assertState(env, *state)
    clips.SetStrategy(env, clips.RANDOM_STRATEGY)

    clips.Run(env, -1)

    resultPtr := clips.FindGlobal(env, "result")

    response.WriteAsJson("{\"result\": " + strings.Split(clips.GetGlobalValueForm(env, resultPtr, 15), " ")[2] + "}")
}

func assertState(env clips.EnvironmentPointer, state State) {
    assertPlayers(env, state.Players)
    assertTurn(env, state.Turn)
    assertPhase(env, state.Phase)
    assertFreeArmies(env, state.Free)
    assertSteps(env, state.Steps)

    for _, country := range state.Countries {
        assertCountry(env, country.Name, country.Player, country.Armies)
    }
}

func assertPlayers(env clips.EnvironmentPointer, num int) {
    clips.AssertString(env, "(players " + strconv.Itoa(num) + ")")
}

func assertTurn(env clips.EnvironmentPointer, num int) {
    clips.AssertString(env, "(turn " + strconv.Itoa(num) + ")")
}

func assertPhase(env clips.EnvironmentPointer, phase string) {
    clips.AssertString(env, "(phase (current " + phase + "))")
}

func assertFreeArmies(env clips.EnvironmentPointer, num int) {
    clips.AssertString(env, "(free-armies " + strconv.Itoa(num) + ")")
}

func assertCountry(env clips.EnvironmentPointer, name string, player int, armies int) {
    clips.AssertString(env, "(controls (country " + name + ") (player " + strconv.Itoa(player) + "))")
    clips.AssertString(env, "(armies (country " + name + ") (num " + strconv.Itoa(armies) + "))")
}

func assertSteps(env clips.EnvironmentPointer, num int) {
    clips.AssertString(env, "(steps " + strconv.Itoa(num) + ")")
}
