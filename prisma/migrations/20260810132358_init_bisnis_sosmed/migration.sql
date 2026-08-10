-- CreateTable
CREATE TABLE "paket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kode_paket" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "nama_paket" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "estimasi" TEXT NOT NULL,
    "garansi" TEXT NOT NULL,
    "butuh_password" BOOLEAN NOT NULL DEFAULT false,
    "status_aktif" BOOLEAN NOT NULL DEFAULT true,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "dibuatPada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diupdatePada" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pelanggan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomor_wa" TEXT NOT NULL,
    "nama" TEXT,
    "total_order" INTEGER NOT NULL DEFAULT 0,
    "dibuatPada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diupdatePada" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "no_invoice" TEXT NOT NULL,
    "kode_paket" INTEGER NOT NULL,
    "paket_id" INTEGER NOT NULL,
    "pelanggan_id" INTEGER NOT NULL,
    "nomor_wa_pelanggan" TEXT NOT NULL,
    "link_akun" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL DEFAULT 1,
    "total_harga" INTEGER NOT NULL,
    "status_order" TEXT NOT NULL DEFAULT 'MENUNGGU_BAYAR',
    "bukti_bayar_url" TEXT,
    "catatan_admin" TEXT,
    "id_order_provider" TEXT,
    "dibuatPada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diupdatePada" DATETIME NOT NULL,
    CONSTRAINT "order_paket_id_fkey" FOREIGN KEY ("paket_id") REFERENCES "paket" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_pelanggan_id_fkey" FOREIGN KEY ("pelanggan_id") REFERENCES "pelanggan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "log_pesan_wa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomor_pengirim" TEXT NOT NULL,
    "nomor_tujuan" TEXT NOT NULL,
    "isi_pesan" TEXT NOT NULL,
    "tipe" TEXT NOT NULL DEFAULT 'MASUK',
    "sudah_diproses" BOOLEAN NOT NULL DEFAULT false,
    "dibuatPada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "pengaturan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kunci" TEXT NOT NULL,
    "nilai" TEXT NOT NULL,
    "keterangan" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "paket_kode_paket_key" ON "paket"("kode_paket");

-- CreateIndex
CREATE INDEX "paket_kode_paket_idx" ON "paket"("kode_paket");

-- CreateIndex
CREATE UNIQUE INDEX "pelanggan_nomor_wa_key" ON "pelanggan"("nomor_wa");

-- CreateIndex
CREATE INDEX "pelanggan_nomor_wa_idx" ON "pelanggan"("nomor_wa");

-- CreateIndex
CREATE UNIQUE INDEX "order_no_invoice_key" ON "order"("no_invoice");

-- CreateIndex
CREATE INDEX "order_no_invoice_idx" ON "order"("no_invoice");

-- CreateIndex
CREATE INDEX "order_kode_paket_idx" ON "order"("kode_paket");

-- CreateIndex
CREATE INDEX "order_nomor_wa_pelanggan_idx" ON "order"("nomor_wa_pelanggan");

-- CreateIndex
CREATE INDEX "order_status_order_idx" ON "order"("status_order");

-- CreateIndex
CREATE UNIQUE INDEX "pengaturan_kunci_key" ON "pengaturan"("kunci");
