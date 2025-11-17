# Service Integration
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
- [References](#references)
- [Discussion Questions](#discussion-questions)


## Part 1 - Overview

### 1.1 What is Service Integration?
Service Integration (Tích hợp dịch vụ) là quá trình kết nối nhiều thiết bị, ứng dụng và hệ thống riêng lẻ lại thành một hệ thống lớn, đồng bộ và thống nhất. Mục tiêu là cho phép các thành phần khác nhau (thường được xây dựng bằng các công nghệ khác nhau) có thể chia sẻ dữ liệu và tự động hóa các quy trình nghiệp vụ. Điều này rất quan trọng trong các kiến trúc microservices, service-oriented architecture (SOA) và các hệ thống dựa trên đám mây (cloud-based systems).



### 1.2 Integration Approaches

**Synchronous communication**

Trong giao tiếp đồng bộ, service gửi yêu cầu (client) sẽ phải chờ service nhận (server) xử lý và trả về phản hồi. Client bị khóa (blocked) trong suốt thời gian chờ đợi.
  - Ví dụ: gRPC, REST API.
  - Đặc điểm: Có sự ràng buộc về thời gian, phản hồi ngay lập tức.
  - Phù hợp khi: Client cần kết quả ngay để tiếp tục công việc.

**Asynchronous communication**

Trong giao tiếp bất đồng bộ, client gửi yêu cầu (thường là một "tin nhắn" - message) và không cần chờ phản hồi. Client có thể tiếp tục công việc khác ngay lập tức.

  - Ví dụ: Message Broker (RabbitMQ, Kafka).
  - Đặc điểm: Giảm sự ràng buộc (decoupling), tăng khả năng phục hồi lỗi.
  - Phù hợp khi: Xử lý tác vụ nền, không cần kết quả ngay, cần độ tin cậy cao.



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


### 2.2 gRPC architecture
![alt text](https://grpc.io/img/landing-2.svg)


1. Client stub

Client sử dụng **stub được sinh ra tự động** (proxy) - gọi RPC như gọi hàm bình thường. Stub sẽ:
- Serialize request sang Protobuf
- Gửi qua HTTP/2
- Nhận và deserialize response từ server

2. Server implementation

Server nhận **interface** sinh ra từ .proto, và lập trình viên chỉ cần làm logic xử lý. Server sẽ:
- Nhận và giải mã request
- Gọi hàm xử lý tương ứng
- Trả lại response dạng Protobuf

3. Tầng truyền tải (Transport layer)

gRPC dùng HTTP/2, giúp:
- Multiplexing nhiều luồng trên 1 kết nối
- Giảm kích thước header
- Hỗ trợ streaming hai chiều
- Độ trễ thấp, hiệu năng cao

Đây là lý do gRPC nhanh hơn REST/JSON trên HTTP/1.1.

4. Cơ chế serialize/deserialize

Dữ liệu (nhị phân) được mã hoá bằng Protocol Buffers, mang lại lợi ích:
- Nhỏ gọn
- Tốc độ cao
- Có kiểm soát schema và hỗ trợ versioning

Luồng hoạt động tổng quát:
- Client gọi hàm stub -> tạo request Protobuf
- Stub gửi qua HTTP/2
- Server nhận và phân phối đến handler
- Handler xử lý
- Server trả response dạng Protobuf
- Stub giải mã và trả kết quả cho client

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

### 2.4 gRPC call types (Các mô hình giao tiếp)

gRPC hỗ trợ 4 kiểu:
- Unary RPC – 1 request <-> 1 response
- Server streaming – 1 request -> stream response
- Client streaming – stream request -> 1 response
- Bidirectional streaming – hai bên gửi stream song song

[Animation](https://claude.ai/public/artifacts/9b2f38c5-8895-4f20-a828-2eb168e39ac8)

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


## Part 3 - Message Broker (Asynchronous Communication)

### 3.1 What is a Message Broker?

Message Broker là phần mềm trung gian giúp các ứng dụng giao tiếp và trao đổi thông tin, kể cả khi chúng chạy trên nền tảng hay ngôn ngữ khác nhau. Broker nhận tin nhắn từ producer, lưu trữ tạm (thông qua hàng đợi) và chuyển tiếp đến consumer theo quy tắc định trước. Nhờ broker, các dịch vụ decouple (giảm phụ thuộc trực tiếp): producer không cần biết chi tiết consumer và ngược lại. Hầu hết các message broker cung cấp cơ chế ghi đệm và xác nhận (acknowledgment) để đảm bảo tin nhắn không bị mất
. Phổ biến nhất có RabbitMQ (AMQP), Kafka, MQTT, AWS SQS, Azure Service Bus…

### 3.2 Core concepts
- Producer: Là thành phần tạo và gửi tin nhắn vào hệ thống. Trong microservices, một service có thể hành động như producer khi phát sinh event hay tác vụ cần xử lý.
- Consumer: Là thành phần nhận và xử lý tin nhắn từ broker. Service consumer sẽ lấy tin nhắn từ hàng đợi hoặc chủ đề để thực thi logic tương ứng.
- Queue: Là cấu trúc lưu trữ tuần tự tin nhắn theo mô hình point-to-point. Mỗi tin nhắn trong hàng đợi chỉ được giao cho một consumer (1 → 1).
- Topic: Mô hình phân phối 1 → N. Tin nhắn được publish lên một topic và được phân phối đến nhiều consumer đăng ký. Thường áp dụng trong pub/sub (publish-subscribe).
- Exchange (RabbitMQ): Là thành phần nhận tin từ producer và quyết định gửi vào hàng đợi nào dựa trên kiểu routing. Ví dụ fanout (phát broadcast đến mọi queue), direct (so khớp routing key chính xác) hay topic (khớp pattern chuỗi).
- Partition (Kafka): Trong Kafka, một topic được chia thành nhiều partition, mỗi partition là một log liên tục. Tin nhắn ghi thêm vào cuối partition và chỉ đảm bảo thứ tự nội bộ trong mỗi partition. Việc phân vùng cho phép xử lý song song và scale (các partition phân bổ qua nhiều broker).

## Part 4 - RabbitMQ

### 4.1 Overview

RabbitMQ là một message broker phổ biến mã nguồn mở, thực thi chuẩn AMQP. RabbitMQ hỗ trợ nhiều tính năng routing linh hoạt và quản lý kết nối tin cậy, thích hợp cho kiến trúc microservices và xử lý các tác vụ bất đồng bộ. Nói cách khác, RabbitMQ giống “hệ thống bưu điện” cho ứng dụng: producer gửi tin nhắn vào exchange, Exchange chuyển tin vào hàng đợi (queue), và các consumer kéo tin từ đó. Nhờ vào mô hình này, RabbitMQ giúp giảm tải cho hệ thống (producer và consumer hoạt động riêng biệt) và đảm bảo tin nhắn được lưu vững, nhờ cơ chế confirm và retry nếu cần.

### 4.2 RabbitMQ architecture

#### Exchange types
RabbitMQ có 4 loại exchange chính để định tuyến tin nhắn:

- Direct Exchange: Gửi tin nhắn đến các queue mà khóa định tuyến (routing key) khớp chính xác với binding key của queue đó. Nếu không có queue nào bind với key đó, tin nhắn sẽ bị bỏ.
- Fanout Exchange: Phát broadcast tin nhắn tới tất cả các queue được nối với exchange, bỏ qua routing key. Dùng cho mô hình Publish/Subscribe cơ bản (tất cả listener nhận tin).
- Topic Exchange: Sử dụng pattern trên routing key (chuỗi chia bởi dấu chấm). Hỗ trợ wildcard * (một từ) và # (nhiều từ) khi bind queue. Tin nhắn được chuyển tới queue có binding key khớp với routing key theo pattern. Thích hợp để filter và phân loại message theo chủ đề.
- Headers Exchange: Không xét routing key, mà so sánh các cặp header trong tin nhắn với tiêu chí bind. Chỉ những message có thuộc tính header phù hợp mới được gửi tới queue (không dùng routing key).

### 4.3 Messaging patterns with RabbitMQ
- Work Queue (Task Queue): Producer gửi các công việc (jobs) vào một queue. Một hoặc nhiều worker (consumer) sẽ kéo job và xử lý. RabbitMQ phân phối các job cho nhiều worker, giúp xử lý song song. Ví dụ, web server nhận yêu cầu gửi email, sẽ đẩy tin vào queue và các worker riêng biệt lấy tin xử lý việc gửi mail.
- Publish/Subscribe: Producer publish tin tới một exchange kiểu fanout. Exchange gửi bản sao tin đến mọi queue đăng ký với nó. Mỗi queue có thể có một hoặc nhiều consumer, phục vụ cho việc broadcast cập nhật (ví dụ gửi thông báo đến nhiều hệ thống).
- Routing: Sử dụng direct hoặc topic exchange để gửi tin cho nhóm người nhận cụ thể. Ví dụ, Exchange có thể gửi đến queue “errors” hoặc “warnings” dựa trên khóa định tuyến, hoặc sử dụng topic pattern cho các loại thông điệp phức tạp hơn.
- RPC (Remote Procedure Call): RabbitMQ cũng mô phỏng kiểu RPC: client gửi tin đợi trả lời, server (worker) xử lý và gửi trả kết quả trở lại một queue reply-to. Mặc dù dùng cơ chế message, nhưng mô hình này sử dụng queue reply nhận phản hồi tương tự gọi hàm đồng bộ.
### 4.4 Pros and cons
- Ưu điểm: RabbitMQ rất linh hoạt trong routing và phân phối tin nhắn, hỗ trợ đa mô hình (work queue, pub/sub, routing). Nó có cộng đồng lớn và hỗ trợ nhiều ngôn ngữ, dễ tích hợp vào các ứng dụng hiện tại. Hệ thống queue đảm bảo tin nhắn được lưu trữ tạm thời, có thể cấu hình thuộc tính như TTL, ưu tiên, dead-letter queue v.v. Nói chung, RabbitMQ hay được ví như “bưu điện” ứng dụng – dùng để giảm tải và đảm bảo giao nhận tin nhắn kịp thời.
- Nhược điểm: RabbitMQ không được thiết kế cho throughput cực lớn như Kafka. Khi khối lượng tin nhắn tăng cao, throughput sẽ giảm (khoảng vài chục ngàn tin/s mỗi node) và cần mở rộng cụm qua cluster phức tạp. Sau khi consumer ack, tin sẽ bị xóa (không lưu lâu dài), nên không hỗ trợ dễ dàng replay tin cũ. Việc cấu hình clustering cũng phức tạp, đòi hỏi nhiều tuỳ chỉnh (VD: thiết lập mirror queue, chốt dữ liệu).


## Part 5 - Apache Kafka

### 5.1 Overview
Apache Kafka là nền tảng streaming mã nguồn mở, được thiết kế cho throughput cao và độ trễ thấp khi xử lý luồng dữ liệu thời gian thực. Kafka hoạt động như một hệ thống log bất biến (commit log) – mọi tin nhắn được ghi nối thêm vào cuối log topic và lưu trữ lâu dài. Mỗi topic tương đương một log lưu các sự kiện (event) liên quan, có thể được nhiều ứng dụng đăng ký để xử lý (publish/subscribe). Kafka phân phối dữ liệu qua nhiều máy chủ (brokers) trong cụm, sao chép dữ liệu để chịu lỗi và cho phép consumer theo dõi vị trí (offset) của mình trong log. Nhờ thiết kế này, Kafka thích hợp cho các pipeline dữ liệu lớn (big data), luồng sự kiện (streaming) và ghi nhận lịch sử sự kiện (event sourcing).
### 5.2 Kafka architecture
![alt text](https://kafka.apache.org/11/images/streams-architecture-overview.jpg)
Một cụm Kafka gồm nhiều broker (mỗi broker là một Kafka server). Các broker phối hợp với nhau để lưu trữ và phân phối dữ liệu trong cluster. Có một broker chủ (Controller) chịu trách nhiệm quản lý phân vùng (partition) và thực thi các nhiệm vụ hành chính (vd: phân phối lại phân vùng khi broker hỏng). Mỗi topic trong Kafka được chia thành nhiều partition: mỗi partition là một log riêng biệt, ghi thêm tin nhắn theo thứ tự append-only. Các phân vùng của một topic được phân bổ qua các broker, cho phép xử lý song song (thêm broker sẽ gia tăng khả năng xử lý) và đảm bảo tính chịu lỗi bằng cách nhân bản (replication) sang các broker khác.
- Producer: Ứng dụng tạo (publish) sự kiện xuống Kafka topic. Producer sẽ quyết định gửi tin vào partition nào (theo round-robin hoặc key). Tin nhắn được gán offset (mỗi message trong partition có offset tăng dần) để consumer truy xuất theo vị trí.
- Consumer và Consumer Group: Ứng dụng đọc (subscribe) từ Kafka. Consumers nhóm lại thành consumer groups; mỗi partition trong một topic chỉ được giao cho một consumer trong nhóm cùng lúc. Nhờ đó, Kafka có thể mở rộng theo số consumer ngang bằng với số partition. Mỗi consumer ghi nhớ offset cuối cùng đã đọc, nên có thể dừng/bật lại mà không mất dữ liệu. Nếu consumer hỏng, các thành viên khác trong group sẽ tự động nhận lại phân vùng đó.
- ZooKeeper/KRaft: Trước đây Kafka dùng ZooKeeper để lưu metadata (quorum); hiện nay đang dần chuyển sang cơ chế nội bộ KRaft (Kafka Raft) để giảm phụ thuộc.

### 5.3 Topics & partitions
- Topic: Là kênh chứa tin nhắn được phân loại. Mỗi topic tương tự folder/chuyên mục dữ liệu. Producer ghi tin vào topic; nhiều consumer có thể đăng ký cùng topic để đọc tin (pub/sub).
- Partition: Mỗi topic bị chia ra nhiều partition; mỗi partition là một file log rời, tin nhắn ghi nối ở cuối và luôn đảm bảo thứ tự trong partition đó. Tin nhắn có cùng key (vd: ID người dùng) sẽ luôn được gửi vào cùng một partition, đảm bảo thứ tự cho cùng key. Các partition giúp Kafka xử lý cao tải song song: mỗi partition có thể được đặt lên một broker khác nhau và replicated để chịu lỗi. Vì thế, Kafka chỉ đảm bảo thứ tự cục bộ trong mỗi partition, không đảm bảo thứ tự tuyệt đối trên toàn topic.

### 5.4 Consumer groups
- Consumer group là cơ chế cho phép nhiều consumer chia sẻ và đồng bộ xử lý dữ liệu của một topic. Các consumer trong cùng group sẽ được Kafka tự động phân phối phân vùng cho nhau (mỗi phân vùng được giao cho đúng một consumer). Nếu một consumer mất kết nối, các consumer khác trong nhóm sẽ nhận nhiệm vụ đọc phân vùng đó (đảm bảo tính sẵn sàng). 
- Group còn giúp Kafka theo dõi offset của từng nhóm, cho phép tái khởi động hoặc replay dữ liệu từ vị trí đã lưu. Nhờ consumer groups, Kafka đạt được xử lý song song quy mô lớn: càng nhiều consumer trong group, throughput càng cao miễn là số phân vùng đủ cho từng consumer.

### 5.5 Message retention
- Khác với đa số message broker, Kafka giữ lại tin nhắn trong log dài hạn theo chính sách cài đặt (ví dụ theo thời gian hoặc dung lượng). Mặc định, Kafka giữ tin trong 7 ngày (cấu hình log.retention.hours=168), hoặc có thể thay đổi cho từng topic. Sau khi hết hạn (ví dụ quá 7 ngày), các tin cũ sẽ bị xóa để giải phóng đĩa. Việc này cho phép replay dữ liệu: các consumer mới hoặc bị lỗi có thể đọc lại toàn bộ tin nhắn cũ. Ngược lại, các broker truyền thống (như RabbitMQ) thường xóa tin ngay khi đã giao. Việc giữ tin lâu dài giúp Kafka như một hệ thống lưu trữ log phân tán, cho phép audit hoặc xử lý lại luồng dữ liệu nếu cần.

### 5.6 Pros and Cons
- Ưu điểm:
  - Throughput rất cao: Kafka có thể xử lý hàng trăm nghìn đến hàng triệu tin nhắn mỗi giây bằng cách dùng I/O tuần tự và phân vùng dữ liệu.
  - Độ trễ thấp: Thiết kế tối ưu cho truyền dữ liệu với batching và zero-copy, nên cho độ trễ luôn ở mức thấp (đôi khi chỉ vài ms) dù lưu trữ lâu dài.
  - Bền vững và phân tán: Mọi tin nhắn được ghi vào đĩa và sao chép trên nhiều broker, đảm bảo chịu lỗi cao. Nếu broker hỏng, các bản sao trên broker khác vẫn đảm bảo dữ liệu không mất mát.
  - Khả năng scale (mở rộng): Thêm broker và phân vùng mới vào cluster giúp tăng cả lưu trữ và throughput. Kiến trúc phân tán cho phép Kafka mở rộng theo chiều ngang dễ dàng hơn hầu hết message broker truyền thống
  - Persistent (luôn lưu tin nhắn): Tin nhắn trên Kafka luôn được ghi vào log, do đó có thể truy vấn lại lịch sử (điều này rất hữu ích cho phân tích, báo cáo hoặc tái xử lý sự kiện)
  - Consumer Groups: Khả năng hỗ trợ nhiều ứng dụng đọc đồng thời mà không làm gián đoạn nhau, dễ dàng tách thành nhiều stream xử lý khác nhau.
- Nhước điểm:
  - Phức tạp: Kafka có nhiều thành phần (brokers, controller, cũ là ZooKeeper) nên thiết lập và vận hành không đơn giản. Cần đội ngũ có kinh nghiệm để cấu hình, giám sát và duy trì cluster lớn. Việc chuyển từ ZooKeeper sang KRaft đã giảm phần nào sự phụ thuộc bên ngoài, nhưng vẫn yêu cầu cấu hình cẩn thận.
  - Độ phức tạp khi xử lý tin bị lỗi: Kafka không cung cấp sẵn cơ chế retry/message queue cho tin lỗi. Nếu consumer xử lý tin thất bại, ta phải tự quản lý offset hoặc tạo topic “retry”/“DLQ” riêng. RabbitMQ có sẵn dead-letter exchange để xử lý retry dễ dàng hơn.
  - Giới hạn kích thước tin: Mặc định Kafka giới hạn kích thước tin vào ~1MB, nên các thông điệp lớn phải chia nhỏ. Điều này có thể gây thêm độ trễ và phức tạp.
  - Đảm bảo thứ tự: Kafka chỉ đảm bảo thứ tự bên trong mỗi partition. Nếu một topic có nhiều partition, thứ tự giữa các partition không được đảm bảo. Hơn nữa, khi retry xử lý tin trong partition đang đọc, consumer không thể bỏ qua tin lỗi mà phải xử lý tuần tự, nếu không sẽ mất thứ tự.
  - Cần thời gian để ổn định: Vì giữ lại tin lâu dài nên cluster Kafka yêu cầu ổn định cao (như đĩa cứng đủ lớn). Kafka thích hợp với trường hợp cần lịch sử hoặc luồng dữ liệu lớn. Nếu chỉ cần truyền tin tức thời và xử lý xong là xóa, thì có thể dùng RabbitMQ (tác vụ) cho đơn giản hơn.

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



## Part 7 - RabbitMQ vs Kafka

| **Tiêu chí** | **RabbitMQ** | **Kafka** |
|--------------|--------------|-----------|
| **Model** | Message Broker truyền thống (AMQP), tập trung vào routing, queue, exchange | Distributed Commit Log, Event Streaming Platform, tối ưu throughput và lưu trữ dài hạn |
| **Delivery mechanism** | **Push–Ack**: broker đẩy tin xuống consumer; consumer ack thì tin bị xóa | **Pull–Retain**: consumer tự kéo tin theo offset; tin giữ lại theo retention, không xóa |
| **Throughput** | Vài **chục nghìn msg/s** | **Hàng trăm nghìn → hàng triệu msg/s** |
| **Latency** | Thấp khi không backlog; tăng khi tải cao | Thấp và ổn định nhờ batching; có thể tăng do polling |
| **Retention** | Xóa tin ngay sau khi consumer ack | Giữ tin theo thời gian cấu hình (days, weeks…) |
| **Ordering** | Đảm bảo thứ tự **chỉ khi có 1 consumer**; nhiều consumer mất thứ tự | Đảm bảo thứ tự **trong 1 partition**; nhiều partition không giữ thứ tự toàn cục |
| **Use cases** | Work queue, task processing, RPC, routing fanout/topic/direct | Event streaming, log processing, analytics, event sourcing, high-throughput pub/sub |
| **Complexity** | Dễ cài, dễ dùng; clustering phức tạp | Phức tạp hơn: cluster + partition + replication |
| **Replay capability** | Không hỗ trợ replay | Replay bằng offset (cực mạnh) |


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

### 8.3 Use Kafka when
Chọn Kafka khi:
- Bạn cần xử lý event stream lớn, throughput hàng ngàn đến hàng triệu messages/giây.
- Kiến trúc mang tính event-driven, event sourcing, hoặc CQRS.
- Cần persist event log để đọc lại hoặc reprocess khi cần.
- Cần horizontal scaling mạnh với partition, consumer group.
- Cần đảm bảo ordering theo partition hoặc exactly-once semantics.
- Workflow thiên về data streaming, analytics, log collection, real-time pipeline.
Không phù hợp nếu workload nhẹ, cần routing phức tạp, hoặc cần queue semantics kiểu FIFO đơn giản.


## Part 9 - Hybrid Architectures

### 9.1 Combining approaches

- Hệ thống thực tế thường cần kết hợp cả synchronous (gRPC) và asynchronous (RabbitMQ/Kafka) để tận dụng ưu điểm của mỗi mô hình.
- gRPC dùng cho các request cần phản hồi ngay: validation, tính toán giá trị, CRUD nội bộ, kiểm tra trạng thái.
- Message broker dùng cho các tác vụ không cần kết quả tức thời: gửi email, cập nhật kho, đồng bộ dữ liệu, indexing, logging, analytics.
- Một pattern phổ biến: service xử lý request qua gRPC → publish sự kiện sang broker để các service khác xử lý tiếp (OrderCreated, PaymentCompleted, UserSignedUp...).
- gRPC stream có thể kết hợp với Kafka stream: gRPC để nhận dữ liệu real-time từ client/device, Kafka xử lý nền với throughput lớn.
- Hybrid architecture giúp vừa giữ được độ trễ thấp cho các thao tác quan trọng, vừa đảm bảo hệ thống mở rộng tốt và không bị coupling chặt giữa các service.

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


## Part 10 - Demos & Hands-on

### 10.1 Demo 1: gRPC Service

### 10.2 Demo 3: Kafka Event Streaming

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
