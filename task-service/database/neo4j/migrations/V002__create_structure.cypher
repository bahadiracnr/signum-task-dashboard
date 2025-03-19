match (n:project)
merge (n)-[:PARENT_OF]->(m:task{name: 'task', created_at: timestamp()})