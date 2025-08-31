// Menunggu hingga seluruh halaman HTML selesai dimuat sebelum menjalankan JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Array untuk menyimpan semua data buku
  const books = [];

  // Nama custom event untuk memicu pembaruan tampilan
  const RENDER_EVENT = "render-buku";
  // Kunci untuk menyimpan dan mengambil data dari localStorage
  const STORAGE_KEY = "RAK_BUKU_APPS";

  // Menghubungkan variabel JavaScript ke elemen di HTML
  const formTambahBuku = document.getElementById("formTambahBuku");
  const rakBelumSelesai = document.getElementById("rakBelumSelesai");
  const rakSelesaiDibaca = document.getElementById("rakSelesaiDibaca");

  // Fungsi untuk membuat ID unik berdasarkan waktu
  function buatId() {
    return +new Date();
  }

  // Fungsi untuk membuat objek buku baru dari input form
  function buatObjekBuku(id, judul, penulis, tahun, selesaiDibaca) {
    return {
      id,
      judul,
      penulis,
      tahun,
      selesaiDibaca,
    };
  }

  // Fungsi untuk mencari buku di dalam array 'books' berdasarkan ID
  function cariBuku(bookId) {
    for (const bookItem of books) {
      if (bookItem.id === bookId) {
        return bookItem;
      }
    }
    return null;
  }

  // Fungsi untuk mencari indeks (posisi) buku di dalam array
  function cariIndeksBuku(bookId) {
    for (const index in books) {
      if (books[index].id === bookId) {
        return index;
      }
    }
    return -1;
  }

  // Fungsi untuk memeriksa apakah browser mendukung localStorage
  function cekDukunganStorage() {
    if (typeof Storage === "undefined") {
      alert("Browser kamu tidak mendukung local storage");
      return false;
    }
    return true;
  }

  // Fungsi untuk menyimpan data ke localStorage
  function simpanData() {
    if (cekDukunganStorage()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
    }
  }

  // Fungsi untuk memuat data dari localStorage saat halaman dibuka
  function muatDataDariStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
      for (const book of data) {
        books.push(book);
      }
    }
    // Panggil RENDER_EVENT untuk menampilkan data yang sudah dimuat
    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  // Fungsi untuk membuat elemen HTML yang akan ditampilkan
  function buatTampilanBuku(bookObject) {
    // Membuat elemen-elemen HTML
    const itemBuku = document.createElement("article");
    itemBuku.classList.add("item-buku");

    const infoBuku = document.createElement("div");
    infoBuku.classList.add("info-buku");

    const judulBuku = document.createElement("h3");
    judulBuku.innerText = bookObject.judul;

    const penulisBuku = document.createElement("p");
    penulisBuku.innerText = `Penulis: ${bookObject.penulis}`;

    const tahunBuku = document.createElement("p");
    tahunBuku.innerText = `Tahun: ${bookObject.tahun}`;

    // Menggabungkan info teks buku
    infoBuku.append(judulBuku, penulisBuku, tahunBuku);

    const aksiItem = document.createElement("div");
    aksiItem.classList.add("aksi-item");

    const tombolHapus = document.createElement("button");
    tombolHapus.classList.add("tombol-hapus");
    tombolHapus.innerText = "Hapus Buku";

    // Menambahkan fungsi pada tombol hapus
    tombolHapus.addEventListener("click", function () {
      // Munculkan dialog konfirmasi bawaan browser
      const konfirmasi = confirm("Apakah Anda yakin ingin menghapus buku ini?");
      if (konfirmasi) {
        const bookIndex = cariIndeksBuku(bookObject.id);
        if (bookIndex !== -1) {
          books.splice(bookIndex, 1);
          document.dispatchEvent(new Event(RENDER_EVENT));
          simpanData();
        }
      }
    });

    // Memeriksa apakah buku sudah selesai dibaca atau belum
    if (bookObject.selesaiDibaca) {
      // Jika sudah selesai, buat tombol 'Baca Ulang'
      const tombolBacaUlang = document.createElement("button");
      tombolBacaUlang.classList.add("tombol-baca-ulang");
      tombolBacaUlang.innerText = "Baca Ulang";

      tombolBacaUlang.addEventListener("click", function () {
        const buku = cariBuku(bookObject.id);
        if (buku) {
          buku.selesaiDibaca = false;
          document.dispatchEvent(new Event(RENDER_EVENT));
          simpanData();
        }
      });

      aksiItem.append(tombolBacaUlang, tombolHapus);
    } else {
      // Jika belum selesai, buat tombol 'Selesai Dibaca'
      const tombolSelesai = document.createElement("button");
      tombolSelesai.classList.add("tombol-selesai");
      tombolSelesai.innerText = "Selesai Dibaca";

      tombolSelesai.addEventListener("click", function () {
        const buku = cariBuku(bookObject.id);
        if (buku) {
          buku.selesaiDibaca = true;
          document.dispatchEvent(new Event(RENDER_EVENT));
          simpanData();
        }
      });

      aksiItem.append(tombolSelesai, tombolHapus);
    }

    // Menggabungkan semua elemen menjadi satu kartu buku
    itemBuku.append(infoBuku, aksiItem);
    return itemBuku;
  }

  // Listener saat form untuk menambah buku di-submit
  formTambahBuku.addEventListener("submit", function (event) {
    // Mencegah halaman refresh saat tombol submit ditekan
    event.preventDefault();

    // Mengambil nilai dari setiap input di form
    const judul = document.getElementById("inputJudul").value;
    const penulis = document.getElementById("inputPenulis").value;
    const tahun = document.getElementById("inputTahun").value;
    const selesaiDibaca = document.getElementById("inputSelesaiDibaca").checked;

    const id = buatId();
    const bookObject = buatObjekBuku(id, judul, penulis, Number(tahun), selesaiDibaca);

    // Memasukkan objek buku baru ke dalam array 'books'
    books.push(bookObject);
    // Memanggil custom event untuk memperbarui tampilan
    document.dispatchEvent(new Event(RENDER_EVENT));
    // Menyimpan data ke localStorage
    simpanData();
    // Mengosongkan form setelah submit
    formTambahBuku.reset();
  });

  // Listener utama yang akan dipanggil setiap kali RENDER_EVENT aktif
  document.addEventListener(RENDER_EVENT, function () {
    // Mengosongkan rak sebelum menampilkan buku yang baru
    rakBelumSelesai.innerHTML = "";
    rakSelesaiDibaca.innerHTML = "";

    // Melakukan perulangan pada setiap buku di dalam array 'books'
    for (const bookItem of books) {
      // Membuat elemen HTML untuk setiap buku
      const bookElement = buatTampilanBuku(bookItem);

      // Memisahkan buku ke rak yang sesuai
      if (!bookItem.selesaiDibaca) {
        rakBelumSelesai.append(bookElement);
      } else {
        rakSelesaiDibaca.append(bookElement);
      }
    }
  });

  // Memuat data dari storage saat halaman pertama kali dibuka
  if (cekDukunganStorage()) {
    muatDataDariStorage();
  }
});
