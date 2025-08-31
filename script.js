document.addEventListener("DOMContentLoaded", function () {
    const books = [];
    const RENDER_EVENT = "render-buku";
    const STORAGE_KEY = "RAK_BUKU_APPS";

    const formTambahBuku = document.getElementById("formTambahBuku");
    const rakBelumSelesai = document.getElementById("rakBelumSelesai");
    const rakSelesaiDibaca = document.getElementById("rakSelesaiDibaca");

    function buatId() {
        return +new Date();
    }

    function buatObjekBuku(id, judul, penulis, tahun, selesaiDibaca) {
        return {
            id,
            judul,
            penulis,
            tahun,
            selesaiDibaca
        };
    }
    
    function cariBuku(bookId) {
        for (const bookItem of books) {
            if (bookItem.id === bookId) {
                return bookItem;
            }
        }
        return null;
    }

    function cariIndeksBuku(bookId) {
        for (const index in books) {
            if (books[index].id === bookId) {
                return index;
            }
        }
        return -1;
    }

    function cekDukunganStorage() {
        if (typeof(Storage) === "undefined") {
            alert("Browser kamu tidak mendukung local storage");
            return false;
        }
        return true;
    }

    function simpanData() {
        if (cekDukunganStorage()) {
            const parsed = JSON.stringify(books);
            localStorage.setItem(STORAGE_KEY, parsed);
        }
    }

    function muatDataDariStorage() {
        const serializedData = localStorage.getItem(STORAGE_KEY);
        let data = JSON.parse(serializedData);

        if (data !== null) {
            for (const book of data) {
                books.push(book);
            }
        }
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
    
    function buatTampilanBuku(bookObject) {
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
        
        infoBuku.append(judulBuku, penulisBuku, tahunBuku);

        const aksiItem = document.createElement("div");
        aksiItem.classList.add("aksi-item");

        const tombolHapus = document.createElement("button");
        tombolHapus.classList.add("tombol-hapus");
        tombolHapus.innerText = "Hapus Buku";
        
        tombolHapus.addEventListener("click", function () {
            const konfirmasi = confirm("yakin nih dihapus?");
            if (konfirmasi) {
                const bookIndex = cariIndeksBuku(bookObject.id);
                if (bookIndex !== -1) {
                    books.splice(bookIndex, 1);
                    document.dispatchEvent(new Event(RENDER_EVENT));
                    simpanData();
                }
            }
        }
        );
        
        if (bookObject.selesaiDibaca) {
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
            }
          );

            aksiItem.append(tombolBacaUlang, tombolHapus);
        } else {
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
            }
          );

            aksiItem.append(tombolSelesai, tombolHapus);
        }

        itemBuku.append(infoBuku, aksiItem);
        return itemBuku;
    }
    
    formTambahBuku.addEventListener("submit", function (event) {
        event.preventDefault();
        const judul = document.getElementById("inputJudul").value;
        const penulis = document.getElementById("inputPenulis").value;
        const tahun = document.getElementById("inputTahun").value;
        const selesaiDibaca = document.getElementById("inputSelesaiDibaca").checked;
        
        const id = buatId();
        const bookObject = buatObjekBuku(id, judul, penulis, Number(tahun), selesaiDibaca);
        
        books.push(bookObject);
        document.dispatchEvent(new Event(RENDER_EVENT));
        simpanData();
        formTambahBuku.reset();
    }
    );

    document.addEventListener(RENDER_EVENT, function () {
        rakBelumSelesai.innerHTML = "";
        rakSelesaiDibaca.innerHTML = "";

        for (const bookItem of books) {
            const bookElement = buatTampilanBuku(bookItem);
            
            if (!bookItem.selesaiDibaca) {
                rakBelumSelesai.append(bookElement);
            } else {
                rakSelesaiDibaca.append(bookElement);
            }
        }
    }
    );

    if (cekDukunganStorage()) {
        muatDataDariStorage();
    }
}
);