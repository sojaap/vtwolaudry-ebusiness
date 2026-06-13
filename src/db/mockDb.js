// Mock database utilizing localStorage to persist states and active session.
// Guards for Next.js Server-Side Rendering (SSR).

const isClient = typeof window !== 'undefined';

const DEFAULT_PELANGGAN = [
  { idPelanggan: 'PLG001', nama_pelanggan: 'Budi Santoso', no_hp: 6281234567890, username: 'budi', password: '123' },
  { idPelanggan: 'PLG002', nama_pelanggan: 'Siti Rahma', no_hp: 6289876543210, username: 'siti', password: '123' },
  { idPelanggan: 'PLG003', nama_pelanggan: 'Rian Wijaya', no_hp: 6285711223344, username: 'rian', password: '123' },
  { idPelanggan: 'PLG004', nama_pelanggan: 'Indah Permata', no_hp: 6281299887766, username: 'indah', password: '123' }
];

const DEFAULT_KASIR = [
  { idKasir: 'KSR001', nama_kasir: 'Andi Setiawan', no_hp: 628111222333, username: 'andi', password: '123', role: 'cashier' },
  { idKasir: 'KSR002', nama_kasir: 'Dewi Lestari', no_hp: 628222333444, username: 'dewi', password: '123', role: 'cashier' }
];

const DEFAULT_TOKO = [
  { idToko: 'TOK001', nama_toko: 'VTwo Laundry - Kebayoran', alamat: 'Jl. Kebayoran Baru No. 45, Jakarta Selatan', no_tlp: 62215551234 },
  { idToko: 'TOK002', nama_toko: 'VTwo Laundry - Bintaro', alamat: 'Jl. Bintaro Utama Sektor 3 No. 12, Tangerang', no_tlp: 62215555678 }
];

const DEFAULT_PARFUM = [
  { idParfum: 'PFM001', nama_parfum: 'Lavender Fresh', stok_tersedia: 50 },
  { idParfum: 'PFM002', nama_parfum: 'Ocean Breeze', stok_tersedia: 35 },
  { idParfum: 'PFM003', nama_parfum: 'Sakura Blossom', stok_tersedia: 40 },
  { idParfum: 'PFM004', nama_parfum: 'Vanilla Sweet', stok_tersedia: 25 }
];

const DEFAULT_LAYANAN = [
  { idLayanan: 'LYN001', nama_layanan: 'Single Size Package', satuan: 'Minggu', harga: 50000 },
  { idLayanan: 'LYN002', nama_layanan: 'Couples Size Package', satuan: 'Minggu', harga: 80000 },
  { idLayanan: 'LYN003', nama_layanan: 'Family Size Package', satuan: 'Minggu', harga: 250000 },
  { idLayanan: 'LYN004', nama_layanan: 'Cuci Kiloan Standard', satuan: 'Kg', harga: 7000 },
  { idLayanan: 'LYN005', nama_layanan: 'Cuci Kiloan Ekspres', satuan: 'Kg', harga: 12000 },
  { idLayanan: 'LYN006', nama_layanan: 'Setrika Kiloan', satuan: 'Kg', harga: 5000 }
];

const DEFAULT_TRX_LAUNDRY = [
  {
    no_struk: 'TRX001',
    idParfum: 'PFM001',
    idPelanggan: 'PLG001',
    idKasir: 'KSR001',
    idToko: 'TOK001',
    grand_total: 80000,
    dp: 50000,
    sisa: 30000,
    tgl_transaksi: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Completed',
    delivery_type: 'Self Pickup',
    delivery_address: '',
    delivery_status: 'Not Started'
  },
  {
    no_struk: 'TRX002',
    idParfum: 'PFM003',
    idPelanggan: 'PLG002',
    idKasir: 'KSR001',
    idToko: 'TOK001',
    grand_total: 250000,
    dp: 250000,
    sisa: 0,
    tgl_transaksi: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Delivery',
    delivery_type: 'Home Delivery',
    delivery_address: 'Jl. Melati No. 10, Jakarta Selatan',
    delivery_status: 'In Transit'
  },
  {
    no_struk: 'TRX003',
    idParfum: 'PFM002',
    idPelanggan: 'PLG003',
    idKasir: 'KSR002',
    idToko: 'TOK002',
    grand_total: 64000,
    dp: 30000,
    sisa: 34000,
    tgl_transaksi: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Wash & Dry',
    delivery_type: 'Self Pickup',
    delivery_address: '',
    delivery_status: 'Not Started'
  },
  {
    no_struk: 'TRX004',
    idParfum: 'PFM004',
    idPelanggan: 'PLG004',
    idKasir: 'KSR002',
    idToko: 'TOK002',
    grand_total: 50000,
    dp: 0,
    sisa: 50000,
    tgl_transaksi: new Date().toISOString(),
    status: 'Pickup',
    delivery_type: 'Home Delivery',
    delivery_address: 'Apartemen Green View Tower B #12A',
    delivery_status: 'Not Started'
  }
];

const DEFAULT_TRX_LAYANAN = [
  { idTrxLayanan: 1, no_struk: 'TRX001', idLayanan: 'LYN002', kuantitas: 1, total_harga: 80000 },
  { idTrxLayanan: 2, no_struk: 'TRX002', idLayanan: 'LYN003', kuantitas: 1, total_harga: 250000 },
  { idTrxLayanan: 3, no_struk: 'TRX003', idLayanan: 'LYN005', kuantitas: 5, total_harga: 60000 },
  { idTrxLayanan: 4, no_struk: 'TRX003', idLayanan: 'LYN006', kuantitas: 0.8, total_harga: 4000 },
  { idTrxLayanan: 5, no_struk: 'TRX004', idLayanan: 'LYN001', kuantitas: 1, total_harga: 50000 }
];

export function getDb() {
  if (!isClient) {
    return {
      pelanggan: DEFAULT_PELANGGAN,
      kasir: DEFAULT_KASIR,
      toko: DEFAULT_TOKO,
      parfum: DEFAULT_PARFUM,
      layanan: DEFAULT_LAYANAN,
      trxLaundry: DEFAULT_TRX_LAUNDRY,
      trxLayanan: DEFAULT_TRX_LAYANAN
    };
  }

  if (!localStorage.getItem('vtl_initialized')) {
    localStorage.setItem('vtl_pelanggan', JSON.stringify(DEFAULT_PELANGGAN));
    localStorage.setItem('vtl_kasir', JSON.stringify(DEFAULT_KASIR));
    localStorage.setItem('vtl_toko', JSON.stringify(DEFAULT_TOKO));
    localStorage.setItem('vtl_parfum', JSON.stringify(DEFAULT_PARFUM));
    localStorage.setItem('vtl_layanan', JSON.stringify(DEFAULT_LAYANAN));
    localStorage.setItem('vtl_trxLaundry', JSON.stringify(DEFAULT_TRX_LAUNDRY));
    localStorage.setItem('vtl_trxLayanan', JSON.stringify(DEFAULT_TRX_LAYANAN));
    localStorage.setItem('vtl_initialized', 'true');
  }

  return {
    pelanggan: JSON.parse(localStorage.getItem('vtl_pelanggan')),
    kasir: JSON.parse(localStorage.getItem('vtl_kasir')),
    toko: JSON.parse(localStorage.getItem('vtl_toko')),
    parfum: JSON.parse(localStorage.getItem('vtl_parfum')),
    layanan: JSON.parse(localStorage.getItem('vtl_layanan')),
    trxLaundry: JSON.parse(localStorage.getItem('vtl_trxLaundry')),
    trxLayanan: JSON.parse(localStorage.getItem('vtl_trxLayanan'))
  };
}

export function saveDb(data) {
  if (!isClient) return;
  if (data.pelanggan) localStorage.setItem('vtl_pelanggan', JSON.stringify(data.pelanggan));
  if (data.kasir) localStorage.setItem('vtl_kasir', JSON.stringify(data.kasir));
  if (data.toko) localStorage.setItem('vtl_toko', JSON.stringify(data.toko));
  if (data.parfum) localStorage.setItem('vtl_parfum', JSON.stringify(data.parfum));
  if (data.layanan) localStorage.setItem('vtl_layanan', JSON.stringify(data.layanan));
  if (data.trxLaundry) localStorage.setItem('vtl_trxLaundry', JSON.stringify(data.trxLaundry));
  if (data.trxLayanan) localStorage.setItem('vtl_trxLayanan', JSON.stringify(data.trxLayanan));
}

// AUTH HANDLERS
export function login(username, password, portalType = 'customer') {
  if (!isClient) return null;
  const db = getDb();

  if (portalType === 'admin') {
    // Check owner accounts
    if (username.toLowerCase() === 'owner' && password === '123') {
      const ownerUser = { username: 'owner', name: 'Owner VTwo', role: 'owner' };
      localStorage.setItem('vtl_current_user', JSON.stringify(ownerUser));
      return ownerUser;
    }
    // Check cashier accounts
    const cashier = db.kasir.find(
      (c) => c.username.toLowerCase() === username.toLowerCase() && c.password === password
    );
    if (cashier) {
      const cashierUser = { username: cashier.username, name: cashier.nama_kasir, id: cashier.idKasir, role: 'cashier' };
      localStorage.setItem('vtl_current_user', JSON.stringify(cashierUser));
      return cashierUser;
    }
  } else {
    // Check customer accounts
    const customer = db.pelanggan.find(
      (p) => p.username && p.username.toLowerCase() === username.toLowerCase() && p.password === password
    );
    if (customer) {
      const custUser = { username: customer.username, name: customer.nama_pelanggan, id: customer.idPelanggan, role: 'customer' };
      localStorage.setItem('vtl_current_user', JSON.stringify(custUser));
      return custUser;
    }
  }

  return null;
}

export function register(username, password, name, phone) {
  if (!isClient) return null;
  const db = getDb();

  // Check if username already exists
  const existUser = db.pelanggan.find(
    (p) => p.username && p.username.toLowerCase() === username.toLowerCase()
  );
  if (existUser) return null;

  const nextNum = db.pelanggan.length + 1;
  const idPelanggan = `PLG${String(nextNum).padStart(3, '0')}`;

  const newPelanggan = {
    idPelanggan,
    nama_pelanggan: name,
    no_hp: Number(phone),
    username,
    password
  };

  db.pelanggan.push(newPelanggan);
  saveDb(db);

  // Auto login
  const custUser = { username, name, id: idPelanggan, role: 'customer' };
  localStorage.setItem('vtl_current_user', JSON.stringify(custUser));
  return custUser;
}

export function getCurrentUser() {
  if (!isClient) return null;
  const user = localStorage.getItem('vtl_current_user');
  return user ? JSON.parse(user) : null;
}

export function logout() {
  if (!isClient) return;
  localStorage.removeItem('vtl_current_user');
}

// Helpers
export function addPelanggan(pelanggan) {
  const db = getDb();
  const newPelanggan = {
    idPelanggan: pelanggan.idPelanggan || `PLG${String(db.pelanggan.length + 1).padStart(3, '0')}`,
    ...pelanggan
  };
  db.pelanggan.push(newPelanggan);
  saveDb(db);
  return newPelanggan;
}

export function addTransaction(transaction, items) {
  const db = getDb();
  
  // Create receipt number
  const nextNum = db.trxLaundry.length + 1;
  const no_struk = `TRX${String(nextNum).padStart(3, '0')}`;
  
  const newTrx = {
    no_struk,
    idParfum: transaction.idParfum || 'PFM001',
    idPelanggan: transaction.idPelanggan || 'PLG001',
    idKasir: transaction.idKasir || 'KSR001',
    idToko: transaction.idToko || 'TOK001',
    grand_total: Number(transaction.grand_total) || 0,
    dp: Number(transaction.dp) || 0,
    sisa: Number(transaction.sisa) || 0,
    tgl_transaksi: new Date().toISOString(),
    status: transaction.status || 'Pickup',
    delivery_type: transaction.delivery_type || 'Self Pickup',
    delivery_address: transaction.delivery_address || '',
    delivery_status: transaction.delivery_status || 'Not Started'
  };

  db.trxLaundry.push(newTrx);

  // Add services detail
  items.forEach((item) => {
    const nextItemNum = db.trxLayanan.length + 1;
    db.trxLayanan.push({
      idTrxLayanan: nextItemNum,
      no_struk: no_struk,
      idLayanan: item.idLayanan,
      kuantitas: Number(item.kuantitas) || 1,
      total_harga: Number(item.total_harga) || 0
    });
  });

  // Reduce perfume stock
  const pIdx = db.parfum.findIndex(p => p.idParfum === newTrx.idParfum);
  if (pIdx !== -1 && db.parfum[pIdx].stok_tersedia > 0) {
    db.parfum[pIdx].stok_tersedia = Math.max(0, db.parfum[pIdx].stok_tersedia - 1);
  }

  saveDb(db);
  return newTrx;
}

export function updateTransactionStatus(no_struk, status, delivery_status = null) {
  const db = getDb();
  const idx = db.trxLaundry.findIndex(t => t.no_struk === no_struk);
  if (idx !== -1) {
    db.trxLaundry[idx].status = status;
    if (delivery_status) {
      db.trxLaundry[idx].delivery_status = delivery_status;
    }
    saveDb(db);
    return db.trxLaundry[idx];
  }
  return null;
}

export function updateTransactionDelivery(no_struk, delivery_type, delivery_address, delivery_status) {
  const db = getDb();
  const idx = db.trxLaundry.findIndex(t => t.no_struk === no_struk);
  if (idx !== -1) {
    db.trxLaundry[idx].delivery_type = delivery_type;
    db.trxLaundry[idx].delivery_address = delivery_address;
    db.trxLaundry[idx].delivery_status = delivery_status;
    saveDb(db);
    return db.trxLaundry[idx];
  }
  return null;
}
