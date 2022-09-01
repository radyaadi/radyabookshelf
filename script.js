//modal
const modalOverlay = document.querySelector('.modal-overlay');
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');

//dom manipulation
const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'book-storage';

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('book-form');
    submitForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addBook();
    });

    searchBook();

    if (isStorageExist()) {
        loadBook();
    }
});

function searchBook() {
    const resultRow = document.getElementById('search-result');
    const bookRow = document.createElement('tr');
    const titleColumn = document.createElement('td');
    const authorColumn = document.createElement('td');
    const yearColumn = document.createElement('td');

    const notFoundRow = document.createElement('tr');
    const notFoundMesagge = document.createElement('td');

    const searchButton = document.getElementById('btn-search');
    searchButton.onclick = (e) => {
        e.preventDefault();
        resultRow.innerHTML = '';

        const searchItem = document.getElementById('search-title').value.toLowerCase();
        for (let book of books) {
            if (book.title.toLowerCase() == searchItem) {
                // console.log(book.title + book.author + book.year);
                resultRow.innerHTML = '';
                titleColumn.innerText = book.title;
                authorColumn.innerText = book.author;
                yearColumn.innerText = book.year;

                bookRow.append(titleColumn, authorColumn, yearColumn);
                resultRow.append(bookRow);
                break;
            } else {
                bookRow.innerHTML = '';
                notFoundMesagge.innerText = "Buku tidak Ditemukan";
                notFoundMesagge.setAttribute('colspan', '3');
                notFoundRow.append(notFoundMesagge);
                resultRow.append(notFoundRow);
            }
        }
    }
}

function addBook() {
    const bookId = generateId();
    const bookTitle = document.getElementById('title').value;
    const bookAuthor = document.getElementById('author').value;
    const bookYear = document.getElementById('year').value;

    const bookObject = generateBookObject(bookId, bookTitle, bookAuthor, bookYear, false);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function makeBook(bookObject) {
    //book row elemet
    const bookRow = document.createElement('tr');
    const titleColumn = document.createElement('td');
    const authorColumn = document.createElement('td');
    const yearColumn = document.createElement('td');

    titleColumn.innerText = bookObject.title;
    authorColumn.innerText = bookObject.author;
    yearColumn.innerText = bookObject.year;

    //action book container
    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action');

    if (bookObject.isComplete) {
        // undo button
        undoButton = document.createElement('button');
        undoButton.classList.add('btn-undo');
        undoButton.setAttribute('title', 'Tandai Belum Selesai Dibaca');
        undoLogo = document.createElement('i');
        undoLogo.classList.add('fas', 'fa-undo');
        undoButton.append(undoLogo);

        undoButton.addEventListener('click', function() {
            undoBookFromComplete(bookObject.id);
        });
        actionContainer.append(undoButton);
    } else {
        // check button
        checkButton = document.createElement('button');
        checkButton.classList.add('btn-check');
        checkButton.setAttribute('title', 'Tandai Sudah Dibaca');
        checkLogo = document.createElement('i');
        checkLogo.classList.add('fas', 'fa-check');
        checkButton.append(checkLogo);

        checkButton.addEventListener('click', function() {
            addBookToCompleted(bookObject.id);
        });
        actionContainer.append(checkButton);
    }

    // delete button
    deleteButton = document.createElement('button');
    deleteButton.classList.add('btn-delete');
    deleteButton.setAttribute('title', 'Hapus Buku');
    deleteLogo = document.createElement('i');
    deleteLogo.classList.add('fas', 'fa-trash');
    deleteButton.append(deleteLogo);

    deleteButton.addEventListener('click', function() {
        modalOverlay.classList.toggle('active');
        btnYes.onclick = () => {
            removeBookFromList(bookObject.id);
            modalOverlay.classList.remove('active')
        }
        btnNo.onclick = () => {
            modalOverlay.classList.remove('active')
        }
    });
    actionContainer.append(deleteButton);

    // action book row
    const actionColumn = document.createElement('td');
    actionColumn.append(actionContainer);

    // book row
    bookRow.setAttribute('id', '${bookObject.id}');
    bookRow.append(titleColumn, authorColumn, yearColumn, actionColumn);

    return bookRow;
}

//button function
function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function undoBookFromComplete(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function removeBookFromList(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id == bookId) return index;
    }

    return -1;
}

function saveBook() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadBook() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert('Storage is not available');
        return false;
    }
    return true;
}

document.addEventListener(RENDER_EVENT, function() {
    // console.log(books);
    const uncompleteBookShelfList = document.getElementById('uncomplete-book-list');
    const completeBookShelfList = document.getElementById('complete-book-list');
    const resultRow = document.getElementById('search-result');
    uncompleteBookShelfList.innerHTML = '';
    completeBookShelfList.innerHTML = '';
    resultRow.innerHTML = '';


    for (let bookItem of books) {
        const bookElement = makeBook(bookItem);

        if (!bookItem.isComplete) uncompleteBookShelfList.append(bookElement);
        else completeBookShelfList.append(bookElement);
    }
});

document.addEventListener(SAVED_EVENT, function() {
    console.log(localStorage.getItem(STORAGE_KEY));
});