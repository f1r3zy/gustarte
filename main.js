const sliderImages = [
  'images/slider1.png',
  'images/slider2.png',
  'images/slider3.png'
];
let currentIndex = 0;
let autoPlayInterval;
const autoPlayDelay = 3222;

function initSlider() {
  const sliderImg = document.getElementById('slider-image');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  
  if (!sliderImg || !prevBtn || !nextBtn) return;

  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'slider-dots';
  sliderImages.forEach((_, index) => {
    const dot = document.createElement('span');
    dot.className = 'slider-dot';
    dot.dataset.index = index;
    dotsContainer.appendChild(dot);
  });
  sliderImg.parentNode.appendChild(dotsContainer);
  function showImage(index) {
    currentIndex = index;
    sliderImg.src = sliderImages[index];
    updateDots();
  }

  function updateDots() {
    const dots = document.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + sliderImages.length) % sliderImages.length;
    showImage(currentIndex);
    resetAutoPlay();
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % sliderImages.length;
    showImage(currentIndex);
    resetAutoPlay();
  }

  function goToSlide(index) {
    showImage(index);
    resetAutoPlay();
  }

  function startAutoPlay() {
    if (autoPlayInterval) clearInterval(autoPlayInterval);
    autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
  }

  function pauseAutoPlay() {
    clearInterval(autoPlayInterval);
  }

  function resetAutoPlay() {
    pauseAutoPlay();
    startAutoPlay();
  }

  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);
  
  document.querySelectorAll('.slider-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.index));
    });
  });

  sliderImg.parentNode.addEventListener('mouseenter', pauseAutoPlay);
  sliderImg.parentNode.addEventListener('mouseleave', startAutoPlay);

  showImage(currentIndex);
  startAutoPlay();
}

class CartManager {
  constructor() {
    this.cart = this.loadCart();
    this.initElements();
    this.initEventListeners();
    this.renderCart();
    this.updateCartCount();
  }

  initElements() {
    this.elements = {
      cartGrid: document.querySelector('.cart-grid'),
      emptyCartMsg: document.querySelector('.empty-cart-message'),
      itemCountEl: document.getElementById('item-count'),
      subtotalEl: document.getElementById('subtotal'),
      totalPriceEl: document.getElementById('total-price'),
      cartCountEl: document.getElementById('cart-count'),
      checkoutBtn: document.getElementById('checkout-btn')
    };
  }

  initEventListeners() {
    if (this.elements.checkoutBtn) {
      this.elements.checkoutBtn.addEventListener('click', () => this.checkout());
    }
  }

  loadCart() {
    try {
      const cartData = localStorage.getItem('cart');
      if (!cartData) return [];
      
      const parsedCart = JSON.parse(cartData);
      if (!Array.isArray(parsedCart)) return [];
      
      return parsedCart.map(item => ({
        name: String(item.name || 'Produs fără nume'),
        price: Math.max(0, Number(item.price) || 0),
        image: String(item.image || ''),
        ingredients: String(item.ingredients || ''),
        quantity: Math.max(1, Math.min(100, Number(item.quantity) || 1))
      }));
    } catch (error) {
      console.error('Eroare la încărcarea coșului:', error);
      return [];
    }
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartCount();
  }

  updateCartCount() {
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    
    cartCountElements.forEach(el => {
      el.textContent = totalItems;
      el.classList.add('animate-bounce');
      setTimeout(() => el.classList.remove('animate-bounce'), 500);
    });
  }

  renderCart() {
  if (!this.elements.cartGrid) return;

  this.elements.cartGrid.innerHTML = '';

  if (this.cart.length === 0) {
    if (this.elements.emptyCartMsg) {
      this.elements.emptyCartMsg.style.display = 'flex';
    }
    this.updateSummary(0);
    return;
  }

  if (this.elements.emptyCartMsg) {
    this.elements.emptyCartMsg.style.display = 'none';
  }

  this.cart.forEach((item, index) => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item-card';
    cartItem.innerHTML = `
      <div class="cart-item-img">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
      </div>
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p class="ingrediente">${item.ingredients || 'Ingrediente nedisponibile'}</p>
        <div class="price">${item.price.toFixed(2)} MDL</div>
      </div>
      <div class="cart-item-controls">
        <div class="quantity-controls">
          <button class="qty-btn minus" data-index="${index}">
            <i class="fas fa-minus"></i>
          </button>
          <span class="quantity">${item.quantity}</span>
          <button class="qty-btn plus" data-index="${index}">
            <i class="fas fa-plus"></i>
          </button>
        </div>
        <button class="remove-btn" data-index="${index}">
          <i class="fas fa-trash"></i> Elimină
        </button>
      </div>
    `;
    this.elements.cartGrid.appendChild(cartItem);
  });

  this.addCartItemEvents();
  this.updateSummary();
}

  addCartItemEvents() {
    document.querySelectorAll('.qty-btn.minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.closest('button').dataset.index;
        this.updateQuantity(index, -1);
      });
    });

    document.querySelectorAll('.qty-btn.plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.closest('button').dataset.index;
        this.updateQuantity(index, 1);
      });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.closest('button').dataset.index;
        this.removeItem(index);
      });
    });
  }

  updateSummary() {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 25;
    const total = subtotal + deliveryFee;

    if (this.elements.itemCountEl) {
      this.elements.itemCountEl.textContent = 
        `${this.cart.reduce((sum, item) => sum + item.quantity, 0)} produse`;
    }
    if (this.elements.subtotalEl) {
      this.elements.subtotalEl.textContent = `${subtotal.toFixed(2)} MDL`;
    }
    if (this.elements.totalPriceEl) {
      this.elements.totalPriceEl.textContent = `${total.toFixed(2)} MDL`;
    }
    if (this.elements.checkoutBtn) {
      this.elements.checkoutBtn.disabled = this.cart.length === 0;
    }
  }

  updateQuantity(index, change) {
    if (!this.cart[index]) return;

    const newQuantity = this.cart[index].quantity + change;
    
    if (newQuantity < 1) {
      this.removeItem(index);
    } else {
      this.cart[index].quantity = newQuantity;
      this.saveCart();
      this.renderCart();
    }
  }

  removeItem(index) {
    if (!this.cart[index]) return;
    
    this.cart.splice(index, 1);
    this.saveCart();
    this.renderCart();
  }

  checkout() {
    if (this.cart.length === 0) return;
    
    alert('Comanda a fost plasată cu succes!');
    this.cart = [];
    this.saveCart();
    this.renderCart();
  }

  addProduct(product) {
    const existingItem = this.cart.find(item => item.name === product.name);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        name: product.name,
        price: product.price,
        image: product.image,
        ingredients: product.ingredients,
        quantity: 1
      });
    }
    
    this.saveCart();
    this.renderCart();
  }
}

function addToCart(name, price, image, ingredients) {
  if (!window.cartManager) {
    window.cartManager = new CartManager();
  }
  
  window.cartManager.addProduct({
    name: name,
    price: parseFloat(price),
    image: image,
    ingredients: ingredients || ''
  });

  showAddToCartNotification(name);
}

function showAddToCartNotification(productName) {
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.innerHTML = `
    <span>✓ ${productName} a fost adăugat în coș</span>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('slider-image')) {
    initSlider();
  }
  if (document.querySelector('.cart-container')) {
    window.cartManager = new CartManager();
  }

  const cartCountElements = document.querySelectorAll('.cart-count');
  if (cartCountElements.length > 0) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    cartCountElements.forEach(el => {
      el.textContent = totalItems;
    });
  }
});
const style = document.createElement('style');
style.textContent = `
  /* Stiluri slider */
  .slider-dots {
    display: flex;
    justify-content: center;
    padding: 15px 0;
    gap: 10px;
  }
  
  .slider-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #ccc;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .slider-dot.active {
    background-color: #406C81;
  }
  
  /* Stiluri notificări */
  .cart-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #4CAF50;
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 1000;
  }
  
  .cart-notification.show {
    transform: translateY(0);
    opacity: 1;
  }
  
  /* Animații */
  .animate-bounce {
    animation: bounce 0.5s;
  }
  
  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.3); }
  }
`;
document.head.appendChild(style);