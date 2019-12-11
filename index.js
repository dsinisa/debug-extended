'use strict';

const consoleStamp = require('console-stamp');
const debug = require('debug');
const chalk = require('chalk');

let config = {};

const labelTypes = [
  { regex: /trace/i, text: chalk.gray('TRACE'), textNoColor: 'TRACE'},
  { regex: /debug/i, text: chalk.white('DEBUG'), textNoColor: 'DEBUG'},
  { regex: /log/i, text: chalk.green('LOG'), textNoColor: 'INFO'},
  { regex: /info/i, text: chalk.black.bgGreen('INFO'), textNoColor: 'INFO'},
  { regex: /warn/i, text: chalk.yellow('WARN'), textNoColor: 'WARN'},
  { regex: /error/i, text: chalk.red('ERROR'), textNoColor: 'ERROR'},
  { regex: /fatal/i, text: chalk.black.bgRed('FATAL'), textNoColor: 'FATAL'},
];

function labelColor(text) {
  for (let t of labelTypes) {
    if (!text || !t.regex.test(text)) continue;
    return t.text;
  }
  return text;
}

function setupConsoleStamp() {
  const logDnaOption = config.timeStamp === 'logdna';
  const options = Object.assign({}, config.consoleStampOptions);
  if (!config.timeStamp || logDnaOption) {
    Object.assign(options, {
      datePrefix: '',
      dateSuffix: '',
      formatter: () => '',
    });

    if (logDnaOption) {
      options.formatter = () => {return (new Date()).toISOString();};

      for (let t of labelTypes) {
        t.text = t.textNoColor;
      }
    }
  }

  if (!options.colors)
    options.colors = {};

  if (!options.colors.label)
    options.colors.label = labelColor;

  console.trace = console.log.bind(console); // eslint-disable-line no-console
  console.debug = console.log.bind(console); // eslint-disable-line no-console
  console.fatal = console.error.bind(console); // eslint-disable-line no-console

  options.extend = {
    trace: 6,
    debug: 5,
    log: 4,
    info: 3,
    warn: 2,
    error: 1,
    fatal: 1,
  };
  options.include = ['trace', 'debug', 'log', 'info', 'warn', 'error', 'fatal'];
  if (!options.level)
    delete options.level;

  consoleStamp(console, options);
}

function setup(configObj) {
  config = Object.assign({}, configObj);

  if (config.consoleStamp) {
    setupConsoleStamp();
  }

  debug.log = console.log.bind(console); // eslint-disable-line no-console

  return getDebug;
}

function getDebug(namespace) {
  const log = debug(namespace);
  const logTrace = debug(namespace);
  const logDebug = debug(namespace);
  const logWarn = debug(namespace);
  const logError = debug(namespace);
  const logFatal = debug(namespace);
  const logInfo = debug(namespace);

  logTrace.log = console.trace.bind(console); // eslint-disable-line no-console
  logDebug.log = console.debug.bind(console); // eslint-disable-line no-console
  logInfo.log = console.info.bind(console); // eslint-disable-line no-console
  logWarn.log = console.warn.bind(console); // eslint-disable-line no-console
  logError.log = console.error.bind(console); // eslint-disable-line no-console
  logFatal.log = console.fatal ? console.fatal.bind(console) : logError.log; // eslint-disable-line no-console

  return Object.assign(log, {
    trace: logTrace,
    debug: logDebug,
    info: logInfo,
    warn: logWarn,
    error: logError,
    fatal: logFatal,
  });
}

getDebug.setup = setup;

module.exports = getDebug;