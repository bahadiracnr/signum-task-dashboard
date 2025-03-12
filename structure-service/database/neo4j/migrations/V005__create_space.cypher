match (n:Floor)
merge (n)-[:PARENT_OF]->(m:Space{name: 'Space', created_at: timestamp()})