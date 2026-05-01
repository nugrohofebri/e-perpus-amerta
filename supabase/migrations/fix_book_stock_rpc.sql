-- =====================================================
-- Fungsi RPC: decrement_book_stock
-- Dijalankan dengan SECURITY DEFINER sehingga bypass RLS
-- dan dapat mengupdate stok buku meskipun dipanggil user biasa
-- =====================================================

CREATE OR REPLACE FUNCTION decrement_book_stock(p_book_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_available INTEGER;
  v_total INTEGER;
  v_new_available INTEGER;
  v_new_status book_status;  -- Gunakan tipe enum yang benar
BEGIN
  -- Kunci row agar tidak ada race condition
  SELECT available_copies, total_copies
  INTO v_available, v_total
  FROM books
  WHERE id = p_book_id
  FOR UPDATE;

  -- Validasi
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Buku tidak ditemukan');
  END IF;

  IF v_available <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Stok buku habis');
  END IF;

  -- Kurangi stok
  v_new_available := v_available - 1;
  -- Cast ke enum book_status
  v_new_status := CASE WHEN v_new_available <= 0 THEN 'borrowed'::book_status ELSE 'available'::book_status END;

  -- Update
  UPDATE books
  SET 
    available_copies = v_new_available,
    status = v_new_status
  WHERE id = p_book_id;

  RETURN jsonb_build_object(
    'success', true,
    'available_copies', v_new_available,
    'status', v_new_status::text
  );
END;
$$;

-- =====================================================
-- Fungsi RPC: increment_book_stock  
-- Untuk mengembalikan stok saat buku dikembalikan / peminjaman expired
-- =====================================================

CREATE OR REPLACE FUNCTION increment_book_stock(p_book_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_available INTEGER;
  v_total INTEGER;
  v_new_available INTEGER;
BEGIN
  SELECT available_copies, total_copies
  INTO v_available, v_total
  FROM books
  WHERE id = p_book_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Buku tidak ditemukan');
  END IF;

  v_new_available := LEAST(v_total, v_available + 1);

  UPDATE books
  SET 
    available_copies = v_new_available,
    status = 'available'::book_status  -- Cast ke enum
  WHERE id = p_book_id;

  RETURN jsonb_build_object(
    'success', true,
    'available_copies', v_new_available
  );
END;
$$;

-- Grant eksekusi ke semua authenticated users
GRANT EXECUTE ON FUNCTION decrement_book_stock(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_book_stock(UUID) TO authenticated;
