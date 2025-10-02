let showcaseHTML = document.querySelector('.showcase');
let cartHTML = document.querySelector('.cart-products')

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
    cart_products.forEach(product => {
        let indexProduct = products.findIndex((value) => value.id == product.product_id);
        let infoProduct = products[indexProduct];
        console.log(infoProduct);
        
        cartProductHTML = document.createElement('div');
        cartProductHTML.classList.add('cart-product');
        cartProductHTML.innerHTML = `
        <img src="" alt="loading...">
        <div class="cart-product-name">
            ${infoProduct.name}
        </div>
        <div class="cart-product-total-price">
            ${infoProduct.price}
        </div>
        <div class="cart-product-quantity">
            <span class="less"><</span>
            <span>${product.quantity}</span>
            <span class="more">></span>
        </div>
        `;
        cartHTML.appendChild(cartProductHTML);
    })

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

showcaseHTML.addEventListener('click', (event) => {
    let element = event.target;
    if(element.classList.contains('add-to-cart')){
        let product_id = element.parentElement.dataset.id;
        addToCart(product_id);
    }
})


function fetchProducts() {
    fetch("./products.json")
    .then(response => response.json())
    .then(data => {
        products = data;
        updateProductListHTML();
    })
}

fetchProducts();