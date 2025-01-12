import MySql from 'then-mysql';
import Promise from 'promise';

function init(config) {
  const db = new MySql({
    ...config,
    connectionLimit: 100,
  });
  const results = [];
  return message => {
    switch (message.type) {
      case 'dispose':
        return db.dispose();
      case 'query':
        return db.query(message.str, message.values);
      case 'call':
        return db.call(message.name, message.args);
      case 'queue-query': {
        const index = results.length;
        results.push(db.query(message.str, message.values));
        return index;
      }
      case 'queue-call': {
        const index = results.length;
        results.push(db.query(message.str, message.values));
        return index;
      }
      case 'end': {
        const result = results[message.id];
        results[message.id] = null;
        return result;
      }
      case 'end-all': {
        return Promise.all(results).then(r => {
          r.forEach((v, i) => {
            results[i] = null;
          });
          return null;
        });
      }
    }
  };
}
module.exports = init;
