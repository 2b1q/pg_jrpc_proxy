// const
//     node_proxy = require("../modules/node_interaction/node_rpc_client"),
//     env = process.env.NODE_ENV;

const { id: wid } = require("cluster").worker; // access to cluster.worker.id

/** simple RPC behavior */
const node_rpc_channel = 'node_rpc:'+wid;
const redisRpc = require('node-redis-rpc');
const config = {
    host: 'redis', // redis server hostname
    port: 6379,        // redis server port
    scope: 'test'      // use scope to prevent sharing messages between "node redis rpc"
};
const msg = {
    msg:'hello from '+ node_rpc_channel,
};
console.log(`Worker: [${wid}] Init RPC service "${node_rpc_channel}"`);
const rpc = new redisRpc(config);
// RPC handler
rpc.on(node_rpc_channel, ({ payload }, channel, done) =>{
    if(payload) console.log(`Worker: [${wid}] channel: "${channel}". RPC Data>>>\n`, payload);
    // Trigger done handler to fire back rpc result
    // - first arg:  error status
    // - second arg: result data
    done(null, msg );
});
