let cluster = require("cluster"),
  cfg = require('../config/config'),
  { store, color: c } = cfg,
  { redis: redis_cfg, channel } = store;

// if worker 'disconnect' from IPC channel
cluster.on("disconnect", (worker, code, signal) => {
    console.log("Worker %d died. Respawn", worker.id);
    cluster.fork();
});

cluster.on("online", worker => console.log(c.magenta + "Worker %d " + c.white + "online", worker.id));
// fork workers by CPU cores
let cpuCount = require("os").cpus().length;
for (let i = 0; i < cpuCount; ++i) cluster.fork();

/*
* Master process behavior
* - init RPC channel connection
* - handel RPC channel events
* - todo pass events/msgs to worker process
* - todo worker do staff > exec RPC callback done(err,data)
* */
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
