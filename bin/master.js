/*
 * Master process behavior
 * 0. [MASTER] init RPC channel connection
 * 1. [MASTER] handel RPC channel events
 * 2. [MASTER] pass events to random [WORKER] process
 * 3. [WORKER] do something
 * 4. [MASTER] handle MSG from worker
 * 5. [MASTER] exec RPC callback done(err,data)
 * */
let cluster = require("cluster"),
  cfg = require('../config/config'),
  { store, color: c } = cfg,
  { redis: redis_cfg, channel } = store;

/*
* [WORKER] respawner
* if worker 'disconnect' from IPC channel
* */
cluster.on("disconnect", (worker, code, signal) => {
    console.log("Worker %d died. Respawn", worker.id);
    cluster.fork();
});

cluster.on("online", worker => console.log(c.magenta + "Worker %d " + c.white + "online", worker.id));
// fork workers by CPU cores
let workers = require("os").cpus().length;
// Fork worker process
for (let i = 0; i < workers; ++i) cluster.fork();
// Send payload to Random worker
const sendMsgToRandWorker = (payload) => cluster.workers[Math.floor(Math.random() * (workers - 1)) + 1].send(payload);

/** REDIS RPC + cluster RPC chatting behavior */
const node_rpc_channel = channel.jrpc('master');
const redisRpc = require('node-redis-rpc');
console.log(`[MASTER node]: Init RPC service "${node_rpc_channel}"`);
const rpc = new redisRpc(redis_cfg);
// RPC handler
rpc.on(node_rpc_channel, ({ payload }, channel, done) =>{
  if(payload) console.log(`${c.yellow}[MASTER node] channel: "${channel}". RPC Data>>>\n${c.white}`, payload);
  else return done('no payload');
  // send MSG to Random Worker
  sendMsgToRandWorker(payload);
  // MSG handler from WORKER
  const messageHandler = ({ msg, worker, node_type }) => {
    // check error from worker
    if(msg.error) return done(error);
    // Trigger done handler to fire back rpc result
    // - first arg:  error status
    // - second arg: result data
    done(null, {
      msg: msg,
      worker: worker,
      channel: node_rpc_channel,
      node_type: node_type
    });
  };
  // handle message from worker
  for (const id in cluster.workers) cluster.workers[id].once('message', messageHandler);
});
