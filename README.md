# 🚀 Signum Task Dashboard

<img width="1693" alt="Ekran Resmi 2025-03-27 10 24 32" src="https://github.com/user-attachments/assets/c3b3c69b-120c-409b-bdee-abd0deb36bce" />


**Signum Task Dashboard**, mikroservis mimarisi ile geliştirilmiş, gerçek zamanlı görev yönetimi sağlayan modern bir uygulamadır.  
Yapılandırma, görev takibi ve kanban board üzerinden yönetim özellikleriyle ekiplerin görev planlamasını kolaylaştırır.

Frontend tarafında modern kütüphanelerle kullanıcı dostu bir arayüz sunarken, backend tarafında güçlü ve ölçeklenebilir servislerle desteklenmiştir.

---

## ✨ Özellikler

### 🧱 Structure (Yapı Menüsü)
- 3 katmanlı **tree list**: `Build → Floor → Space`
- Görev atamaları bu yapı üzerinden yapılır.

### ✅ Task Table
- Seçilen yapıya ait görevler listelenir.
- Görevlerin durumları: `To Do`, `In Progress`, `Done`
- Görevler üzerinde CRUD işlemleri yapılabilir.

### 📌 Kanban Board
- Gerçek zamanlı görev yönetimi
- Görev durumları **socket.io** ile güncellenir.
- Sürükle-bırak desteği

---

## 🛠️ Kullanılan Teknolojiler

### **Frontend**
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [PrimeReact](https://primereact.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.io Client](https://socket.io/)

### **Backend**

#### Status Service
- NestJS
- Neo4j
- Görev durumu (To Do, In Progress, Done) yönetimi
- CRUD API'ler

#### Task Service
- NestJS
- Neo4j
- Görev oluşturma, düzenleme, silme, listeleme
- Yapıya göre görev atama

#### Log Service
- NestJS
- MongoDB
- Kafka ile event-driven loglama
- Tüm işlemler MongoDB'ye kaydedilir

### **Ortak Bileşenler**
- **Docker** (Tüm servisler dockerize edilebilir)
- **Kafka** (Event-driven yapı için)
- **Socket.io** (Gerçek zamanlı veri akışı)
- **Migration Sistemi** (Veritabanı geçişleri için)

---

---

## ⚙️ Kurulum ve Çalıştırma

### 📦 Gereksinimler

Aşağıdaki servislerin makinenizde kurulu ve çalışıyor olması gerekir:

- [Docker](https://www.docker.com/)
- [Neo4j](https://neo4j.com/)
- [MongoDB](https://www.mongodb.com/)
- [Kafka](https://kafka.apache.org/)
- Node.js (v18+ önerilir)

---


# 🚀 Signum Task Dashboard Kurulum ve Çalıştırma

# 1. Reponun klonlanması
& git clone https://github.com/kullaniciadi/signum-task-dashboard.git
& cd signum-task-dashboard

# 2. Status Service kurulumu ve başlatılması
& cd status-service
& npm install
& npm run start:dev

# 3. Yeni bir terminal aç, Task Service için:
& cd task-service
& & npm install
& & npm run start:dev

# 4. Yeni bir terminal aç, Log Service için:
& cd log-service
& npm install
& npm run start:dev

# 5. Yeni bir terminal aç, Frontend için:
& cd frontend
& npm install
& npm run dev

# Notlar:
- Kafka, MongoDB ve Neo4j servislerinin kurulu ve çalışır durumda olması gerekmektedir.
- .env dosyalarının her serviste uygun şekilde ayarlanmış olması gerekir.
- Docker kullanılmak istenirse servisler kolayca container haline getirilebilir.

# 🤝 Katkı Sağlamak
Bu projeye katkıda bulunmak istersen:
1. Fork'la
2. Yeni bir branch oluştur: git checkout -b feature/yenilik
3. Geliştirmeleri yap ve commit et
4. Branch’i pushla: git push origin feature/yenilik
5. Pull Request gönder

# 🙌 Teşekkürler
Projeyi incelediğiniz, katkıda bulunduğunuz veya kullandığınız için teşekkür ederiz.
Geliştirmelere destek olmak isterseniz, issue açabilir veya direkt iletişime geçebilirsiniz.
