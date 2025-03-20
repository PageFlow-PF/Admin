import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase-configuratie
const firebaseConfig = {
    apiKey: "AIzaSyBAKE4dopleQro-BIASM8v-KG_VnYmc_4c",
    authDomain: "pageflow-609fa.firebaseapp.com",
    projectId: "pageflow-609fa",
    storageBucket: "pageflow-609fa.appspot.com",
    messagingSenderId: "66179754558",
    appId: "1:66179754558:web:2d6a0da33f77718dfc7f6f",
    measurementId: "G-WH5RKEY1EV"
};

// Initialiseer Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Referenties naar HTML-elementen
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");

// Inloggen met Google
loginButton.addEventListener("click", async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Ingelogd als:", user.email);
        checkAdminAccess(user); // Controleer of de gebruiker toegang heeft
    } catch (error) {
        console.error("Fout bij inloggen:", error); // Log de volledige fout
        alert("Er is een fout opgetreden bij het inloggen. Zie de console voor details.");
    }
});

// Uitloggen
logoutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);
        console.log("Uitgelogd");
        hideAdminContent(); // Verberg admin-functionaliteiten
    } catch (error) {
        console.error("Fout bij uitloggen:", error);
    }
});

// Controleer of de gebruiker is ingelogd
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Gebruiker is ingelogd:", user.email);
        checkAdminAccess(user); // Controleer of de gebruiker toegang heeft
    } else {
        console.log("Geen gebruiker ingelogd");
        hideAdminContent(); // Verberg admin-functionaliteiten
    }
});

// Functie om admin-functionaliteiten te tonen/verbergen
function showAdminContent() {
    document.querySelector(".add-book-form").classList.remove("hidden");
    document.getElementById("book-list").classList.remove("hidden");
    logoutButton.classList.remove("hidden");
    loginButton.classList.add("hidden");
    getBooks(); // Laad de boeken
}

function hideAdminContent() {
    document.querySelector(".add-book-form").classList.add("hidden");
    document.getElementById("book-list").classList.add("hidden");
    logoutButton.classList.add("hidden");
    loginButton.classList.remove("hidden");
}

// Functie om te controleren of de gebruiker toegang heeft
function checkAdminAccess(user) {
    if (user.email === "youssef11tyler@gmail.com") {
        showAdminContent(); // Toon admin-functionaliteiten
    } else {
        alert("Je hebt geen toegang tot deze pagina.");
        signOut(auth); // Log de gebruiker uit
    }
}

// Functie om boeken op te halen
async function getBooks() {
    const bookList = document.getElementById("book-list");
    bookList.innerHTML = "<p>Bezig met laden...</p>";

    try {
        const booksRef = collection(db, "books");
        const snapshot = await getDocs(booksRef);

        if (snapshot.empty) {
            bookList.innerHTML = "<p>Geen boeken gevonden.</p>";
            return;
        }

        bookList.innerHTML = ""; // Leeg de lijst
        snapshot.forEach(doc => {
            const bookData = doc.data();
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
        });
    } catch (error) {
        console.error("Fout bij het ophalen van boeken:", error);
        bookList.innerHTML = "<p>Er is een fout opgetreden bij het laden van de boeken.</p>";
    }
}

// Functie om een boek toe te voegen
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
};

// Functie om een boek te verwijderen
window.deleteBook = async function(bookId) {
    const user = auth.currentUser; // Haal de huidige gebruiker op

    if (!user) {
        alert("Je moet ingelogd zijn om een boek te verwijderen.");
        return;
    }

    if (user.email !== "youssef11tyler@gmail.com") {
        alert("Je hebt geen toegang tot deze functionaliteit.");
        return;
    }

    try {
        await deleteDoc(doc(db, "books", bookId));
        showFeedback("Boek succesvol verwijderd!");
        getBooks();
    } catch (e) {
        console.error("Fout bij verwijderen boek: ", e);
        showFeedback("Er is iets misgegaan bij het verwijderen van het boek.", true);
    }
};

// Functie om feedback te tonen
function showFeedback(message, isError = false) {
    const feedback = document.getElementById("feedback");
    feedback.textContent = message;
    feedback.className = isError ? "error" : "success";
    feedback.classList.remove("hidden");

    setTimeout(() => {
        feedback.classList.add("hidden");
    }, 3000);
}

// Functie om het formulier te resetten
function resetForm() {
    document.getElementById("bookTitle").value = "";
    document.getElementById("bookAuthor").value = "";
    document.getElementById("bookCategory").value = "";
    document.getElementById("bookDownloadLink").value = "";
    document.getElementById("bookCoverUrl").value = "";
}
