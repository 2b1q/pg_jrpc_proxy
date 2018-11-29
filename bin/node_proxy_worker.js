const
    node_proxy = require("../modules/node_interaction/node_rpc_client"),
    env = process.env.NODE_ENV;
const cfg = require('../config/config'),
    { color: c } = cfg;
const worker = require("cluster").worker,
    { id: wid } = worker; // access to cluster.worker.id

// handle msg from master
worker.on('message', (msg) => {
  console.log(`${c.green}WORKER[${wid}] got MSG\n${c.white}`, msg);
  let { method, params } = msg;
  node_proxy.nodeRequest('btc', method, params)
    .then(node_response => worker.send({
      msg: { ...node_response },
      worker: wid
    })); // send node_response to master process
  });
