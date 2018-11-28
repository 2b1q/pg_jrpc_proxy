let cluster = require("cluster"),
    config = require("../config/config");

// if worker 'disconnect' from IPC channel
cluster.on("disconnect", (worker, code, signal) => {
    console.log("Worker %d died", worker.id);
    cluster.fork();
});

cluster.on("online", worker => console.log(config.color.magenta + "Worker %d " + config.color.white + "online", worker.id));

let cpuCount = require("os").cpus().length;

// fork workers by CPU cores
for (let i = 0; i < cpuCount; ++i) cluster.fork();


///////////////////////
///////////////////////
///////////////////////
///////////////////////
const cfg = require('../config/config'),
  { store } = cfg,
  { redis: redis_cfg, channel } = store;

/** simple RPC behavior */
const node_rpc_channel = channel.jrpc('master');
const redisRpc = require('node-redis-rpc');
const msg = {
  msg:'hello from JSON-RPC-proxy service '+ node_rpc_channel,
};
console.log(`[MASTER node]: Init RPC service "${node_rpc_channel}"`);
const rpc = new redisRpc(redis_cfg);
// RPC handler
rpc.on(node_rpc_channel, ({ payload }, channel, done) =>{
  if(payload) console.log(`[MASTER node] channel: "${channel}". RPC Data>>>\n`, payload);
  // Trigger done handler to fire back rpc result
  // - first arg:  error status
  // - second arg: result data
  done(null, msg );
});
