//DOM
const orderList = document.querySelector(".js-orderList");
let orderData;
//資料初始化
function init() {
  getOrderList();
};
init();

//抓取訂單資料(連接API)
function getOrderList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      orderData = response.data.orders;
      renderOrderData(orderData);
      renderCategoryChart(orderData);
      renderAllItemChart(orderData);
    })
}

//渲染訂單列表
function renderOrderData(data) {
  let str = "";

  data.forEach(function (item) {
    //訂單日期
    let orderDate = new Date(item.createdAt * 1000).toLocaleDateString();
    //組訂單品項字串
    let productStr = "";
    item.products.forEach(function (productItem) {
      productStr += `<p>${productItem.title} x ${productItem.quantity}</p>`
    });
    //訂單狀態字串
    let orderStatus = "";
    if (item.paid === false) {
      orderStatus = "未處理"
    } else {
      orderStatus = "已處理"
    }

    str += `<tr>
  <td>${item.id}</td>
  <td>
    <p>${item.user.name}</p>
    <p>${item.user.tel}</p>
  </td>
  <td>${item.user.address}</td>
  <td>${item.user.email}</td>
  <td>
    ${productStr}
  </td>
  <td>${orderDate}</td>
  <td class="orderStatus">
    <a href="#" class="js-orderStatus" data-id="${item.id}" data-paid="${item.paid}">${orderStatus}</a>
  </td>
  <td>
    <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${item.id}">
  </td>
</tr>`
  });
  orderList.innerHTML = str;
};

//清除全部訂單資料(連接API)
const discardAllBtn = document.querySelector(".discardAllBtn")
discardAllBtn.addEventListener("click", function (e) {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      console.log();
      orderData = response.data.orders;
      renderOrderData(orderData);
      swal("訂單已全部刪除成功");
      renderCategoryChart(orderData);
      renderAllItemChart(orderData);
    })
});




//清除特定訂單及更改訂單狀態邏輯
orderList.addEventListener("click", function (e) {
  e.preventDefault();
  let orderId = e.target.getAttribute("data-id")
  if (e.target.getAttribute("class") === "delSingleOrder-Btn") {
    deleteOrderItem(orderId);
  }
  if (e.target.getAttribute("class") === "js-orderStatus") {
    let paidStatus;
    if (e.target.getAttribute("data-paid") == "true") {
      paidStatus = false;
    } else {
      paidStatus = true;
    }
    editOrderList(orderId, paidStatus);
  }


});

//清除特定訂單資料(連接API)
function deleteOrderItem(orderId) {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderId}`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      console.log(response.data);
      orderData = response.data.orders;
      renderOrderData(orderData);
      swal("此訂單已刪除成功");
      renderCategoryChart(orderData);
      renderAllItemChart(orderData);
    })
};

//修改訂單狀態
function editOrderList(orderId, paidStatus) {
  axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      "data": {
        "id": orderId,
        "paid": paidStatus
      }
    },
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      console.log(response.data);
      orderData = response.data.orders;
      renderOrderData(orderData);
      swal("訂單狀態修改成功");
    })
}


//圖表:全產品類別營收比重
//篩選資料類別 做出資料關聯
function renderCategoryChart(orderData) {
  let obj = {}
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (obj[productItem.category] === undefined) {
        obj[productItem.category] = item.total;
      } else {
        obj[productItem.category] += item.total;
      }
    });
  });
  let categoryAry = Object.keys(obj);
  let categoryChartData = [];
  categoryAry.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(obj[item]);
    categoryChartData.push(ary);
  });

  //圖表:全產品類別營收比重
  let categoryChart = c3.generate({
    bindto: '#categoryChart',
    data: {
      columns: categoryChartData,
      type: "pie"
    }
  });
};

//圖表:全品項營收比重
//篩選資料類別 做出資料關聯
function renderAllItemChart(orderData) {
  let obj = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (obj[productItem.title] === undefined) {
        obj[productItem.title] = productItem.price * productItem.quantity;
      } else {
        obj[productItem.title] += productItem.price * productItem.quantity;
      }
    });
  });
  console.log(obj);
  let itemAry = Object.keys(obj);
  let allItemChartData = [];
  itemAry.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(obj[item]);
    allItemChartData.push(ary);
  });
  allItemChartData.sort(function (a, b) {
    return b[1] - a[1];
  });
  let otherTotal = ["其他"]
  let otherTotalPrice = 0;
  allItemChartData.forEach(function (item, index) {
    if (index > 2) {
      otherTotalPrice += item[1]
    }
  });
  otherTotal.push(otherTotalPrice);
  allItemChartData.splice(3, allItemChartData.length - 1);
  allItemChartData.push(otherTotal)
  console.log(allItemChartData);

  //圖表:全品項營收比重
  let allItemChart = c3.generate({
    bindto: '#allItemChart',
    data: {
      columns: allItemChartData,
      type: "pie"
    }
  });
};
