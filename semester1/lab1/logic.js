let showcaseHTML = document.querySelector('.showcase');
let cartHTML = document.querySelector('.cart-products')
let totalQuantitySpan = document.querySelector('#total-count');


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
    if(!cart_products.length){
        return;
    }
    let totalQuantity = 0;
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
        `;
        cartHTML.appendChild(cartProductHTML);

        totalQuantity += product.quantity;
    })
    totalQuantitySpan.innerText = (totalQuantity >= 99) ? '99+' : totalQuantity;
    // сохранить в localStorage коризну
    localStorage.setItem('cart', JSON.stringify(cart_products));
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
    }
})

// загрузка товаров из json
function fetchProducts() {
    fetch("./products.json")
    .then(response => response.json())
    .then(data => {
        products = data;
        updateProductListHTML();
        // обновить корзину при повторном заходе на сайт
        // if(localStorage.getItem('cart')){
            // cart_products = JSON.parse(localStorage.getItem('cart'))
            // updateCartHTML();
        // }
    })
}

fetchProducts();