// Dados iniciais
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = [];
let currentClient = null;
let currentCategory = null;
let isAdminLoggedIn = false;

// Elementos DOM
const adminLoginSection = document.getElementById('adminLoginSection');
const adminPanel = document.getElementById('adminPanel');
const clientLoginSection = document.getElementById('clientLoginSection');
const productCatalog = document.getElementById('productCatalog');
const adminAccessBtn = document.getElementById('adminAccess');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminPassword = document.getElementById('adminPassword');
const logoutAdminBtn = document.getElementById('logoutAdmin');
const addCategoryForm = document.getElementById('addCategoryForm');
const categoryName = document.getElementById('categoryName');
const addProductForm = document.getElementById('addProductForm');
const productCategory = document.getElementById('productCategory');
const productName = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const productImage = document.getElementById('productImage');
const productStatus = document.getElementById('productStatus');
const adminProductsList = document.getElementById('adminProductsList');
const clientLoginForm = document.getElementById('clientLoginForm');
const clientName = document.getElementById('clientName');
const clientPhone = document.getElementById('clientPhone');
const categoriesList = document.getElementById('categoriesList');
const productsList = document.getElementById('productsList');
const cartElement = document.getElementById('cart');
const openCartBtn = document.getElementById('openCart');
const closeCartBtn = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartBadge = document.getElementById('cartBadge');
const checkoutBtn = document.getElementById('checkoutBtn');
const logoutClientBtn = document.getElementById('logoutClient');

// Funções auxiliares
function saveData() {
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('products', JSON.stringify(products));
}

function showSection(section) {
    const sections = [adminLoginSection, adminPanel, clientLoginSection, productCatalog];
    sections.forEach(sec => sec.classList.add('hidden'));
    section.classList.remove('hidden');
}

// Admin
function renderAdminProducts() {
    adminProductsList.innerHTML = '';
    
    if (products.length === 0) {
        adminProductsList.innerHTML = '<p>Nenhum produto cadastrado.</p>';
        return;
    }
    
    const groupedProducts = {};
    products.forEach(product => {
        if (!groupedProducts[product.category]) {
            groupedProducts[product.category] = [];
        }
        groupedProducts[product.category].push(product);
    });
    
    for (const category in groupedProducts) {
        const categoryDiv = document.createElement('div');
        categoryDiv.innerHTML = `<h3 style="margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 5px;">${category}</h3>`;
        
        const productsGrid = document.createElement('div');
        productsGrid.className = 'products';
        
        groupedProducts[category].forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image || 'https://via.placeholder.com/250'}" class="product-image">
                <div class="product-info">
                    <div class="product-title">${product.name}</div>
                    <div class="product-price">R$ ${product.price.toFixed(2)}</div>
                    <div class="product-status ${product.status === 'available' ? 'status-available' : 'status-unavailable'}">
                        ${product.status === 'available' ? 'Disponível' : 'Indisponível'}
                    </div>
                    <div class="admin-actions">
                        <button class="btn ${product.status === 'available' ? 'btn-danger' : 'btn-success'}" 
                            onclick="toggleProductStatus('${product.id}')">
                            ${product.status === 'available' ? 'Indisponível' : 'Disponível'}
                        </button>
                        <button class="btn btn-primary" onclick="editProduct('${product.id}')">Editar</button>
                        <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">Excluir</button>
                    </div>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });
        
        categoryDiv.appendChild(productsGrid);
        adminProductsList.appendChild(categoryDiv);
    }
}

window.toggleProductStatus = function(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        product.status = product.status === 'available' ? 'unavailable' : 'available';
        saveData();
        renderAdminProducts();
        renderProducts();
    }
};

window.editProduct = function(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    productCategory.value = product.category;
    productName.value = product.name;
    productPrice.value = product.price;
    productImage.value = product.image || '';
    productStatus.value = product.status || 'available';
    
    document.getElementById('addProductForm').scrollIntoView({ behavior: 'smooth' });
    
    products = products.filter(p => p.id !== id);
    saveData();
};

window.deleteProduct = function(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        products = products.filter(product => product.id !== id);
        saveData();
        renderAdminProducts();
        renderProducts();
    }
};

// Cliente
function renderCategories() {
    categoriesList.innerHTML = '';
    
    const allTab = document.createElement('div');
    allTab.className = `category-tab ${!currentCategory ? 'active' : ''}`;
    allTab.textContent = 'Todos';
    allTab.onclick = () => {
        currentCategory = null;
        renderCategories();
        renderProducts();
    };
    categoriesList.appendChild(allTab);
    
    categories.forEach(category => {
        const tab = document.createElement('div');
        tab.className = `category-tab ${currentCategory === category.name ? 'active' : ''}`;
        tab.textContent = category.name;
        tab.onclick = () => {
            currentCategory = category.name;
            renderCategories();
            renderProducts();
        };
        categoriesList.appendChild(tab);
    });
}

function renderProducts() {
    productsList.innerHTML = '';
    
    let filteredProducts = products;
    if (currentCategory) {
        filteredProducts = products.filter(product => product.category === currentCategory);
    }
    
    if (filteredProducts.length === 0) {
        productsList.innerHTML = '<p>Nenhum produto encontrado nesta categoria.</p>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const cartItem = cart.find(item => item.productId === product.id);
        const quantity = cartItem ? cartItem.quantity : 0;
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        if (product.status === 'unavailable') {
            productCard.style.opacity = '0.7';
        }
        
        productCard.innerHTML = `
            <img src="${product.image || 'https://via.placeholder.com/250'}" class="product-image">
            <div class="product-info">
                <div class="product-title">${product.name}</div>
                <div class="product-price">R$ ${product.price.toFixed(2)}</div>
                <div class="product-status ${product.status === 'available' ? 'status-available' : 'status-unavailable'}">
                    ${product.status === 'available' ? 'Disponível' : 'Indisponível'}
                </div>
                ${product.status === 'available' ? 
                    `<div class="product-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn" onclick="decreaseQuantity('${product.id}')">-</button>
                            <span class="quantity">${quantity}</span>
                            <button class="quantity-btn" onclick="increaseQuantity('${product.id}')">+</button>
                        </div>
                    </div>` : ''
                }
            </div>
        `;
        productsList.appendChild(productCard);
    });
}

function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    
    if (totalItems > 0) {
        cartBadge.classList.remove('hidden');
    } else {
        cartBadge.classList.add('hidden');
    }
    
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Seu carrinho está vazio.</p>';
        cartTotal.textContent = '0.00';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            const itemTotal = product.price * item.quantity;
            total += itemTotal;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-name">${product.name} x${item.quantity}</div>
                <div class="cart-item-price">R$ ${itemTotal.toFixed(2)}</div>
                <button onclick="removeFromCart('${product.id}')">🗑️</button>
            `;
            cartItems.appendChild(cartItemElement);
        }
    });
    
    cartTotal.textContent = total.toFixed(2);
}

window.increaseQuantity = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.status === 'unavailable') return;
    
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ productId, quantity: 1 });
    }
    
    updateCart();
    renderProducts();
};

window.decreaseQuantity = function(productId) {
    const existingItemIndex = cart.findIndex(item => item.productId === productId);
    
    if (existingItemIndex !== -1) {
        if (cart[existingItemIndex].quantity > 1) {
            cart[existingItemIndex].quantity--;
        } else {
            cart.splice(existingItemIndex, 1);
        }
        
        updateCart();
        renderProducts();
    }
};

window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.productId !== productId);
    updateCart();
    renderProducts();
};

// Event Listeners
adminAccessBtn.addEventListener('click', () => {
    showSection(adminLoginSection);
});

adminLoginForm.addEventListener('submit', e => {
    e.preventDefault();
    
    if (adminPassword.value === '123456') {
        isAdminLoggedIn = true;
        adminAccessBtn.classList.add('hidden');
        showSection(adminPanel);
        renderAdminProducts();
        
        productCategory.innerHTML = '<option value="">Selecione uma categoria</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            productCategory.appendChild(option);
        });
    } else {
        alert('Senha incorreta!');
    }
});

logoutAdminBtn.addEventListener('click', () => {
    isAdminLoggedIn = false;
    showSection(clientLoginSection);
    adminAccessBtn.classList.remove('hidden');
});

addCategoryForm.addEventListener('submit', e => {
    e.preventDefault();
    
    const newCategory = {
        name: categoryName.value
    };
    
    categories.push(newCategory);
    saveData();
    
    const option = document.createElement('option');
    option.value = newCategory.name;
    option.textContent = newCategory.name;
    productCategory.appendChild(option);
    
    categoryName.value = '';
    alert('Categoria adicionada com sucesso!');
});

addProductForm.addEventListener('submit', e => {
    e.preventDefault();
    
    const newProduct = {
        id: Date.now().toString(),
        category: productCategory.value,
        name: productName.value,
        price: parseFloat(productPrice.value),
        image: productImage.value,
        status: productStatus.value
    };
    
    products.push(newProduct);
    saveData();
    
    productName.value = '';
    productPrice.value = '';
    productImage.value = '';
    productStatus.value = 'available';
    
    renderAdminProducts();
    alert('Produto adicionado com sucesso!');
});

clientLoginForm.addEventListener('submit', e => {
    e.preventDefault();
    
    currentClient = {
        name: clientName.value,
        phone: clientPhone.value
    };
    
    showSection(productCatalog);
    renderCategories();
    renderProducts();
    adminAccessBtn.classList.add('hidden');
});

logoutClientBtn.addEventListener('click', () => {
    currentClient = null;
    cart = [];
    updateCart();
    showSection(clientLoginSection);
    adminAccessBtn.classList.remove('hidden');
});

openCartBtn.addEventListener('click', () => {
    cartElement.classList.add('active');
});

closeCartBtn.addEventListener('click', () => {
    cartElement.classList.remove('active');
});

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Adicione produtos ao carrinho antes de finalizar!');
        return;
    }
    
    if (!currentClient) {
        alert('Erro: informações do cliente não encontradas.');
        return;
    }
    
    let message = `Olá, sou ${currentClient.name} (${currentClient.phone}). Gostaria de fazer o seguinte pedido:\n\n`;
    
    let total = 0;
    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            const itemTotal = product.price * item.quantity;
            total += itemTotal;
            message += `- ${product.name} x${item.quantity} - R$ ${itemTotal.toFixed(2)}\n`;
        }
    });
    
    message += `\n*Total: R$ ${total.toFixed(2)}*`;
    
    const whatsappNumber = '5534998942873';
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    
    cart = [];
    updateCart();
    renderProducts();
});

// Inicialização
showSection(clientLoginSection);
adminAccessBtn.classList.remove('hidden');