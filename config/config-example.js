/*
 * Create and exports configuration variables
 *
 * */

// Config container
const config = {};

/** Common config for all ENV */
const api_version = "v. 2.0",
  project = "BANKEX Payment-gateway-JSON-RPC-node-proxy";

// colorize console
const color = {
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  black: "\x1b[30m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  white: "\x1b[37m"
};

/** Staging (default) environment */
config.staging = {
  nodes: {
    btc: {
      protocol: "http",
      host: "34.217.183.33",
      port: 8332,
      user: "",
      pass: "",
      timeout: 30000
    },
    ltc: {
      protocol: "http",
      host: "34.219.117.248",
      port: 9332,
      user: "",
      pass: "",
      timeout: 30000
    }
  },
  api_version: api_version,
  project: project,
  /** ============= NEED TO BE SPECIFIED ============= */
  store: {
    redis: {
      host: 'localhost', // redis server hostname
      port: 6379,        // redis server port
      scope: 'staging'      // use scope to prevent sharing messages between "node redis rpc"
    },
    channel: {
      jrpc: wid => typeof wid === 'undefined' ? 'pg_jrpc:' : 'pg_jrpc:' + wid,
      auth: wid => typeof wid === 'undefined' ? 'pg_auth:' : 'pg_auth:' + wid,
      nm: wid => typeof wid === 'undefined' ? 'pg_nm:' : 'pg_nm:' + wid,
    }
  },
  color: color
};
/** END OF Staging (default) environment */

/** Production environment */
config.production = {};
/** END OF Production environment */

/** Dev environment */
config.dev = {
  nodes: {
    btc: {
      protocol: "http",
      host: "34.217.183.33",
      port: 8332,
      user: "",
      pass: "",
      timeout: 30000
    },
    ltc: {
      protocol: "http",
      host: "34.219.117.248",
      port: 9332,
      user: "",
      pass: "",
      timeout: 30000
    }
  },
  api_version: api_version,
  project: project,
  /** ============= NEED TO BE SPECIFIED ============= */
  store: {
    redis: {
      host: 'redis', // redis server hostname
      port: 6379,        // redis server port
      scope: 'dev'      // use scope to prevent sharing messages between "node redis rpc"
    },
    channel: {
      jrpc: wid => typeof wid === 'undefined' ? 'pg_jrpc:' : 'pg_jrpc:' + wid,
      auth: wid => typeof wid === 'undefined' ? 'pg_auth:' : 'pg_auth:' + wid,
      nm: wid => typeof wid === 'undefined' ? 'pg_nm:' : 'pg_nm:' + wid,
    }
  },
  color: color
};
/** END OF Dev environment */

  // Determine passed ENV
const currentEnv = typeof process.env.NODE_ENV == "string" ? process.env.NODE_ENV.toLowerCase() : "";

// Check ENV to export (if ENV not passed => default ENV is 'staging')
const envToExport = typeof config[currentEnv] == "object" ? config[currentEnv] : config.staging;

// Exports config module
module.exports = envToExport;
