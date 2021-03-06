# csci5800-risk

Machine Learning approach to the game of Risk

### installation

#### dependencies

install [Node.js](https://nodejs.org/en/)

install [Neo4j](http://neo4j.com/)

install [CLIPS](http://clipsrules.sourceforge.net/) as both a shared library and in clips-module/clips _(todo: remove clips install from clips-module when this is well-documented)_

build clips-module:

```
csci5800-risk $ cd clips-module
clips-module $ npm install
```

install dependencies of the game server:

```
csci5800-risk $ cd mcts-game-server
mcts-game-server $ npm install
```

### usage

* run the Neo4j community edition application with an arbitrary database.
* load the [suggested browser URL](http://localhost:7474/browser) to view the database
* change your password as required
* update this password in mcts-game-server/config/default.json:

```
  "neo4j": {
    "baseUrl": "http://localhost:7474/db/data/transaction/commit",
    "username": "neo4j",
    "password": "my shiny new password"
```

* run the mcts-game-server, showing all mcts-related debug messages:

```
mcts-game-server $ DEBUG=mcts:* npm start

> mcts-game-server@1.0.0 start /Users/me/path/to/project/csci5800-risk/mcts-game-server
> node app.js

localhost:3000

```

* use the following curl commands, or, load the Postman collection at mcts-game-server/Risk.postman_collection.json

* let's get a root node in there before we begin training:

```
curl -X POST -H "Content-Type: application/json" "http://localhost:3000/play/risk/createroot"
```

* now let's have it play *risk* for *one* game, *two* players with a computational budget of *1000*:

```
curl -X POST -H "Content-Type: application/json" "http://localhost:3000/play/risk/training/games/1/players/2/budget/1000"
```

did that work?  hope so!  ;-)

* example debug namespaces. you can choose what debug messages you want to see when you start the server:

```
$ DEBUG=mcts:* npm start                    # show any debug messages within the mcts-game-server code
$ DEBUG=mcts:database:* npm start           # show any debug messages related to the neo4j functions (now living in database/)
$ DEBUG=mcts:lib:* npm start                # show any debug messages related to the javascript code in the lib/ directory
$ DEBUG=mcts:gameResources:expand npm start # show only debug messages from the expand.js file
```

you may want to dive into the [Wiki](https://github.com/robfitzgerald/csci5800-risk/wiki) to learn more.
