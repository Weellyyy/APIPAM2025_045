
const Toko = require('../model/toko');

const tokoController = {
  getAllToko: (req, res) => {
    Toko.getAll((err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.json(results);
    });
  },
  getTokoById: (req, res) => {
    Toko.getById(req.params.id, (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      if (results.length === 0) return res.status(404).json({ message: 'Toko tidak ditemukan' });
      res.json(results[0]);
    });
  },
  createToko: (req, res) => {
    Toko.create(req.body, (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.json({ toko_id: result.insertId, ...req.body });
    });
  },
  updateToko: (req, res) => {
    Toko.update(req.params.id, req.body, (err) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.json({ message: 'Toko diperbarui' });
    });
  },
  deleteToko: (req, res) => {
    const tokoId = req.params.id;

    // Cek apakah toko ada
    Toko.getById(tokoId, (err, results) => {
      if (err) {
        console.error('[TOKO] Error getById:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Toko tidak ditemukan' });
      }

      // DELETE toko (toko_id di orders akan otomatis SET NULL oleh database)
      Toko.delete(tokoId, (err) => {
        if (err) {
          console.error('[TOKO] Error delete:', err.message);
          // Cek apakah error karena foreign key constraint
          if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ 
              message: 'Toko tidak bisa dihapus karena masih digunakan di order',
              error: 'FOREIGN_KEY_CONSTRAINT'
            });
          }
          return res.status(500).json({ 
            message: 'Gagal menghapus toko',
            error: err.message 
          });
        }

        console.log(`[TOKO] Toko ID ${tokoId} berhasil dihapus`);
        res.json({ message: 'Toko berhasil dihapus' });
      });
    });
  }
};

module.exports = tokoController;
