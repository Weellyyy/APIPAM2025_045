-- Tabel User/Admin
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin') DEFAULT 'admin'
);

-- Tabel Toko
CREATE TABLE toko (
    toko_id INT AUTO_INCREMENT PRIMARY KEY,
    nama_toko VARCHAR(100) NOT NULL,
    alamat TEXT,
    kontak VARCHAR(50)
);

-- Tabel Barang
CREATE TABLE barang (
    barang_id INT AUTO_INCREMENT PRIMARY KEY,
    nama_barang VARCHAR(100) NOT NULL,
    stok INT NOT NULL DEFAULT 0,
    harga DECIMAL(15,2) NOT NULL,
    gambar_url VARCHAR(255)
);

-- Tabel Order
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    tanggal DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    toko_id INT,
    user_id INT,
    total DECIMAL(15,2) NOT NULL,
    status ENUM('pending','selesai','batal') DEFAULT 'pending',
    FOREIGN KEY (toko_id) REFERENCES toko(toko_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- PERBAIKAN: Jika tabel sudah ada, jalankan query ini untuk update foreign key toko_id:
-- ALTER TABLE orders DROP FOREIGN KEY orders_ibfk_1;
-- ALTER TABLE orders MODIFY toko_id INT NULL;
-- ALTER TABLE orders ADD CONSTRAINT orders_ibfk_1 FOREIGN KEY (toko_id) REFERENCES toko(toko_id) ON DELETE SET NULL;

-- Tabel Detail Order (item per order)
CREATE TABLE order_detail (
    orderdetail_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    barang_id INT,
    jumlah INT NOT NULL,
    harga_satuan DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (barang_id) REFERENCES barang(barang_id)
);

-- Tabel Invoice
CREATE TABLE invoice (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    tanggal DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    file_url VARCHAR(255),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

--ALTER TABLE orders ADD COLUMN user_id INT;
--ALTER TABLE orders ADD FOREIGN KEY (user_id) REFERENCES users(user_id);

