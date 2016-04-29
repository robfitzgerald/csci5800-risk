# neo4j tuning and explorational queries

### make index an index and make it unique
```
CREATE INDEX ON :BOARD(index)
CREATE CONSTRAINT ON (g:BOARD) ASSERT g.index IS UNIQUE
```

### all paths from any node n along parent relationships of any length
```MATCH p=(n)-[r:PARENT*1..]-() RETURN p LIMIT 500```

### nodes and relationships in the start phase
```MATCH (n:BOARD)-[r {name:'startplace'}]-() RETURN n, r LIMIT 500```

```MATCH p=(n:BOARD {index: 3895442334})-[:CHILD*..]-(m:BOARD {}) WHERE m.rewards > 0 RETURN m```

### all paths from the root node up to a depth of 4
```MATCH p=(:BOARD{index: 3895442334})-[*..4]-() RETURN p```


#optomization
PROFILE
MATCH(child : BOARD{index: 3396432413}), (root : BOARD {index: 1004185000}),
            path = (child) - [:PARENT *] - > (root)
            WITH nodes(path) AS pathNodes UNWIND pathNodes as node
            WITH DISTINCT node
            SET node.visits = node.visits + 1, node.rewards = node.rewards + 1