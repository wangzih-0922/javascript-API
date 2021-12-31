//綁定DOM
const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect")
const cartList = document.querySelector(".shoppingCart-tbody");

//資料初始化
function init(){
    getProductList();
    getCartList();
};
init();

//取得產品資料(連接API)
let productData;
function getProductList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`).
    then(function (response) {
      productData = response.data.products;
      renderProductList();
    })
    .catch(function(error){
      console.log(error.response.data)
    })
};

//組產品列表
function productListString(item){
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="">
    <a href="#" class="addCardBtn" data-id="${item.id}" data-product="${item.title}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${toThounsand(item.origin_price)}</del>
    <p class="nowPrice">NT$${toThounsand(item.price)}</p>
    </li>`
};

//產品顯示渲染
function renderProductList(){
    let str = "";
    productData.forEach(function(item){
        str += productListString(item);
    });
    productList.innerHTML = str;
};

//產品篩選邏輯
productSelect.addEventListener("change",function(e){
    let value = e.target.value;
    if(value === "全部"){
     getProductList();
     return;
   }
   let str = "";
   productData.forEach(function(item){
       if(value === item.category){
        str += productListString(item);
       }
   });
   productList.innerHTML = str;
});


//取得購物車資料(連接API)
let cartData;
function getCartList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).
      then(function (response) {
        cartData = response.data.carts
        renderCartList();
        const totalPrice = document.querySelector(".totalPrice");
        totalPrice.textContent = toThounsand(response.data.finalTotal);
      })
  }

//購物車顯示渲染
function renderCartList(){
    let str = "";
    cartData.forEach(function(item){
        str += `<tr><td>
            <div class="cardItem-title">
                <img src="${item.product.images}" alt="">
                <p>${item.product.title}</p>
            </div>
        </td>
        <td>NT$${toThounsand(item.product.price)}</td>
        <td>${item.quantity}</td>
        <td>NT$${toThounsand(item.product.price * item.quantity)}</td>
        <td class="discardBtn" >
            <a href="#" class="material-icons" data-id="${item.id}">
                clear
            </a>
        </td>
    </tr>`
        //price = 
    });
    cartList.innerHTML = str;
    
};


//加入購物車(連接API)
productList.addEventListener("click",function(e){
    e.preventDefault();
    if(e.target.getAttribute("class") !== "addCardBtn"){
        return; 
    }
    let productId = e.target.getAttribute("data-id");
    let productTitle = e.target.getAttribute("data-product");
    let numCheck = 1;
    cartData.forEach(function(item){
        if(productId == item.product.id){
        numCheck = item.quantity +=1;
    } 
    });
    
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
        data: {
          "productId": productId,
          "quantity": numCheck
        }
      }).
        then(function (response) {
          alert(`商品"${productTitle}"加入購物車成功`)
          getCartList();
        })
});

//刪除全部購物車(連接API)
const deleteAllBtn = document.querySelector(".discardAllBtn");
deleteAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).
    then(function (response) {
      console.log(response.data);
      alert("成功清除所有購物車！");
      getCartList();
    })
});

//刪除特定購物車(連接API)
cartList.addEventListener("click",function(e){
    e.preventDefault();
    let cartId = e.target.getAttribute("data-id")
    if(cartId == null){
        return;
    }
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`).
    then(function (response) {
      alert("以刪除此商品");
      getCartList();
    })
});

//送出訂單(連接API)
//須滿足兩種條件：1.至少有一筆購物車資料 2.需填入所有預定資料
const orderInfoBtn = document.querySelector(".orderInfo-btn");


orderInfoBtn.addEventListener("click",function(e){
    e.preventDefault();
    if(cartData.length == 0){
        alert("請至少加入一筆購物車資料");
        return;
    };
    let customerName = document.querySelector("#customerName").value;
    let customerEmail = document.querySelector("#customerEmail").value;
    let customerPhone = document.querySelector("#customerPhone").value;
    let customerAddress = document.querySelector("#customerAddress").value;
    let tradeWay = document.querySelector("#tradeWay").value;
    if(customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || tradeWay == ""){
        alert("預定資料尚未填寫完整");
        return;
    }
     axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
    {
      "data": {
        "user": {
          "name": customerName,
          "tel": customerPhone,
          "email": customerEmail,
          "address": customerAddress,
          "payment": tradeWay
        }
      }
    }
  ).
    then(function (response) {
      alert("訂單已成功送出");
      getCartList();
      const orderForm= document.querySelector(".orderInfo-form");
      orderForm.reset();
    })
    .catch(function(error){
      console.log(error.response.data);
    })
    
});


//Email驗證
let customerEmail = document.querySelector("#customerEmail");
customerEmail.addEventListener("blur",function(e){
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(customerEmail.value)){
    document.querySelector(`[data-message="Email"]`).textContent = "";
  }else{
    document.querySelector(`[data-message="Email"]`).textContent = "請填寫正確Email格式";
    return false;
  }
});


//電話驗證
let customerPhone = document.querySelector("#customerPhone");
customerPhone.addEventListener("blur",function(e){
  if (/^[0-9]{10}$/.test(customerPhone.value)){
    document.querySelector(`[data-message="電話"]`).textContent = "";
  }else{
    document.querySelector(`[data-message="電話"]`).textContent = "請填寫正確電話格式";
    return false;
  }
});



//util.js
//千分位
function toThounsand(num){
    let parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}
