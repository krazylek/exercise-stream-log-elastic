# exercise-log-stream

Log and monitor a tranform stream with an elasticsearch backend

## The exercise

the goal for this exercise is to monitor a **tranform stream**, log the data somewhere, and keep stdout for the data flow

2 possibilities:
- stderr is already used, then the monitor stream have to load directly into elastic
- stderr is free for logging, and the logger/store can be plugged here, which offers better composition

As a log, I send a report, when process is done, containing how much inputs and outputs we got,
and a computation about the size of the file here (median and total). 

## Tools choosed:
- The **transform stream** here read `ls -l` lines and [transforms](https://github.com/sergi/parse-listing) them into a js object
- [Pino](https://github.com/mcollina/pino) is the logger
- **Elasticsearch** is the store, logs go through [Pino-elasticsearch](https://www.npmjs.com/package/pino-elasticsearch) to be loaded



## Usage 

Basic usage

```bash
ls -l | tail -n+2 | node index.js

Options:
-o, --output:    stderr | elastic, stderr is default
    --nolog:     no logs are written
```


Use elastic in monitor stream (settings in logger-elastic.js)

``` bash
ls -l | tail -n+2 | node index.js -o elastic
```


or use stderr if your transform stream allows it

```bash
ls -l | tail -n+2 | node index.js 2> ./node_modules/.bin/pino-elasticsearch
```


Display only logs in terminal:

```bash
ls -l | tail -n+2 | node index.js 2>&1 >/dev/null
```


Note the `tail -n+2` to remove the *ls -l total files* (which is not parsed here).


## License

[MIT](https://tldrlegal.com/license/mit-license)
