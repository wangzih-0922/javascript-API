//綁定DOM
const productList = document.querySelector(".productWrap")
const cartList = document.querySelector(".shoppingCart-tbody"
let productData;
let cartData;
                                        
//資料初始化
function init() {
  getProductList();
  getCartList();
};
init();

//取得產品資料(連接API)
function getProductList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`).
    then(function (response) {
      productData = response.data.products;
      renderPoductList(productData);
    })
    .catch(function (error) {
      console.log(error.response.data)
    })
}

//產品顯示渲染
function renderPoductList(data) {
  let str = "";
  data.forEach(function (item) {
    str += `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="">
    <a href="#" class="addCardBtn" data-id="${item.id}" data-title="${item.title}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$ ${toThounsand(item.origin_price)}</del>
    <p class="nowPrice">NT$${toThounsand(item.price)}</p>
</li>`
  })
  productList.innerHTML = str;
};

//產品篩選邏輯
const productSelect = document.querySelector(".productSelect")
productSelect.addEventListener("change", function (e) {
  let category = e.target.value;
  if (category === "全部") {
    renderPoductList(productData);
    return;
  };
  categoryData = productData.filter(function (item) {
    return item.category === category;
  });
  renderPoductList(categoryData);
}
);


//取得購物車資料(連接API)
let finalPrice;
function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).
    then(function (response) {
      cartData = response.data.carts;
      finalPrice = response.data.finalTotal;
      renderCartList(cartData);
    })
}


//購物車顯示渲染
const totalPrice = document.querySelector(".totalPrice");
function renderCartList(data) {
  let str = "";
  data.forEach(function (item) {
    str += `<tr>
    <td>
      <div class="cardItem-title">
        <img src="${item.product.images}" alt="">
          <p>${item.product.title}</p>
      </div>
    </td>
    <td>NT$${toThounsand(item.product.price)}</td>
    <td>${item.quantity}</td>
    <td>NT$${toThounsand(item.product.price * item.quantity)}</td>
    <td class="discardBtn">
      <a href="#" class="material-icons js-delSingleBtn" data-id="${item.id}" data-title="${item.product.title}">
        clear
      </a>
    </td>
  </tr>`;
  });
  cartList.innerHTML = str;
  totalPrice.textContent = toThounsand(finalPrice);
};


//加入購物車及產品數量邏輯
productList.addEventListener("click", function (e) {
  e.preventDefault();
  let addCardBtn = document.querySelector(".addCardBtn")
  if (e.target.getAttribute("class") !== "addCardBtn") {
    return;
  }
  let productId = e.target.getAttribute("data-id");
  let productTitle = e.target.getAttribute("data-title");

  let newAry = cartData.filter(function (item) {
    return item.product.id == productId;
  })

  if (newAry[0] == undefined) {
    addCartItem(productId, productTitle);
  } else {
    addProductNum(newAry[0].id, newAry[0].quantity + 1, productTitle);

  }


});

//加入購物車(連接API)
function addCartItem(productId, productTitle) {
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
    data: {
      "productId": productId,
      "quantity": 1
    }
  }).
    then(function (response) {
      swal("已加入購物車", `${productTitle}  X1`, "success");
      cartData = response.data.carts;
      renderCartList(cartData);
      totalPrice.textContent = toThounsand(response.data.finalTotal);

    })
};

//增加商品數量(連接API)
function addProductNum(cardId, productQuantity, productTitle) {
  axios.patch(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
    "data": {
      "id": cardId,
      "quantity": productQuantity
    }
  }).
    then(function (response) {
      swal("已加入購物車", `${productTitle}  X1`, "success");
      cartData = response.data.carts
      renderCartList(cartData);
      totalPrice.textContent = toThounsand(response.data.finalTotal);
    })
};



//刪除全部購物車(連接API)
const discardAllBtn = document.querySelector(".discardAllBtn")
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).
    then(function (response) {
      cartData = response.data.carts;
      renderCartList(cartData);
      totalPrice.textContent = response.data.finalTotal;
      swal({
        title: `${response.data.message}`,
        icon: "success"
      });
    })
});

//刪除特定購物車(連接API)
cartList.addEventListener("click", function (e) {
  e.preventDefault();
  if (e.target.getAttribute("class") !== "material-icons js-delSingleBtn") {
    return;
  }
  let cartId = e.target.getAttribute("data-id");
  let cartTitle = e.target.getAttribute("data-title");
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`).
    then(function (response) {
      cartData = response.data.carts
      renderCartList(cartData);
      totalPrice.textContent = toThounsand(response.data.finalTotal);
      swal({
        title: `已成功刪除 ${cartTitle}`,
        icon: "success"
      });
    })

});

//送出訂單(連接API)
const orderBtn = document.querySelector(".orderInfo-btn");
orderBtn.addEventListener("click", function (e) {
  e.preventDefault();
  if (cartData.length === 0) {
    swal("請至少加入一項商品至購物車");
    return;
  }
  let name = document.querySelector("#customerName").value;
  let phone = document.querySelector("#customerPhone").value;
  let email = document.querySelector("#customerEmail").value;
  let address = document.querySelector("#customerAddress").value;
  let tradeWay = document.querySelector("#tradeWay").value;

  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
    {
      "data": {
        "user": {
          "name": name,
          "tel": phone,
          "email": email,
          "address": address,
          "payment": tradeWay
        }
      }
    }
  ).
    then(function (response) {
      console.log(response.data);
      swal({
        title: "已成功送出訂單！",
        icon: "success"
      });

      form.reset();
    })
    .catch(function (error) {
      console.log(error.response.data);
    })
});


//util
//千分位
function toThounsand(num) {
  let parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}


