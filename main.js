import './assets/scss/all.scss';
import axios from 'axios';
import c3 from 'c3'
import validate from "validate.js";
let data = [];
const ticketName = document.querySelector('#ticketName');
const ticketImgUrl = document.querySelector('#ticketImgUrl');
const ticketRegion = document.querySelector('#ticketRegion');
const ticketPrice = document.querySelector('#ticketPrice');
const ticketNum = document.querySelector('#ticketNum');
const ticketRate = document.querySelector('#ticketRate');
const ticketDescription = document.querySelector('#ticketDescription');

const addTicketbtn = document.querySelector('.addTicket-btn');
const randerList = document.querySelector('.ticketCard-area');
const dataLen = document.querySelector('#searchResult-text');
const travelArea = document.querySelector('.regionSearch');
const forms = document.querySelector(".addTicket-form");
const inputText = document.querySelectorAll(
  "input[type=text],input[type=number],select[name=景點地區],textarea"
); //取得所有input標籤
travelArea.addEventListener('change',function(e){
  let selectValue = e.target.value;
  // console.log(selectValue);
  filterArea(selectValue)
});
function filterArea(area){
  let fliterTravelarea = [];
  if(area === 'All'){
    fliterTravelarea = data;
  }
  else{
    data.forEach(function(areaData){
      if(area === areaData.area){
        fliterTravelarea.push(areaData);
      }
    })
  }
  renderTicketcard(fliterTravelarea)
}
// 地區用 change 監聽
// 上方新增的地區跟下方篩選的地區都寫死選項（依照目前提供的 JSON data area 欄位）
// 地區的篩選下拉需要加上『全部地區』option
// 不需要有「清除資料」的按鈕
// 預設資料為 3 筆（內容需依照目前提供的 JSON data）
// 篩選後會顯示『搜尋資料為 ? 筆』
// 描述欄位使用 textarea
// 星級區間是 1-10 分
// 金額、組數、星級的 type 為 Number
addTicketbtn.addEventListener('click',(e)=>{
  e.preventDefault();
  inputText.forEach((e) =>{
    e.addEventListener("change", validationInput);
  });
  if (!validation(e)) {
    //按下加入按鈕時，驗證沒過時
    return;
  } else {
    addTickets();
    forms.reset();
  }
});
function addTickets() {
  let storedData = {}
  let id;
  // console.log(ticketName,ticketImgUrl,ticketRegion,ticketPrice,ticketNum,ticketRate,ticketDescription);
  // console.log(ticketRate.value);
  // if(ticketName.value==''||ticketImgUrl.value==""||ticketRegion.value==''||ticketPrice.value==""||ticketNum.value==''||ticketRate.value==''||ticketDescription.value==''){
  //   alert('請檢查是否有漏填資料');
  // }
  // else if(Number(ticketRate.value)<1 || Number(ticketRate.value)>10){
  //   alert('套票星級數字範圍必須為1-10之間');
  // }
  //   else if (ticketDescription.value.length>100){
  //   alert('套票描述必須為少於100字');
  // }
  // else{
    id = new Date().getTime();
    storedData.id =  id;
    storedData.name = ticketName.value;
    storedData.imgUrl = ticketImgUrl.value;
    storedData.area = ticketRegion.value;
    storedData.price = Number(ticketPrice.value);
    storedData.group = Number(ticketNum.value);
    storedData.rate = Number(ticketRate.value);
    storedData.description = ticketDescription.value;
    // console.log(data)
    data.push(storedData);
    // console.log(travelTicketdata);
    renderTicketcard(data);
  }
  // console.log(storedData);

  
function init(){
  axios.get('https://raw.githubusercontent.com/hexschool/js-training/main/travelApi.json')
  .then(function (res) {
    data = res.data.data;
    console.log(res.data);
    renderTicketcard(data)
    renderC3(data)
  })
  .catch(function(err){
    console.log(err.response);
  })
}
function renderTicketcard(travelTicketdata) {
    let str = '';
  travelTicketdata.forEach(function(ticket){
    let renderContent = `<li class="ticketCard">
        <div class="ticketCard-img">
          <a href="#">
            <img src="${ticket.imgUrl}" alt="">
          </a>
          <div class="ticketCard-region">${ticket.area}</div>
          <div class="ticketCard-rank">${ticket.rate}</div>
        </div>
        <div class="ticketCard-content">
          <div>
            <h3>
              <a href="#" class="ticketCard-name">${ticket.name}</a>
            </h3>
            <p class="ticketCard-description">
              ${ticket.description}
            </p>
          </div>
          <div class="ticketCard-info">
            <p class="ticketCard-num">
              <span><i class="fas fa-exclamation-circle"></i></span>
              剩下最後 <span id="ticketCard-num">${ticket.group}</span> 組
            </p>
            <p class="ticketCard-price">
              TWD <span id="ticketCard-price"> ${toThousands(ticket.price)}</span>
            </p>
          </div>
        </div>
      </li>`
    str += renderContent;
    
  })
    randerList.innerHTML = str;
    dataLen.textContent = `本次搜尋共 ${travelTicketdata.length} 筆資料`;
    renderC3(travelTicketdata)

}
function renderC3(renderData){
  // console.log(renderData);
  let totalObj = {};
  renderData.forEach(function(item){
    if(totalObj[item.area]==undefined){
      totalObj[item.area] = 1;
    }else{
      totalObj[item.area] +=1;
    }
  })
  // 篩選地區，並累加數字上去
  // totalObj 會變成 {高雄: 2, 台北: 1, 台中: 2}


  let C3Data = [];
  let area = Object.keys(totalObj);
  // console.log(totalObj);
  // area output ["高雄","台北","台中"]
  area.forEach(function(item,index){
    let ary = [];
    ary.push(item);
    ary.push(totalObj[item]);
    C3Data.push(ary);
    // C3Data = [["高雄", 2], ["台北",1], ["台中", 1]]
})
// 將 C3Data 丟入 c3 產生器
  const chart = c3.generate({
    bindto: "#chart",
    data: {
      columns: C3Data,
      type : 'donut',
      colors: {
        台北: "#26C0C7",
        台中: "#5151D3",
        高雄: "#E68618"
      },
    },
    donut: {
      width: 8,
      title: "套票地區比重",
      label: {
        show: false
      }
    },
    size: {
      width: 200,
      height: 160
    }
  });
}

// console.log(axios);

init()


//驗證表單規則
const constraints = {
  套票名稱: {
    presence: {
      message: "必填！"
    }
  },
  圖片網址: {
    presence: {
      message: "必填！"
    },
    url: {
      schemes: ["http", "https"],
      message: "請輸入正確的網址格式"
    }
  },
  景點地區: {
    presence: {
      message: "必填！"
    }
  },
  套票金額: {
    presence: {
      message: "必填！"
    },
    numericality: {
      greaterThan: 0,
      message: "必須大於 0"
    }
  },
  套票組數: {
    presence: {
      message: "必填！"
    },
    numericality: {
      greaterThan: 0,
      message: "必須大於 0"
    }
  },
  套票星級: {
    presence: {
      message: "必填！"
    },
    numericality: {
      greaterThanOrEqualTo: 1,
      lessThanOrEqualTo: 10,
      message: "必須符合 1-10 的區間"
    }
  },
  套票描述: {
    presence: {
      message: "必填！"
    },
    length: {
      maximum: 100,
      message: "限 100 字以內"
    }
  }
};
// forms.addEventListener('change',validation);
//當送出表單時，驗證表單是否符合規則
function validation(e) {
  // console.log(2);
  e.preventDefault();
  // const forms = document.querySelector(".addTicket-form");
  let errors = validate(forms, constraints);
  let pText = forms.querySelectorAll("p.alert-message");
  if (errors) {
    pText.forEach(function (text) {
      text.innerHTML = 
        `<i class="fas fa-exclamation-circle"></i>
        <span class="validate description">${errors[text.dataset.message]}</span>`;
    console.log(errors[text.dataset.message])
      if(errors[text.dataset.message]===undefined){
        text.innerHTML='';
      }
    });
    return false;
  } else {
    return true;
  }
}
//當表單寫有變動時，驗證表單是否符合規則
function validationInput(e) {
  e.preventDefault();
  let targetName = e.target.name;
  let error = validate(forms, constraints, { fullMessages: false });
  console.log(targetName);
  if (error) {
        if (!error[targetName] === undefined) {
            document.querySelector(`[data-message = ${targetName}]`).innerHTML = 
      `<i class="fas fa-exclamation-circle"></i>
      <span class="validate description">${error[targetName]}</span>`;
      // error[targetName] = "";
          return;
        }
    else{
       document.querySelector(`[data-message = ${targetName}]`).innerHTML = "";
    }
    console.log(error);
  }
}
function toThousands(x) {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}