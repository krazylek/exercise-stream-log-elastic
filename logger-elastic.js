const elasticSink = require('pino-elasticsearch');

module.exports = function(argv) {
  argv = argv || {};

  var options = {
    host: argv.host,
    port : argv.port,
    index : argv.index,
    type: argv.type,
    consistency: argv.consistency
  };
  return elasticSink(options);
};
