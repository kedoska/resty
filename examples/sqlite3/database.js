var sqlite3 = require("sqlite3").verbose();

module.exports = (databasePath) => {
  let db = new sqlite3.Database(databasePath, (err) => {
    if (err) {
      throw err;
    }
    db.run(
      `CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name text, 
          email text UNIQUE, 
          password text, 
          CONSTRAINT email_unique UNIQUE (email)
          )`,
      (err) => {
        if (err) {
          console.log(`skip database schema creation`)
        }
      }
    );
  });
  return db;
};
