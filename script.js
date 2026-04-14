// Library Management System - JavaScript

// Data Storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let books = JSON.parse(localStorage.getItem('books')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = null;
let editingBookId = null;

// Initial Book Management List
const initialBooks = [
    { id: 'BK001', title: 'The God of Small Things', author: 'Arundhati Roy', category: 'Fiction', price: 399, isbn: '9780679457312' },
    { id: 'BK002', title: 'The White Tiger', author: 'Aravind Adiga', category: 'Fiction', price: 299, isbn: '9781416562603' },
    { id: 'BK003', title: 'A Suitable Boy', author: 'Vikram Seth', category: 'Fiction', price: 599, isbn: '9780060972103' },
    { id: 'BK004', title: 'Midnight\'s Children', author: 'Salman Rushdie', category: 'Fiction', price: 449, isbn: '9780224063784' },
    { id: 'BK005', title: 'The Namesake', author: 'Jhumpa Lahiri', category: 'Fiction', price: 379, isbn: '9780395927212' },
    { id: 'BK006', title: 'Train to Pakistan', author: 'Khushwant Singh', category: 'Fiction', price: 249, isbn: '9780143065883' },
    { id: 'BK007', title: 'A Fine Balance', author: 'Rohinton Mistry', category: 'Fiction', price: 449, isbn: '9780571203025' },
    { id: 'BK008', title: 'The Inheritance of Loss', author: 'Kiran Desai', category: 'Fiction', price: 329, isbn: '9780802142818' },
    { id: 'BK009', title: 'Five Point Someone', author: 'Chetan Bhagat', category: 'Fiction', price: 149, isbn: '9788129104597' },
    { id: 'BK010', title: 'The Shiva Trilogy', author: 'Amish Tripathi', category: 'Fiction', price: 699, isbn: '9789380658742' }
];

// Top 10 Best Selling Books - India (with real book data)
const bestSellers = [
    { id: 'BS001', title: 'It Ends with Us', author: 'Colleen Hoover', category: 'Romance', price: 299, isbn: '9781501110368' },
    { id: 'BS002', title: 'The Silent Patient', author: 'Alex Michaelides', category: 'Mystery', price: 399, isbn: '9781250301697' },
    { id: 'BS003', title: 'Ikigai: The Japanese Secret to a Long and Happy Life', author: 'Héctor García & Francesc Miralles', category: 'Self-Help', price: 349, isbn: '9781786330895' },
    { id: 'BS004', title: 'Heart Lamp: Selected Stories', author: 'Banu Mushtaq', category: 'Fiction', price: 249, isbn: '9789389157000' },
    { id: 'BS005', title: 'The Forest of Enchantments', author: 'Chitra Banerjee Divakaruni', category: 'Fiction', price: 379, isbn: '9789353025924' },
    { id: 'BS006', title: 'Verity', author: 'Colleen Hoover', category: 'Mystery', price: 329, isbn: '9781538724736' },
    { id: 'BS007', title: 'The Psychology of Money', author: 'Morgan Housel', category: 'Non-Fiction', price: 299, isbn: '9789390166268' },
    { id: 'BS008', title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', price: 399, isbn: '9781847941831' },
    { id: 'BS009', title: 'Do It Today', author: 'Darius Foroux', category: 'Self-Help', price: 199, isbn: '9789082744102' },
    { id: 'BS010', title: 'The Alchemist', author: 'Paulo Coelho', category: 'Fiction', price: 249, isbn: '9780062315007' }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize books with initial book management list if empty
    // This ensures the 10 specified books are always present in the book management system
    if (books.length === 0) {
        books = initialBooks.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            category: book.category,
            price: book.price,
            description: `A classic ${book.category.toLowerCase()} book by renowned Indian author ${book.author}`,
            isbn: book.isbn
        }));
        localStorage.setItem('books', JSON.stringify(books));
    }
    
    initializeApp();
    loadBestSellers();
});

function initializeApp() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showBookManagement();
    }

    // Registration form handler
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Login form handler
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Book form handler
    document.getElementById('book-form').addEventListener('submit', handleBookSubmit);
    
    // Payment form handler
    document.getElementById('payment-form').addEventListener('submit', handlePayment);
    
    // Card number formatting
    document.getElementById('card-number').addEventListener('input', formatCardNumber);
    document.getElementById('card-expiry').addEventListener('input', formatExpiry);
    document.getElementById('card-cvv').addEventListener('input', formatCVV);
    
    // Search on Enter key
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchBooks();
        }
    });
}

// Tab switching
function showTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    
    if (tab === 'register') {
        document.querySelector('.tab-btn').classList.add('active');
        document.getElementById('register-tab').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('login-tab').classList.add('active');
    }
    
    clearMessages();
    clearFormErrors('register');
    clearFormErrors('login');
}

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Password validation
function validatePassword(password) {
    // At least 8 characters, one uppercase, one lowercase, one number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
}

// Clear form errors
function clearFormErrors(formType) {
    const prefix = formType === 'register' ? 'reg-' : 'login-';
    const fields = formType === 'register' 
        ? ['name', 'email', 'password', 'confirm-password']
        : ['email', 'password'];
    
    fields.forEach(field => {
        const errorEl = document.getElementById(`${prefix}${field}-error`);
        if (errorEl) errorEl.textContent = '';
    });
}

// Registration handler
function handleRegister(e) {
    e.preventDefault();
    clearFormErrors('register');
    
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    
    let isValid = true;
    
    // Validate name
    if (!name) {
        showError('reg-name-error', 'Name is required');
        isValid = false;
    }
    
    // Validate email
    if (!email) {
        showError('reg-email-error', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('reg-email-error', 'Please enter a valid email address');
        isValid = false;
    } else if (users.find(u => u.email === email)) {
        showError('reg-email-error', 'Email already registered');
        isValid = false;
    }
    
    // Validate password
    if (!password) {
        showError('reg-password-error', 'Password is required');
        isValid = false;
    } else if (!validatePassword(password)) {
        showError('reg-password-error', 'Password must be at least 8 characters with uppercase, lowercase, and number');
        isValid = false;
    }
    
    // Validate confirm password
    if (!confirmPassword) {
        showError('reg-confirm-password-error', 'Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('reg-confirm-password-error', 'Passwords do not match');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Register user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password // In production, hash this password
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showMessage('Registration successful! Please login.', 'success');
    document.getElementById('register-form').reset();
    setTimeout(() => {
        showTab('login');
        document.getElementById('login-email').value = email;
    }, 1500);
}

// Login handler
function handleLogin(e) {
    e.preventDefault();
    clearFormErrors('login');
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    let isValid = true;
    
    if (!email) {
        showError('login-email-error', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('login-email-error', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!password) {
        showError('login-password-error', 'Password is required');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Check credentials
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        showError('login-password-error', 'Invalid email or password');
        return;
    }
    
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showBookManagement();
}

// Show book management page
function showBookManagement() {
    document.querySelector('.container').classList.add('hidden');
    document.getElementById('book-management-page').classList.remove('hidden');
    document.getElementById('user-name').textContent = `Welcome, ${currentUser.name}`;
    loadBooks();
    updateCartCount();
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.querySelector('.container').classList.remove('hidden');
    document.getElementById('book-management-page').classList.add('hidden');
    document.getElementById('login-form').reset();
    clearMessages();
}

// Section navigation
function showSection(section) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    
    event.target.classList.add('active');
    
    if (section === 'books') {
        document.getElementById('books-section').classList.add('active');
    } else if (section === 'bestsellers') {
        document.getElementById('bestsellers-section').classList.add('active');
    } else if (section === 'cart') {
        document.getElementById('cart-section').classList.add('active');
        loadCart();
    }
}

// Book Management Functions
function loadBooks() {
    const tbody = document.getElementById('books-table-body');
    tbody.innerHTML = '';
    
    if (books.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No books available. Add your first book!</td></tr>';
        return;
    }
    
    books.forEach(book => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.onclick = (e) => {
            // Don't open preview if clicking on action buttons
            if (!e.target.closest('.action-buttons')) {
                showBookPreview(book);
            }
        };
        row.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.category}</td>
            <td>₹${book.price.toFixed(2)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-edit" onclick="event.stopPropagation(); editBook('${book.id}')">Edit</button>
                    <button class="action-btn btn-cart" onclick="event.stopPropagation(); addToCart('${book.id}')">Add to Cart</button>
                    <button class="action-btn btn-buy" onclick="event.stopPropagation(); buyNow('${book.id}')">Buy Now</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openAddBookModal() {
    editingBookId = null;
    document.getElementById('modal-title').textContent = 'Add New Book';
    document.getElementById('book-form').reset();
    document.getElementById('book-modal').classList.remove('hidden');
    clearBookFormErrors();
}

function closeBookModal() {
    document.getElementById('book-modal').classList.add('hidden');
    editingBookId = null;
    document.getElementById('book-form').reset();
    clearBookFormErrors();
}

function clearBookFormErrors() {
    ['book-id', 'book-title', 'book-author', 'book-category', 'book-price'].forEach(id => {
        const errorEl = document.getElementById(`${id}-error`);
        if (errorEl) errorEl.textContent = '';
    });
}

function editBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
    editingBookId = bookId;
    document.getElementById('modal-title').textContent = 'Edit Book';
    document.getElementById('book-id').value = book.id;
    document.getElementById('book-id').disabled = true;
    document.getElementById('book-title').value = book.title;
    document.getElementById('book-author').value = book.author;
    document.getElementById('book-category').value = book.category;
    document.getElementById('book-price').value = book.price;
    document.getElementById('book-description').value = book.description || '';
    document.getElementById('book-modal').classList.remove('hidden');
    clearBookFormErrors();
}

function handleBookSubmit(e) {
    e.preventDefault();
    clearBookFormErrors();
    
    const id = document.getElementById('book-id').value.trim();
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const category = document.getElementById('book-category').value;
    const price = parseFloat(document.getElementById('book-price').value);
    const description = document.getElementById('book-description').value.trim();
    
    let isValid = true;
    
    if (!id) {
        showError('book-id-error', 'Book ID is required');
        isValid = false;
    } else if (!editingBookId && books.find(b => b.id === id)) {
        showError('book-id-error', 'Book ID already exists');
        isValid = false;
    }
    
    if (!title) {
        showError('book-title-error', 'Title is required');
        isValid = false;
    }
    
    if (!author) {
        showError('book-author-error', 'Author is required');
        isValid = false;
    }
    
    if (!category) {
        showError('book-category-error', 'Category is required');
        isValid = false;
    }
    
    if (!price || price < 0) {
        showError('book-price-error', 'Valid price is required');
        isValid = false;
    }
    
    if (!isValid) return;
    
    if (editingBookId) {
        // Update existing book
        const index = books.findIndex(b => b.id === editingBookId);
        if (index !== -1) {
            books[index] = { ...books[index], title, author, category, price, description };
            showMessage('Book updated successfully!', 'success');
        }
    } else {
        // Add new book
        books.push({ id, title, author, category, price, description });
        showMessage('Book added successfully!', 'success');
    }
    
    localStorage.setItem('books', JSON.stringify(books));
    loadBooks();
    closeBookModal();
}

function deleteBook(bookId) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    books = books.filter(b => b.id !== bookId);
    localStorage.setItem('books', JSON.stringify(books));
    loadBooks();
    showMessage('Book deleted successfully!', 'success');
}

// Search functionality
function searchBooks() {
    const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
    
    if (!searchTerm) {
        loadBooks();
        return;
    }
    
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.category.toLowerCase().includes(searchTerm)
    );
    
    const tbody = document.getElementById('books-table-body');
    tbody.innerHTML = '';
    
    if (filteredBooks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No books found matching your search.</td></tr>';
        return;
    }
    
    filteredBooks.forEach(book => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.onclick = (e) => {
            // Don't open preview if clicking on action buttons
            if (!e.target.closest('.action-buttons')) {
                showBookPreview(book);
            }
        };
        row.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.category}</td>
            <td>₹${book.price.toFixed(2)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-edit" onclick="event.stopPropagation(); editBook('${book.id}')">Edit</button>
                    <button class="action-btn btn-cart" onclick="event.stopPropagation(); addToCart('${book.id}')">Add to Cart</button>
                    <button class="action-btn btn-buy" onclick="event.stopPropagation(); buyNow('${book.id}')">Buy Now</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function clearSearch() {
    document.getElementById('search-input').value = '';
    loadBooks();
}

// Cart functionality
function addToCart(bookId) {
    const book = books.find(b => b.id === bookId) || bestSellers.find(b => b.id === bookId);
    if (!book) return;
    
    const existingItem = cart.find(item => item.id === bookId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...book, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showMessage(`${book.title} added to cart!`, 'success');
}

function buyNow(bookId) {
    addToCart(bookId);
    showSection('cart');
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.nav-btn')[2].classList.add('active');
    loadCart();
}

function showCart() {
    showSection('cart');
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.nav-btn')[2].classList.add('active');
}

function loadCart() {
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: #6b5438;">Your cart is empty.</p>';
        document.getElementById('checkout-btn').disabled = true;
        document.getElementById('cart-total').textContent = '0.00';
        return;
    }
    
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h3>${item.title}</h3>
                <p>by ${item.author} | ${item.category}</p>
                <p>Quantity: 
                    <button class="action-btn btn-edit" onclick="updateCartQuantity(${index}, -1)">-</button>
                    <span style="margin: 0 10px;">${item.quantity}</span>
                    <button class="action-btn btn-edit" onclick="updateCartQuantity(${index}, 1)">+</button>
                </p>
            </div>
            <div class="cart-item-price">₹${itemTotal.toFixed(2)}</div>
            <button class="action-btn btn-delete" onclick="removeFromCart(${index})">Remove</button>
        `;
        cartContainer.appendChild(cartItem);
    });
    
    document.getElementById('cart-total').textContent = total.toFixed(2);
    document.getElementById('checkout-btn').disabled = false;
}

function updateCartQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    loadCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    loadCart();
    showMessage('Item removed from cart', 'success');
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// Payment functionality
function proceedToPayment() {
    if (cart.length === 0) return;
    
    const paymentItems = document.getElementById('payment-items');
    paymentItems.innerHTML = '';
    
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const paymentItem = document.createElement('div');
        paymentItem.className = 'payment-item';
        paymentItem.innerHTML = `
            <span>${item.title} x${item.quantity}</span>
            <span>₹${itemTotal.toFixed(2)}</span>
        `;
        paymentItems.appendChild(paymentItem);
    });
    
    document.getElementById('payment-total').textContent = total.toFixed(2);
    document.getElementById('payment-modal').classList.remove('hidden');
    document.getElementById('payment-form').reset();
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.add('hidden');
}

function handlePayment(e) {
    e.preventDefault();
    
    const cardName = document.getElementById('card-name').value.trim();
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCVV = document.getElementById('card-cvv').value;
    
    if (!cardName || !cardNumber || !cardExpiry || !cardCVV) {
        showMessage('Please fill in all payment details', 'error');
        return;
    }
    
    if (cardNumber.length < 16) {
        showMessage('Please enter a valid card number', 'error');
        return;
    }
    
    // Simulate payment processing
    showMessage('Payment processing...', 'success');
    
    setTimeout(() => {
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        loadCart();
        closePaymentModal();
        showMessage('Payment successful! Thank you for your purchase.', 'success');
    }, 2000);
}

function formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
}

function formatExpiry(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
}

function formatCVV(e) {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
}

// Best Sellers
function loadBestSellers() {
    const grid = document.getElementById('bestsellers-grid');
    grid.innerHTML = '';
    
    bestSellers.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.onclick = () => showBookPreview(book);
        
        // Try to get book cover from Open Library API
        const coverUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;
        
        card.innerHTML = `
            <img src="${coverUrl}" alt="${book.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'250\'%3E%3Crect width=\'200\' height=\'250\' fill=\'%23d4c5a9\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%236b5438\' font-family=\'Georgia\' font-size=\'14\'%3E${encodeURIComponent(book.title)}%3C/text%3E%3C/svg%3E'">
            <h3>${book.title}</h3>
            <p>by ${book.author}</p>
            <p class="price">₹${book.price.toFixed(2)}</p>
            <button class="vintage-btn" onclick="event.stopPropagation(); addToCart('${book.id}')">Add to Cart</button>
            <button class="vintage-btn-secondary" onclick="event.stopPropagation(); buyNow('${book.id}')">Buy Now</button>
        `;
        grid.appendChild(card);
    });
}

function showBookPreview(book) {
    const modal = document.getElementById('book-preview-modal');
    const content = document.getElementById('book-preview-content');
    
    // Get book cover image if ISBN exists
    const coverUrl = book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg` : '';
    
    const previewHTML = `
        ${coverUrl ? `<img src="${coverUrl}" alt="${book.title}" onerror="this.style.display='none'" style="max-width: 200px; margin-bottom: 20px;">` : ''}
        <div style="background: #fff; border: 2px solid #8b6f47; border-radius: 8px; padding: 25px; margin: 20px 0;">
            <div style="margin-bottom: 15px;">
                <p style="color: #6b5438; font-size: 0.9em; margin-bottom: 5px;"><strong>Book ID:</strong></p>
                <p style="color: #3d2817; font-size: 1.1em; font-weight: bold;">${book.id}</p>
            </div>
            <div style="margin-bottom: 15px;">
                <p style="color: #6b5438; font-size: 0.9em; margin-bottom: 5px;"><strong>Book Name:</strong></p>
                <h2 style="color: #5a4530; font-size: 1.8em; margin: 0;">${book.title}</h2>
            </div>
            <div style="margin-bottom: 15px;">
                <p style="color: #6b5438; font-size: 0.9em; margin-bottom: 5px;"><strong>Author Name:</strong></p>
                <p style="color: #3d2817; font-size: 1.2em; font-weight: bold;">${book.author}</p>
            </div>
            <div style="margin-bottom: 20px;">
                <p style="color: #6b5438; font-size: 0.9em; margin-bottom: 5px;"><strong>Amount:</strong></p>
                <p style="color: #8b6f47; font-size: 1.5em; font-weight: bold;">₹${book.price.toFixed(2)}</p>
            </div>
        </div>
        <div style="margin-top: 25px; display: flex; gap: 15px; justify-content: center;">
            <button class="vintage-btn" onclick="addToCart('${book.id}'); closeBookPreview(); showMessage('${book.title} added to cart!', 'success');" style="padding: 15px 30px; font-size: 1.1em;">
                Add to Cart
            </button>
        </div>
    `;
    
    content.innerHTML = previewHTML;
    modal.classList.remove('hidden');
}

function closeBookPreview() {
    document.getElementById('book-preview-modal').classList.add('hidden');
}

// Message display
function showMessage(message, type) {
    const container = document.getElementById('message-container');
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    container.innerHTML = '';
    container.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}

function clearMessages() {
    document.getElementById('message-container').innerHTML = '';
}

function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.textContent = message;
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const bookModal = document.getElementById('book-modal');
    const previewModal = document.getElementById('book-preview-modal');
    const paymentModal = document.getElementById('payment-modal');
    
    if (event.target === bookModal) {
        closeBookModal();
    }
    if (event.target === previewModal) {
        closeBookPreview();
    }
    if (event.target === paymentModal) {
        closePaymentModal();
    }
}

