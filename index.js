const through = require('through2');
const Parser = require('parse-listing');
const pino = require('pino');
const monitor = require('./monitor-stream');
const d3 = require('d3-array');

const argv = require('rminimist')(process.argv.slice(2), {
  alias: {
    'o': 'output'
  }
});

const logger = createLogger(argv);

const parseLsStream = through.obj((buf, _, next) => {
  var str = buf.toString('utf8');
  var entry = Parser.parseEntry(str);
  next(null, entry);
});

const monitorStream = createMonitoredStream(parseLsStream);

process.stdin
  .pipe(require('split2')())
  .pipe(monitorStream)
  .pipe(through.obj((d,_,n) => {
    n(null, JSON.stringify(d));
  }))
  .pipe(process.stdout);


function createLogger(opts) {
  if(opts.nolog)
    return pino({ level: 'silent' });

  const logSink = argv.output == 'elastic' ? require('./logger-elastic')(argv) :
    process.stderr;
  return pino({}, logSink);
}

function createMonitoredStream(stream) {

  function onend(err, job) {
    var report = {
      id: job.id,
      name: job.name,
      inputs: job.inputs.length,
      outputs: job.outputs.length,
      mediansize: d3.median(job.outputs, o => o.size),
      totalsize: d3.sum(job.outputs, o => o.size),
      start: job.startDate,
      end: job.endDate,
      elapsedms: job.time
    };

    logger.info(report);
  }

  return monitor(stream, { 
    //oninput: (job, d) => console.log('\n> IN', d, process.hrtime()),
    //onoutput: (job, d) => console.log('\n> OUT', d.name, process.hrtime()),
    //onstart: (job) => console.log('\n> START', job.name),
    //onend: (err, job) => console.log('\n> END', job.name),
    onend, 
    name: 'read_files_info', 
    saveIO:true, 
    objectMode: true 
  });
}
