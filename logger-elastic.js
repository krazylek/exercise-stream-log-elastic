const elasticSink = require('pino-elasticsearch');

module.exports = function(argv) {
  argv = argv || {};

  var options = {
    host: argv.host || 'localhost',
    port : argv.port || '9200',
    index : argv.index || 'pino',
    type: argv.type || 'log',
    consistency: argv.consistency || 'one'
  };

  return elasticSink(options);
};
