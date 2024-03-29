const { nodeRequest } = require("../modules/node_interaction/node_rpc_client"),
    cfg = require("../config/config"),
    { color: c } = cfg,
    worker = require("cluster").worker,
    { id: wid } = worker; // access to cluster.worker.id

// handle msg from master
worker.on("message", msg => {
    console.log(`${c.green}WORKER[${wid}] got MSG\n${c.white}`, msg);
    let { method, params, node_type = "btc", config, nodeHash, hash } = msg;
    nodeRequest(node_type, method, params, config)
        .then(node_response =>
            // send node_response to master process
            worker.send({
                msg: { ...node_response }, // node JSON-RPC response
                wid,
                node_type: node_type,
                nodeHash, // keep nodeHash
                hash // payloadhash
            })
        )
        .catch(e => {
            console.error("nodeRequest error:\n", e);
            worker.send({ error: e });
        });
});
