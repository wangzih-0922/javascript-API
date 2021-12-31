
//DOM
const pieChart = document.querySelector("#chart");
const orderList = document.querySelector(".js-orderList");

//資料初始化
function init(){
    getOrderList();
};
init();
let orderData;
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
        renderOrderList();
        renderC3Data();
      })
  };

//顯示訂單列表
function renderOrderList(){
    let str = "";
    orderData.forEach(function(item){
        //組訂單品項字串
        let orderTitle = "";
        item.products.forEach(function(productItem){
            orderTitle += `<p>${productItem.title}X${productItem.quantity}</p>`
        });

        //組訂單日期
        let timeStamp = new Date(item.updatedAt*1000);
        let orderDate = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`

        //組訂單狀態字串
        let paidStatus = "";
        if(item.paid == false){
            paidStatus = "未處理";
        }else{
            paidStatus = "已處理";
        }
        //組orderList字串
        str +=`<tr>
        <td>${item.id}</td>
        <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
          ${orderTitle}
        </td>
        <td>${orderDate}</td>
        <td class="orderStatus">
          <a href="#" class="js-orderStatus" data-id="${item.id}" data-status="${item.paid}">${paidStatus}</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${item.id}">
        </td>
    </tr>`
    });
    orderList.innerHTML = str;
};
//清除全部訂單資料(連接API)
const deleteAllBtn = document.querySelector(".discardAllBtn");
deleteAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      alert("已成功清除所有訂單");
      getOrderList();
    })
});

//修改訂單狀態
orderList.addEventListener("click",function(e){
    let orderId = e.target.getAttribute("data-id");
    let orderStatus = e.target.getAttribute("data-status");
    e.preventDefault();
    if(e.target.getAttribute("class") == "js-orderStatus"){
        let newStatus = ""
        if(orderStatus == "false"){
        newStatus = true;
        }else{
        newStatus = false;
        };
        orderStatusChange(orderId,newStatus);
        return;
    }
    if(e.target.getAttribute("class") == "delSingleOrder-Btn"){
        deleteOrder(orderId)
        return;
    }
});

function orderStatusChange(orderId,newStatus){
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      "data": {
        "id": orderId,
        "paid": newStatus
      }
    },
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      getOrderList();
    })
};

//清除特定訂單資料(連接API)
function deleteOrder(orderId){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderId}`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      alert("此訂單已成功刪除");
      getOrderList();
    })
};

//顯示圖表LV2
//篩選資料類別 做出資料關聯
function renderC3Data(){
    let obj ={};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(obj[productItem.title] == undefined){
                obj[productItem.title] = productItem.price * productItem.quantity;
            }else{
                obj[productItem.title] += productItem.price* productItem.quantity;
            }
        })
    });
    let titleAry = Object.keys(obj);
    let pieChartData = [];
    titleAry.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(obj[item]);
        pieChartData.push(ary);
    });
    pieChartData.sort(function(a,b){
        return b[1]-a[1];
    });
    if(pieChartData.length >4){
        let totalOther = ["其他"];
         let totalPrice = 0;
         pieChartData.forEach(function(item,index){
             if(index>2){
                totalPrice += item[1];
             }
            
           });
        totalOther.push(totalPrice);
        pieChartData.splice(3,pieChartData.length-1);
        pieChartData.push(totalOther);
    }
  

    // C3.js
    let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: pieChartData,
    },
});


};
