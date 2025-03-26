const { exec } = require('child_process');
const neo4j = require('neo4j-driver');
const dotenv = require('dotenv');
dotenv.config();

async function clearLock() {
  console.log('\x1b[36m', 'Connecting to Neo4j to clear lock...', '\x1b[0m');
  const driver = neo4j.driver(
    `${process.env.NEO4J_SCHEME}://${process.env.NEO4J_HOST}:${process.env.NEO4J_PORT}`,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),
  );
  const session = driver.session({ database: process.env.NEO4J_DATABASE });
  try {
    await session.run('MATCH (lock:`__Neo4jMigrationsLock`) DELETE lock');
    console.log('\x1b[32m', 'Lock cleared successfully!', '\x1b[0m');
  } catch (error) {
    console.error('\x1b[31m', 'Failed to clear lock:', error, '\x1b[0m');
    throw error;
  } finally {
    await session.close();
    await driver.close();
  }
}

async function executeMigration(tryCount = 1) {
  const commandToRun = `cd ./database && ./bin/neo4j-migrations --schema-database ${process.env.NEO4J_DATABASE} --database ${process.env.NEO4J_DATABASE} -a${process.env.NEO4J_SCHEME}://${process.env.NEO4J_HOST}:${process.env.NEO4J_PORT} -u${process.env.NEO4J_USERNAME} -p'${process.env.NEO4J_PASSWORD}' apply`;
  return new Promise((resolve, reject) => {
    exec(commandToRun, async (error, stdout, stderr) => {
      if (error) {
        console.log('\x1b[32m', `${error}`, '\x1b[0m');
        if (tryCount >= 1) {
          console.log(
            '\x1b[32m',
            `Trying to clear lock and re-run migration`,
            '\x1b[0m',
          );
          try {
            await clearLock();

            await executeMigration(tryCount - 1);
            resolve();
          } catch (err) {
            reject(err);
          }
          return;
        } else {
          return reject(error);
        }
      }
      if (stderr) {
        console.log('\x1b[32m', `${stderr}`, '\x1b[0m');
      }
      console.log('\x1b[32m', `${stdout}`, '\x1b[0m');
      resolve();
    });
  });
}

module.exports.executeMigration = executeMigration;
