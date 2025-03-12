const { exec } = require('child_process');
require('dotenv/config');
// dotenv.config();

// Command to execute
const commandToRun = `cd ./database && ./bin/neo4j-migrations --schema-database ${process.env.NEO4J_DATABASE} --database ${process.env.NEO4J_DATABASE} -a${process.env.NEO4J_SCHEME}://${process.env.NEO4J_HOST}:${process.env.NEO4J_PORT} -u${process.env.NEO4J_USERNAME} -p'${process.env.NEO4J_PASSWORD}' apply`;

// Execute the command
exec(commandToRun, (error, stdout, stderr) => {
  if (error) {
    console.log('\x1b[32m', `${error}`, '\x1b[0m');
    return;
  }
  if (stderr) {
    console.log('\x1b[32m', `${stderr}`, '\x1b[0m');
    return;
  }
  console.log('\x1b[32m', `${stdout}`, '\x1b[0m');
});
