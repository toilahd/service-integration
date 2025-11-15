% service-integration

# Service Integration

This repository contains notes, demos and exercises about service integration patterns, including synchronous and asynchronous communication, gRPC, RabbitMQ, and Kafka.

## Table of Contents

- [Part 1 — Overview](#part-1---overview)
- [Part 2 — gRPC (Synchronous Communication)](#part-2---grpc-synchronous-communication)
- [Part 3 — Message Broker (Asynchronous Communication)](#part-3---message-broker-asynchronous-communication)
- [Part 4 — RabbitMQ](#part-4---rabbitmq)
- [Part 5 — Apache Kafka](#part-5---apache-kafka)
- [Part 6 — gRPC vs Message Broker (Comparison)](#part-6---grpc-vs-message-broker)
- [Part 7 — RabbitMQ vs Kafka (Comparison)](#part-7---rabbitmq-vs-kafka)
- [Part 8 — When to Use Each Technology](#part-8---when-to-use-each-technology)
- [Part 9 — Hybrid Architectures](#part-9---hybrid-architectures)
- [Part 10 — Demos & Hands-on](#part-10---demos--hands-on)
- [Exercises (Suggested)](#exercises-suggested)
- [References](#references)
- [Discussion Questions](#discussion-questions)


## Part 1 - Overview

### 1.1 What is Service Integration?

> TODO: Add content describing service integration concepts and goals.

### 1.2 Integration Approaches

- Synchronous communication
- Asynchronous communication

> TODO: Add descriptions and examples for each approach.


## Part 2 - gRPC (Synchronous Communication)

### 2.1 What is gRPC?

> TODO: Add definition and use-cases.

### 2.2 gRPC architecture

> TODO: Add architecture details.

### 2.3 Protocol Buffers

> TODO: Add notes about .proto files and message definitions.

### 2.4 gRPC call types

- Unary RPC
- Server streaming
- Client streaming
- Bidirectional streaming

> TODO: Expand with examples and diagrams.

### 2.5 Advantages of gRPC

> TODO

### 2.6 Limitations of gRPC

> TODO


## Part 3 - Message Broker (Asynchronous Communication)

### 3.1 What is a Message Broker?

> TODO

### 3.2 Core concepts

- Producer
- Consumer
- Queue
- Topic
- Exchange
- Partition

> TODO: Define and illustrate each concept.


## Part 4 - RabbitMQ

### 4.1 Overview

> TODO

### 4.2 RabbitMQ architecture

#### Exchange types

- direct
- fanout
- topic
- headers

> TODO: Add routing examples.

### 4.3 Messaging patterns with RabbitMQ

- Work queue
- Publish/Subscribe
- Routing
- RPC

> TODO

### 4.4 Pros and cons

> TODO


## Part 5 - Apache Kafka

### 5.1 Overview

> TODO

### 5.2 Kafka architecture

Core components:

- Producer
- Consumer
- Topic
- Partition
- Broker
- ZooKeeper / KRaft

> TODO: Add diagrams and behavior details.

### 5.3 Topics & partitions

> TODO  

### 5.4 Consumer groups

> TODO

### 5.5 Message retention

> TODO

### 5.6 Pros and 5.7 Cons

> TODO


## Part 6 - gRPC vs Message Broker

Compare on:

- Communication model
- Coupling
- Response time
- Latency
- Complexity
- Fault handling
- Scalability

> TODO: Fill comparison table and trade-offs.


## Part 7 - RabbitMQ vs Kafka

Compare on:

- Model
- Delivery mechanism
- Throughput
- Latency
- Retention
- Ordering
- Use cases
- Complexity
- Replay capability

> TODO: Fill comparison table and recommendations.


## Part 8 - When to Use Each Technology

### 8.1 Use gRPC when

> TODO

### 8.2 Use RabbitMQ when

> TODO

### 8.3 Use Kafka when

> TODO


## Part 9 - Hybrid Architectures

### 9.1 Combining approaches

> TODO

### 9.2 Design guidelines

> TODO


## Part 10 - Demos & Hands-on

### 10.1 Demo 1: gRPC Service

> TODO: Add instructions, code samples and how to run.

### 10.2 Demo 2: RabbitMQ Integration

> TODO

### 10.3 Demo 3: Kafka Event Streaming

> TODO


## Exercises (Suggested)

### Exercise 1 — Implement gRPC Product Service

Requirements:

- Create a Product Service with gRPC API
- Implement CRUD operations
- Provide a client to test the operations

> TODO: Add starter code / hints.

### Exercise 2 — RabbitMQ Task Queue

Requirements:

- Build a notification system using RabbitMQ
- Multiple workers for email/SMS
- Retry mechanism

> TODO: Add starter code / hints.

### Exercise 3 — Kafka Event Pipeline

Requirements:

- Event-driven order processing
- Producer: Order Service
- Consumers: Payment, Inventory, Notification
- Support event replay

> TODO: Add starter code / hints.

### Exercise 4 — Hybrid Architecture

Requirements:

- Design an e-commerce system using both gRPC and a message broker
- Explain choices

> TODO: Add guidelines and example architecture.


## References

- gRPC: https://grpc.io/docs/
- Protocol Buffers: https://protobuf.dev/
- RabbitMQ docs: https://www.rabbitmq.com/documentation.html
- RabbitMQ tutorials: https://www.rabbitmq.com/getstarted.html
- Kafka docs: https://kafka.apache.org/documentation/
- Confluent guides: https://docs.confluent.io/
- Books: "Building Microservices" (Sam Newman), "Designing Data-Intensive Applications" (Martin Kleppmann)


## Discussion Questions

1. Why not use synchronous calls for all communication?
2. When can messages be lost? How to ensure at-least-once delivery?
3. Can Kafka completely replace RabbitMQ? Why/why not?
4. Is gRPC suitable for client-to-server communication?
5. How to handle failures in asynchronous communication?

> TODO: Add suggested answers / talking points.