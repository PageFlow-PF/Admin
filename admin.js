import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBAKE4dopleQro-BIASM8v-KG_VnYmc_4c",
    authDomain: "pageflow-609fa.firebaseapp.com",
    projectId: "pageflow-609fa",
    storageBucket: "pageflow-609fa.appspot.com",
    messagingSenderId: "66179754558",
    appId: "1:66179754558:web:2d6a0da33f77718dfc7f6f",
    measurementId: "G-WH5RKEY1EV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let booksArray = [];

// Functie om boeken op te halen
async function getBooks() {
    const bookList = document.getElementById("book-list");
    bookList.innerHTML = "";

    try {
        const booksRef = collection(db, "books");
        const snapshot = await getDocs(booksRef);

        if (snapshot.empty) {
            bookList.innerHTML = "<p>Geen boeken gevonden.</p>";
            return;
        }

        let delay = 0;
        booksArray = [];

        snapshot.forEach(doc => {
            const bookData = doc.data();
            if (!bookData.downloadLink) {
                console.warn("⚠️ Geen downloadLink gevonden voor", bookData.title);
                return;
            }

            booksArray.push({ id: doc.id, ...bookData });

            const bookElement = document.createElement("div");
            bookElement.classList.add("book");

            bookElement.innerHTML = `
                <img src="${bookData.coverUrl}" alt="Boek Cover">
                <h2>${bookData.title}</h2>
                <button onclick="window.open('${bookData.downloadLink}', '_blank')">
                    📥 Download het boek
                </button>
                <button onclick="deleteBook('${doc.id}')" class="delete-button">
                    ❌ Verwijder
                </button>
            `;

            bookList.appendChild(bookElement);

            setTimeout(() => {
                bookElement.classList.add("show");
            }, delay);

            delay += 200;
        });

    } catch (error) {
        console.error("🔥 Fout bij het ophalen van boeken:", error);
        bookList.innerHTML = "<p>Er is een fout opgetreden bij het laden van de boeken.</p>";
    }
}

// Boeken ophalen bij het laden van de pagina
getBooks();

// 📝 Boek toevoegen
window.addBook = async function() {
    const title = document.getElementById("bookTitle").value.trim();
    const author = document.getElementById("bookAuthor").value.trim();
    const category = document.getElementById("bookCategory").value.trim();
    const downloadLink = document.getElementById("bookDownloadLink").value.trim();
    const coverUrl = document.getElementById("bookCoverUrl").value.trim();

    // Validatie
    if (!title || !author || !category || !downloadLink || !coverUrl) {
        showFeedback("Alle velden moeten ingevuld zijn.", true);
        return;
    }

    if (!isValidUrl(downloadLink) || !isValidUrl(coverUrl)) {
        showFeedback("Download link en cover URL moeten geldige URLs zijn.", true);
        return;
    }

    try {
        await addDoc(collection(db, "books"), {
            title: title,
            author: author,
            category: category,
            downloadLink: downloadLink,
            coverUrl: coverUrl
        });

        showFeedback("Boek succesvol toegevoegd!");
        resetForm();
        getBooks();
    } catch (e) {
        console.error("Fout bij toevoegen boek: ", e);
        showFeedback("Er is iets misgegaan bij het toevoegen van het boek.", true);
    }
}

// ❌ Boek verwijderen
window.deleteBook = async function(bookId) {
    try {
        await deleteDoc(doc(db, "books", bookId));
        showFeedback("Boek succesvol verwijderd!");
        getBooks();
    } catch (e) {
        console.error("Fout bij verwijderen boek: ", e);
        showFeedback("Er is iets misgegaan bij het verwijderen van het boek.", true);
    }
}

// Functie om feedback te tonen
function showFeedback(message, isError = false) {
    const feedback = document.getElementById("feedback");
    feedback.textContent = message;
    feedback.className = isError ? "error" : "";
    feedback.classList.remove("hidden");

    setTimeout(() => {
        feedback.classList.add("hidden");
    }, 3000);
}

// Functie om het formulier te resetten
function resetForm() {
    document.getElementById("bookTitle").value = '';
    document.getElementById("bookAuthor").value = '';
    document.getElementById("bookCategory").value = '';
    document.getElementById("bookDownloadLink").value = '';
    document.getElementById("bookCoverUrl").value = '';
}

// Functie om te controleren of een string een geldige URL is
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}
