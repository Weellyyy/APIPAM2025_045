
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Invoice = require('../model/invoice');
const Order = require('../model/order');
const OrderDetail = require('../model/order_detail');

const invoiceController = {
  getAllInvoice: (req, res) => {
    Invoice.getAll((err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      
      // ✅ Convert null values untuk kompatibilitas frontend
      const invoices = results.map(inv => ({
        ...inv,
        nama_toko: inv.nama_toko || 'Toko dihapus'
      }));
      
      res.json(invoices);
    });
  },
  getInvoiceById: (req, res) => {
    Invoice.getById(req.params.id, (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      if (results.length === 0) return res.status(404).json({ message: 'Invoice tidak ditemukan' });
      
      // ✅ Convert null values untuk kompatibilitas frontend
      const invoice = {
        ...results[0],
        nama_toko: results[0].nama_toko || 'Toko dihapus'
      };
      
      res.json(invoice);
    });
  },
  getInvoiceByOrderId: (req, res) => {
    Invoice.getByOrderId(req.params.orderId, (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      if (results.length === 0) return res.status(404).json({ message: 'Invoice tidak ditemukan untuk order ini' });
      
      // ✅ Convert null values untuk kompatibilitas frontend
      const invoice = {
        ...results[0],
        nama_toko: results[0].nama_toko || 'Toko dihapus'
      };
      
      res.json(invoice);
    });
  },
  createInvoice: (req, res) => {
    Invoice.create(req.body, (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.json({ invoice_id: result.insertId, ...req.body });
    });
  },
  deleteInvoice: (req, res) => {
    Invoice.delete(req.params.id, (err) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.json({ message: 'Invoice dihapus' });
    });
  },
  generateInvoicePDF: (req, res) => {
    const invoiceId = req.params.id;
    Invoice.getById(invoiceId, (err, invoiceResults) => {
      if (err || invoiceResults.length === 0) return res.status(404).json({ message: 'Invoice tidak ditemukan' });
      const invoice = invoiceResults[0];
      
      Order.getById(invoice.order_id, (err, orderResults) => {
        if (err || orderResults.length === 0) return res.status(404).json({ message: 'Order tidak ditemukan' });
        const order = orderResults[0];
        
        // Ambil detail barang dari order_detail
        OrderDetail.getByOrderId(order.order_id, (err, items) => {
          if (err) return res.status(500).json({ message: 'Gagal ambil detail barang' });
          
          // Generate PDF
          const doc = new PDFDocument();
          const fileName = 'invoice_' + invoiceId + '.pdf';
          const filePath = path.join(__dirname, '../public', fileName);
          
          // Pastikan folder public ada
          if (!fs.existsSync(path.join(__dirname, '../public'))) {
            fs.mkdirSync(path.join(__dirname, '../public'));
          }
          
          doc.pipe(fs.createWriteStream(filePath));
          
          // Header Invoice
          doc.fontSize(25).text('INVOICE', { align: 'center' });
          doc.moveDown();
          doc.fontSize(12).text('================================================');
          doc.moveDown();
          
          // Info Invoice
          doc.fontSize(12).text('Invoice ID: INV-' + invoice.invoice_id);
          doc.text('Order ID: ORD-' + order.order_id);
          doc.text('Tanggal: ' + new Date(invoice.tanggal).toLocaleDateString('id-ID'));
          doc.text('Toko: ' + order.nama_toko);
          doc.text('Status: ' + order.status.toUpperCase());
          doc.moveDown();
          doc.text('================================================');
          doc.moveDown();
          
          // Detail Barang
          doc.fontSize(14).text('Detail Barang:', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(11);
          
          items.forEach((item, index) => {
            doc.text(`${index + 1}. ${item.nama_barang}`);
            doc.text(`   Jumlah: ${item.jumlah} x Rp ${Number(item.harga_satuan).toLocaleString('id-ID')} = Rp ${Number(item.subtotal).toLocaleString('id-ID')}`);
            doc.moveDown(0.3);
          });
          
          doc.moveDown();
          doc.text('================================================');
          doc.fontSize(14).text('TOTAL: Rp ' + Number(order.total).toLocaleString('id-ID'), { bold: true });
          doc.text('================================================');
          
          // Footer
          doc.moveDown(2);
          doc.fontSize(10).text('Terima kasih atas pembelian Anda!', { align: 'center' });
          
          doc.end();
          
          doc.on('finish', () => {
            // Update file_url di database
            Invoice.update(invoiceId, { file_url: '/public/' + fileName }, (err) => {
              if (err) console.error('Gagal update file_url:', err);
            });
            
            // Download file
            res.download(filePath, fileName);
          });
        });
      });
    });
  }
};

module.exports = invoiceController;
