/*
 * Node RPC proxy client
 * */
const cfg = require("../../config/config"),
    { nodes, api_version: API_VERSION, project, color: c } = cfg,
    moment = require("moment"),
    wid = require("cluster").worker.id,
    nodeTimer = node => `${c.yellow}[timer]${c.magenta} ${node} node ${c.white}request time`,
    { Client } = require("bitcoin"),
    { providers } = require("ethers"),
    { api_requests: log_api, error: log_err } = require("../../utils/logger")(module);

// empty response pattern
let empty = Object({ result: null, error: null, id: null });

// simple query logger
let logit = (msg = "") =>
    Object({
        msg: msg,
        api_version: API_VERSION,
        module: "address controller",
        project: project,
        timestamp: (() => moment())(), // UTC timestamp
        path: module.filename
            .split("/")
            .slice(-2)
            .join("/")
    });

/**
 * common node request wrapper
 * JSON-RPC node proxy client
 * */
const nodeRequester = (node_type, method, params, config) =>
    new Promise(resolve => {
        empty.error = null; // clear error
        let cmd = Object([{ method: method, params: params }]);
        console.log(`${node_type} node. exec cmd: `, cmd);
        // switch ETH or LTC/BTC type request
        if (node_type === "eth") {
            let { host, port, protocol, user, pass } = config;
            let url = `${protocol}://${user}:${pass}@${host}:${port}`;
            console.log(`${c.green}WORKER[${wid}] send JSON-RPC request to ${c.yellow}${node_type}${c.green} node connection URL:\n${c.white}`, url);
            console.time(nodeTimer(node_type));
            // build ethProvider JSON RPC geth node provider
            const ethProvider = new providers.JsonRpcProvider(url);
            // build etherScan provider
            const etherScanProvider = new providers.EtherscanProvider();
            const p1 = etherScanProvider.getBlockNumber(),
                p2 = ethProvider.send(method, params);
            // resolve promises in parallel
            Promise.all([p1, p2])
                .then(([etherScanResult, gethResult]) => {
                    console.timeEnd(nodeTimer(node_type));
                    console.log(`${c.green}[${c.magenta}${node_type}${c.green}] gethResult node data: ${c.white}`, gethResult);
                    console.log(`${c.green}[${c.magenta}etherScanResult${c.green}] data: ${c.white}`, etherScanResult);
                    return resolve({
                        result: gethResult,
                        etherScanResult: etherScanResult,
                        error: null,
                        id: null
                    });
                })
                .catch(err => {
                    console.timeEnd(nodeTimer(node_type));
                    console.error(`Error on ${node_type} client request:\n`, err);
                    log_err(logit(err));
                    // setup error
                    empty.error = err;
                    return resolve(empty);
                });

            // ethProvider
            //     .send(method, params)
            //     .then(data => {
            //         console.log(`${c.green}[${c.magenta}${node_type}${c.green}] node data: ${c.white}`, data);
            //         console.timeEnd(nodeTimer(node_type));
            //         return resolve({ result: data, error: null, id: null });
            //     })
            //     .catch(err => {
            //         console.timeEnd(nodeTimer(node_type));
            //         console.error(`Error on ${node_type} client request:\n`, err);
            //         log_err(logit(err));
            //         // setup error
            //         empty.error = err;
            //         return resolve(empty);
            //     });
        } else {
            let con = Object.create(null); // connection Object container
            con = config
                ? config // if we have config => construct connection Object from incoming RPC payload
                : typeof nodes[node_type] === "object"
                ? nodes[node_type] // define node type without config
                : undefined;
            console.log(`${c.green}WORKER[${wid}] send JSON-RPC request to ${c.yellow}${node_type}${c.green} node connection:\n${c.white}`, con);
            // register timer
            console.time(nodeTimer(node_type));
            // construct connection
            if (con) {
                // construct node client connection Object
                let client = new Client(con);
                client.cmd(cmd, (err, data) => {
                    if (err) {
                        console.error(`Error on ${node_type} client request:\n`, err);
                        log_err(logit(err));
                        // setup error
                        empty.error = err;
                        return resolve(empty);
                    }
                    console.log(`${c.green}[${c.magenta}${node_type}${c.green}] node data: ${c.white}`, data);
                    console.timeEnd(nodeTimer(node_type));
                    resolve({ result: data, error: null, id: null });
                });
            } else resolve(empty); // no config for this node_type
        }
    });

// export node CMD executor for ext modules
exports.nodeRequest = nodeRequester;
