match (n:Project)
merge (n)-[:PARENT_OF]->(m:Strucutres{name: 'Strucutres', created_at: timestamp()})