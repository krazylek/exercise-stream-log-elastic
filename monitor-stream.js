const through = require('through2');
const duplex = require('duplexify');
const uuid = require('uuid');
const once = require('once');
const noop = function(){};

module.exports = monitor; 

function monitor(stream, options) {
  var oninput = options.oninput || noop;
  var onoutput = options.onoutput || noop;
  var onstart = options.onstart || noop;
  var onend = options.onend || noop;
  var name = options.name || 'unnamed';
  var id = options.id || uuid.v1();
  var saveIO = options.saveIO || false;
  var streamsOpts = { objectMode: options.objectMode };

  var job = {
    id: id,
    name: name,
  };

  var processStart = once(function processStart() {
    job.startTime = process.hrtime();
    onstart(job);
  });
  
  if(saveIO) {
    job.inputs = [];
    job.outputs = [];
  }

  var input = through(streamsOpts, (d, _, n) => {
   jobInput(d);
   n(null, d); 
  });

  var pump = (options.objectMode ? duplex.obj : duplex)(input, stream);
  input.pipe(stream);

  pump.on('data', jobOutput);
  pump.on('end', jobEnd);
      
  function jobInput(d) {
    processStart(d);

    if(!job.startDate)
      job.startDate = new Date();

    if(saveIO)
      job.inputs.push(d);

    oninput(job, d);
  }

  function jobOutput(d) {
    if(saveIO)
      job.outputs.push(d);
    onoutput(job, d);
  }

  function jobEnd(err) {
    job.hrtime = process.hrtime(job.startTime);
    job.time = (job.hrtime[0] * 1e9 + job.hrtime[1]) / 1e6;
    job.endDate = new Date();
    onend(err, job);
  }

  return pump;
}
