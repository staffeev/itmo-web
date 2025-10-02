let showcaseHTML = document.querySelector('.showcase');
let cartDiv = document.querySelector('.cart');
let cartHTML = document.querySelector('.cart-products');
let totalQuantitySpan = document.querySelector('#total-count');
let totalSumSpan = document.getElementById('total-sum-span');
let checkOutBtn = document.querySelector('.check-out');

let cartIcon = document.querySelector('.icon-cart');


let modal = document.querySelector('.order-modal');
let openFormBtn = document.querySelector('.open-form');
let closeModalBtn = document.querySelector('.close-modal');
let orderForm = document.querySelector('.order-form');
let formSubmitBtn = document.querySelector('.submit-btn');
let phoneError = document.querySelector('.phone-error');

let products = [];
let cart_products = [];

function updateProductListHTML() {
    showcaseHTML.innerHTML = '';
    if(!products.length){
        return;
    }
    products.forEach(product => {
        let newProductHTML = document.createElement('div');
        newProductHTML.classList.add('shop-product');
        newProductHTML.dataset.id = product.id;
        newProductHTML.innerHTML = `
        <img src="${product.image}" alt="loading...">
        <h3>${product.name}</h3>
        <div class="product-price">${product.price}</div>
        <button class="add-to-cart">+</button>`;
        showcaseHTML.appendChild(newProductHTML);
    })
}


function updateCartHTML(){
    cartHTML.innerHTML = '';
    let totalQuantity = 0;
    let totalSum = 0.0;
    cart_products.forEach(product => {
        let infoProduct = products.find(value => value.id == product.product_id)

        cartProductHTML = document.createElement('div');
        cartProductHTML.classList.add('cart-product');
        cartProductHTML.dataset.id = product.product_id;
        cartProductHTML.innerHTML = `
        <img src="${infoProduct.image}" alt="loading...">
        <div class="cart-product-name">
            ${infoProduct.name}
        </div>
        <div class="cart-product-total-price">
            ${infoProduct.price * product.quantity}
        </div>
        <div class="cart-product-quantity">
            <span class="less"><</span>
            <span>${product.quantity}</span>
            <span class="more">></span>
        </div>
        <div class="delete-from-cart">
            <span class="delete-from-cart-btn">X</span>
        </div>
        `;
        cartHTML.appendChild(cartProductHTML);

        totalQuantity += product.quantity;
        totalSum += infoProduct.price * product.quantity;
    })
    // апдейт инфы о количестве и сумме
    totalQuantitySpan.innerText = (totalQuantity >= 99) ? '99+' : totalQuantity;
    totalSumSpan.innerText = totalSum;
    // сохранить в localStorage коризну
    localStorage.setItem('cart', JSON.stringify(cart_products));
    // активность кнопки оформления заказа
    if(cart_products.length){
        checkOutBtn.disabled = false;
    }else{
        checkOutBtn.disabled = true;
    }
}

function addToCart(product_id){
    let index_in_cart = cart_products.findIndex((value) => value.product_id == product_id);

    if(!cart_products.length){ // корзина пуста
        cart_products = [
            {
                product_id: product_id,
                quantity: 1
            }
        ]
    }else if(index_in_cart == -1){ // в корзине нет этого товара
        cart_products.push({
                product_id: product_id,
                quantity: 1
            });
    }else{ // продукт уже есть в корзине
        cart_products[index_in_cart].quantity++;
    }   
    console.log(cart_products);
    updateCartHTML();
    
}


function changeQuantity(product_id, operation){
    indexProduct = cart_products.findIndex(value => value.product_id == product_id);
    if(indexProduct == -1){
        return;
    }
    if(cart_products[indexProduct].quantity + operation == 0){
        cart_products.splice(indexProduct, 1);
    }else{
        cart_products[indexProduct].quantity += operation;
    }
    updateCartHTML();
}


function deleteFromCart(product_id){
    indexProduct = cart_products.findIndex(value => value.product_id == product_id);
    cart_products.splice(indexProduct, 1);
    updateCartHTML(); 
}


showcaseHTML.addEventListener('click', event => {
    let element = event.target;
    if(element.classList.contains('add-to-cart')){
        let product_id = element.parentElement.dataset.id;
        addToCart(product_id);
    }
})


cartHTML.addEventListener('click', event => {
    let element = event.target;
    if(element.classList.contains('less') || element.classList.contains('more')){
        console.log('click');
        
        let product_id = element.parentElement.parentElement.dataset.id;
        let operation = (element.classList.contains('less')) ? -1 : 1;
        changeQuantity(product_id, operation);
    }else if(element.classList.contains('delete-from-cart-btn')){
        let product_id = element.parentElement.parentElement.dataset.id;
        deleteFromCart(product_id);
    }
})


// открытие и закрытие формы оформления заказа
checkOutBtn.addEventListener('click', event => {
    console.log('clickckckck');
    modal.style.display = 'block';
})

// сигналы от элементов форма оформления заказа
closeModalBtn.onclick = () => modal.style.display = 'none';
window.onclick = (event) => {
    if (event.target === modal) modal.style.display = 'none';
};
orderForm.addEventListener('submit', event => {
    event.preventDefault();

    const phoneRegex = /^\+?\d{10,}$/;
    let phone = orderForm.phone.value.trim();
    if (!phoneRegex.test(phone)) {
        phoneError.style.display = 'block';
        return;
    } else {
        phoneError.style.display = 'none';
    }

    alert("заказ успешно оформлен")
    modal.style.display = 'none';
    orderForm.reset();
    cart_products.splice(0);
    updateCartHTML();

})

// открытие корзины
cartIcon.addEventListener("click", () => {
    cartDiv.classList.toggle("open");
});
// закрытие корзины
document.addEventListener("click", (event) => {
  let path = event.composedPath();
  if (!path.includes(cartDiv) && !path.includes(cartIcon)) {
    cartDiv.classList.remove("open");
  }
});


// загрузка товаров из json
function fetchProducts() {
    fetch("./products.json")
    .then(response => response.json())
    .then(data => {
        products = data;
        updateProductListHTML();
        // обновить корзину при повторном заходе на сайт
        if(localStorage.getItem('cart')){
            cart_products = JSON.parse(localStorage.getItem('cart'))
            updateCartHTML();
        }
    })
}

fetchProducts();