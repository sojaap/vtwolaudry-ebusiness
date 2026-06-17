import { supabase } from './supabaseClient';

export async function fetchLayanan() {
  const { data, error } = await supabase
    .from('layanan')
    .select('*');

  if (error) {
    console.error(error.message);
    return [];
  }
  return data;
}

export async function createTransaction(transactionData, selectedItems) {
  const noStruk = `TRX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { error: headerError } = await supabase
    .from('trx_laundry')
    .insert([{
      no_struk: noStruk,
      id_pelanggan: transactionData.idPelanggan || null,
      grand_total: Number(transactionData.grand_total),
      dp: Number(transactionData.dp),
      sisa: Number(transactionData.sisa),
      status: 'Pickup',
      delivery_type: transactionData.delivery_type,
      delivery_address: transactionData.delivery_address,
      delivery_status: 'Not Started'
    }]);

  if (headerError) {
    console.error(headerError.message);
    return null;
  }

  const mappedItems = selectedItems.map((item) => ({
    no_struk: noStruk,
    id_layanan: item.id_layanan || item.idLayanan,
    kuantitas: Number(item.kuantitas),
    total_harga: Number(item.total_harga)
  }));

  const { error: detailError } = await supabase
    .from('trx_layanan')
    .insert(mappedItems);

  if (detailError) {
    console.error(detailError.message);
    return null;
  }

  return {
    no_struk: noStruk,
    tgl_transaksi: new Date().toISOString(),
    grand_total: transactionData.grand_total,
    dp: transactionData.dp,
    sisa: transactionData.sisa,
    status: 'Pickup'
  };
}