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
- Là một framework remote procedure call mã nguồn mở được phát triển bởi Google.
- Cho phép nhiều dịch vụ, trên các hệ thống khác nhau hoặc ngôn ngữ lập trình khác nhau giao tiếp bằng cách gọi hàm, như thể chúng là các hàm cục bộ.
- Dùng Protocol Buffers (protobuf) làm ngôn ngữ định nghĩa giao diện, interface definition language (IDL) và định dạng tuần tự hóa dữ liệu, data serialization, để:
    - Serialize/deserialize dữ liệu nhanh chóng.
    - Thông điệp nhỏ gọn, tiết kiệm băng thông, hiệu năng cao.
    - Hợp đồng kiểu dữ liệu mạnh giữa client và server.

- Các use cases phổ biến:
    - Giao tiếp giữa microservices: độ trễ thấp, kết nối chắc chắn giữa các dịch vụ.
    - Real-time communication: hỗ trợ server streaming, client streaming và bidirectional streaming.
    - Giao tiếp mobile <-> backend: hiệu quả cho mạng băng thông thấp/không ổn định.
    - Các hệ thống IoT: thông điệp giao tiếp nhẹ và hiệu quả.
> TODO: Add definition and use-cases.

### 2.2 gRPC architecture
![alt text](https://grpc.io/img/landing-2.svg)


2. Client stub

Client sử dụng **stub được sinh ra tự động** (proxy) - gọi RPC như gọi hàm bình thường. Stub sẽ:
- Serialize request sang Protobuf
- Gửi qua HTTP/2
- Nhận và deserialize response từ server

3. Server implementation

Server nhận **interface** sinh ra từ .proto, và lập trình viên chỉ cần làm logic xử lý. Server sẽ:
- Nhận và giải mã request
- Gọi hàm xử lý tương ứng
- Trả lại response dạng Protobuf

4. Tầng truyền tải (Transport layer)

gRPC dùng HTTP/2, giúp:
- Multiplexing nhiều luồng trên 1 kết nối
- Giảm kích thước header
- Hỗ trợ streaming hai chiều
- Độ trễ thấp, hiệu năng cao

Đây là lý do gRPC nhanh hơn REST/JSON trên HTTP/1.1.

5. Cơ chế serialize/deserialize

Dữ liệu (nhị phân) được mã hoá bằng Protocol Buffers, mang lại lợi ích:
- Nhỏ gọn
- Tốc độ cao
- Có kiểm soát schema và hỗ trợ versioning

6. Các mô hình giao tiếp

gRPC hỗ trợ 4 kiểu:
- Unary RPC – 1 request <-> 1 response
- Server streaming – 1 request -> stream response
- Client streaming – stream request -> 1 response
- Bidirectional streaming – hai bên gửi stream song song

Luồng hoạt động tổng quát:
- Client gọi hàm stub -> tạo request Protobuf
- Stub gửi qua HTTP/2
- Server nhận và phân phối đến handler
- Handler xử lý
- Server trả response dạng Protobuf
- Stub giải mã và trả kết quả cho client

> TODO: Add architecture details.

### 2.3 Protocol Buffers (Định nghĩa dịch vụ - Protobuf)

Mô hình client-server, hợp đồng giao tiếp được viết bằng Protocol Buffers (Protobuf).

Định nghĩa dịch vụ (Protobuf)

File .proto mô tả:
- Các service và danh sách RPC methods
- Kiểu dữ liệu request/response
- Loại tương tác (unary, streaming, bidirectional)
Đây là hợp đồng chung để sinh mã nguồn tự động ở cả client và server.

```protobuf
message Person {
  string name = 1;
  int32 id = 2;
  bool has_ponycopter = 3;
}
```

```protobuf
// The greeter service definition.
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}
```

> TODO: Add notes about .proto files and message definitions.

### 2.4 gRPC call types (Các mô hình giao tiếp)

gRPC hỗ trợ 4 kiểu:
- Unary RPC – 1 request <-> 1 response
- Server streaming – 1 request -> stream response
- Client streaming – stream request -> 1 response
- Bidirectional streaming – hai bên gửi stream song song

> TODO: Expand with examples and diagrams.
> TODO: giải thích multiplexing, HTTP/2 vs HTTP/1.1, cần cụ thể các mô hình giao tiếp

### 2.5 Advantages of gRPC

So với REST truyền thống, gRPC có nhiều ưu điểm nổi bật:
1. Hiệu năng cao
- Sử dụng Protobuf giúp dữ liệu nhỏ gọn, tốc độ serialize/deserialize nhanh.
- Tận dụng HTTP/2 để multiplexing, giảm overhead và độ trễ.

2. Hỗ trợ đa dạng mô hình giao tiếp
- Unary, server streaming, client streaming, và bidirectional streaming.
- Tối ưu cho các ứng dụng real-time hoặc trao đổi dữ liệu liên tục.

3. Đa ngôn ngữ, đa nền tảng
- Tự động sinh code client/server cho hơn 10+ ngôn ngữ (Go, Java, Python, C#, Node.js…).
- Cho phép các hệ thống dị biệt giao tiếp dễ dàng.

4. Hợp đồng API rõ ràng và chặt chẽ
- Dựa trên file .proto, giúp API có type rõ ràng, dễ quản lý, dễ versioning.
- Hạn chế lỗi do mismatch giữa client và server.

5. Bảo mật tốt
- gRPC tích hợp tốt với TLS/SSL.
- Hỗ trợ authentication đa dạng (JWT, OAuth2, mTLS).

6. Phù hợp microservices
- Tối ưu để các service nội bộ giao tiếp nhanh, ổn định.
- Ít tốn băng thông, dễ load balancing.

> TODO

### 2.6 Limitations of gRPC
1. Không thân thiện với trình duyệt
- Trình duyệt không hỗ trợ HTTP/2 full-duplex và không hiểu Protobuf.
- Cần gRPC-Web hoặc proxy (Envoy), làm tăng độ phức tạp.

2. Debug khó hơn REST
- Payload dạng nhị phân nên khó đọc bằng mắt thường.
- Cần tool chuyên dụng để inspect (BloomRPC, Kreya, Insomnia…).

3. Yêu cầu thiết lập hạ tầng phức tạp hơn
- Phải quản lý build .proto, sinh code, versioning schema.
- Phải đảm bảo server hỗ trợ HTTP/2 đầy đủ (không phải framework nào cũng hỗ trợ tốt).

4. Không phù hợp cho public API
- REST dễ dùng, dễ thử nghiệm, dễ tích hợp với bên thứ ba hơn.
- gRPC thường phù hợp nội bộ hơn là public-facing APIs.

5. Hạn chế khi truyền dữ liệu lớn
- gRPC mặc định giới hạn kích thước message.
- Tải file lớn cần workaround như chunking hoặc dùng channel khác (S3, Firebase...).

6. Learning curve cao
- Protobuf, toolchain, generator, streaming model.

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

<!-- Compare on:

- Communication model
- Coupling
- Response time
- Latency
- Complexity
- Fault handling
- Scalability -->

| Aspect                  |   gRPC                                                                                     | Message Broker (Kafka, RabbitMQ, NATS, ...)                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| **Communication model** | Synchronous hoặc asynchronous (yêu cầu <-> trả lời trực tiếp). Hỗ trợ streaming hai chiều. | Asynchronous, dựa trên message queue hoặc pub/sub. Producer và consumer không giao tiếp trực tiếp. |
| **Coupling**            | **Tightly coupled** – client gọi thẳng server; cả hai phải online cùng lúc.                | **Loosely coupled** – producer và consumer độc lập về thời gian, không cần hoạt động đồng thời.    |
| **Response time**       | Rất nhanh, request-response trực tiếp qua HTTP/2.                                          | Tùy broker; thường chậm hơn vì qua hàng đợi và persistence (đặc biệt Kafka).                       |
| **Latency**             | Thấp (low-latency), tối ưu real-time, streaming.                                           | Có độ trễ cao hơn do cơ chế lưu trữ, batching, replication.                                        |
| **Complexity**          | Đơn giản hơn cho RPC point-to-point; cần quản lý file `.proto`.                            | Phức tạp hơn: yêu cầu cluster, partitions, retention, consumer groups, monitoring.                 |
| **Fault handling**      | Kém hơn khi server chết -> request fail. Cần retry/backoff.                                 | Tốt hơn – message được lưu, retry tự nhiên, hỗ trợ offline consumer.                               |
| **Scalability**         | Scale tốt theo chiều ngang (tăng số service instance) nhưng vẫn phụ thuộc direct RPC.      | Scale cực tốt (đặc biệt Kafka). Hỗ trợ consumer group, partition, xử lý lượng data lớn.            |
| **Typical use cases**   | Microservices nội bộ, low-latency RPC, streaming real-time.                                | Event-driven architecture, async workflows, event sourcing, log processing.                        |


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
Chọn gRPC khi bạn cần:
- Low latency, high performance communication giữa các microservice.
- Synchronous request–response với yêu cầu trả kết quả ngay.
- Real-time streaming (client/server hoặc bidirectional).
- Internal service-to-service communication yêu cầu type safety và tốc độ cao.
- Dịch vụ được viết bằng nhiều ngôn ngữ, cần shared contract qua .proto.
- Kiến trúc đơn giản, không cần cơ chế queue, retry hoặc persistence phức tạp.
- Hệ thống yêu cầu API chặt chẽ, rõ ràng, dễ versioning.
Không phù hợp nếu cần decoupling mạnh hoặc xử lý offline.
> TODO

### 8.2 Use RabbitMQ when
Chọn RabbitMQ khi:
- Bạn cần asynchronous communication theo kiểu queue.
- Cần message routing linh hoạt (direct, topic, fanout).
- Workload có dao động và cần buffer để tránh service bị quá tải.
- Cần reliable delivery kèm retry, ack, dead-letter queue.
- Luồng công việc dạng task-based (job queue, background processing).
- Bạn cần mô hình đơn giản, dễ hiểu hơn Kafka nhưng vẫn mạnh mẽ cho workflow.
- Hệ thống không cần throughput cực lớn nhưng cần đảm bảo xử lý đúng.

Không phù hợp nếu xử lý dữ liệu lớn theo dòng sự kiện hoặc log streaming.
> TODO

### 8.3 Use Kafka when
Chọn Kafka khi:
- Bạn cần xử lý event stream lớn, throughput hàng ngàn đến hàng triệu messages/giây.
- Kiến trúc mang tính event-driven, event sourcing, hoặc CQRS.
- Cần persist event log để đọc lại hoặc reprocess khi cần.
- Cần horizontal scaling mạnh với partition, consumer group.
- Cần đảm bảo ordering theo partition hoặc exactly-once semantics.
- Workflow thiên về data streaming, analytics, log collection, real-time pipeline.
Không phù hợp nếu workload nhẹ, cần routing phức tạp, hoặc cần queue semantics kiểu FIFO đơn giản.
> TODO


## Part 9 - Hybrid Architectures

### 9.1 Combining approaches

- Hệ thống thực tế thường cần kết hợp cả synchronous (gRPC) và asynchronous (RabbitMQ/Kafka) để tận dụng ưu điểm của mỗi mô hình.
- gRPC dùng cho các request cần phản hồi ngay: validation, tính toán giá trị, CRUD nội bộ, kiểm tra trạng thái.
- Message broker dùng cho các tác vụ không cần kết quả tức thời: gửi email, cập nhật kho, đồng bộ dữ liệu, indexing, logging, analytics.
- Một pattern phổ biến: service xử lý request qua gRPC → publish sự kiện sang broker để các service khác xử lý tiếp (OrderCreated, PaymentCompleted, UserSignedUp...).
- gRPC stream có thể kết hợp với Kafka stream: gRPC để nhận dữ liệu real-time từ client/device, Kafka xử lý nền với throughput lớn.
- Hybrid architecture giúp vừa giữ được độ trễ thấp cho các thao tác quan trọng, vừa đảm bảo hệ thống mở rộng tốt và không bị coupling chặt giữa các service.
> TODO

### 9.2 Design guidelines

- Dùng gRPC cho critical path: các thao tác cần kết quả ngay, latency thấp, logic ngắn.
- Dùng RabbitMQ/Kafka cho side-effects và long-running tasks: gửi thông báo, xử lý nền, pipeline, batch, event propagation.
- Không dùng gRPC cho workflow dài hoặc fan-out nhiều service → dễ nghẽn và khó retry.
- Không dùng Kafka hoặc RabbitMQ như RPC: không phù hợp cho request–response, latency cao, phức tạp không cần thiết.
- Phân tách rõ vai trò:
    - gRPC → command/query, synchronous calls
    - RabbitMQ → job queue, retries, routing
    - Kafka → event stream, audit log, event sourcing, analytics
- Thiết kế theo hướng eventual consistency: synchronous xử lý phần quan trọng, asynchronous xử lý phần còn lại.
- Triển khai logging, tracing, monitoring cho cả RPC lẫn message flow → đảm bảo quan sát toàn hệ thống.
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