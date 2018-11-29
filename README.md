# PaymentGateway JSON-RPC proxy [PG_jrpc_proxy]

**PG_jrpc_proxy** is stateless async microservice with Redis RPC interaction  

### Components and features ###
- node.js vertical cluster 
  - [MASTER] fork [WORKER] processes by count of CPU cores
  - [WORKER] BTC/LTC node request client wrapper (make JSON-RPC requests to node_type_cfg dynamically)
- Master process behavior
   1. [MASTER] init RPC channel connection
   2. [MASTER] handel RPC channel events
   3. [MASTER] pass events to random [WORKER] process
   4. [WORKER] BTC/LTC node request client wrapper (make JSON-RPC requests to node_type_cfg dynamically)
   5. [MASTER] handle MSG from worker
   6. [MASTER] exec RPC callback done(err,data)
