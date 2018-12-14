/*
 * Node RPC proxy client
 * */
const cfg = require("../../config/config"),
    { nodes, api_version: API_VERSION, project, color: c } = cfg,
    moment = require("moment"),
    wid = require("cluster").worker.id,
    nodeTimer = node => `${c.yellow}[timer]${c.magenta} ${node} node ${c.white}request time`,
    { Client } = require("bitcoin"),
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
        console.log("exec cmd: ", cmd);
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
    });

// export node CMD executor for ext modules
exports.nodeRequest = nodeRequester;
