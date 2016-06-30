'use strict';
var dateToday = new Date();
function addZeros(n, needLength) {
  needLength = needLength || 2;
  n = String(n);
  while (n.length < needLength) {
    n = "0" + n;
  }
  return n
}

      function makeInithials(name) {
          var IFO = name.split(' ');
          if(IFO[2]){
          return IFO[1].charAt(0)+'.'+IFO[2].charAt(0)+'. '+IFO[0]; 
      	}else{
      		return IFO[1].charAt(0)+'.'+IFO[0]; 
      	}
      }
       
var sqlDateNow = dateToday.getFullYear()+'-'+addZeros( (dateToday.getMonth() + 1) )+'-'+addZeros( dateToday.getDate() );
/*18.06.2016*/

function revDate(s)

{ var n=s.length-1

var h;

var s1='';

for (var i=0; i <=n; i++)

{ s1+=s.charAt(n-i) }

return s1;

}
var mainApp = angular.module('mainApp', [])
.factory('FlatsFactory', ['$rootScope', '$http', function($rootScope, $http) {
$rootScope.newLastNumberTest = true;
  var flatObj = {};
  var month = [
  'січня',
  'лютого',
  'березня',
  'квітня',
  'травня',
  'червня',
  'липня',
  'серпня',
  'вересня',
  'жовтня',
  'листопада',
  'грудня'
  ];
 // flatObj.typeUserAccept =function(){
 //   var typeNumber = +getUserInfo().type.slice(-2,-1);
 //
 //    return showFlats(typeNumber);
 // }
 // function showFlats(typeAcceptNumber){
 //  switch(typeAcceptNumber){
 //    case 1:
 //    case 2:
 //    case 4:
 //    case 5:
 //    case 7:
 //      return true;
 //    case 3:
 //      return false;
 //    default:
 //     return false;
 //  }

 // }
 flatObj.selectedFlat = {};

 $http.get('/api/data/table?t=385')
 .success(function(data){
  $rootScope.dollar = data[data.length-1].f2;
});


 flatObj.setSelectedFlat = function(selectedFlat) {
    this.selectedFlat = selectedFlat;
    this.selectedFlat.minPaymentSumm = getMinPaymentSumm(selectedFlat);
    this.selectedFlat.manager = getUserInfo();
    $rootScope.$broadcast('setSelectedFlatChanged');
  }

  function getMinPaymentSumm(selFlat) {
    if (selFlat && selFlat.f6 && selFlat.f6[0] ) {

      // var totalSumm;
      // if(selFlat.creditMonts === 6){
      //   totalSumm = summRound(selFlat.totalSumm*1.03);
      // }
      // if(selFlat.creditMonts === 12){
      //   totalSumm = summRound(selFlat.totalSumm*1.06);
      // }

      if (selFlat.room == 1) {
        return summRound((selFlat.totalSumm / 100) * 70);
      } else {
        return summRound(selFlat.totalSumm / 2);
      }
    /*} else if(selFlat && selFlat.f6 && selFlat.f6[0] && selFlat.f6[0].f1 == 2) {
      if (selFlat.room == 1) {
        return summRound((selFlat.totalSumm / 100) * 70);
      } else {
        return summRound(selFlat.totalSumm / 2);
      }
    } else {
      return 0;
    }*/
  }
}
  flatObj.getSelectedFlat = function() {
    return this.selectedFlat;
  }

  flatObj.getDiscount = function(callback, flatType, section, house) {
    var discounts = [];
    $http.get('/api/data/table?t=384')
    .success(function(data){
      for(var i = data.length - 1; i >= 0; i--) {
        if (flatObj.toMySqlFormat(data[i].f8) && flatObj.toMySqlFormat(data[i].f9)) {
          if(new Date(data[i].f8) <= new Date && new Date(data[i].f9) >= new Date) {
            if(data[i].f4.indexOf("|") > -1) {
              var flatTypes = data[i].f4.split("|").filter(function(v){return v!==''});
              flatTypes.forEach(function(type) {
                if(flatType.toLowerCase() == type.toLowerCase()) {
                  discounts.push(data[i]);
                }
              });
            } else if(data[i].f4.toLowerCase() == flatType.toLowerCase()) {
              discounts.push(data[i]);
            }
          }
        }
      }
      callback(discounts);
    });
  }

  flatObj.getStock = function(callback, flatType, section, house) {
    var stocks = [];
    $http.get('/api/data/table?t=383')
    .success(function(data){
      for(var i = 0, l = data.length; i < l; i++) {
        if (flatObj.toMySqlFormat(data[i].f4) && flatObj.toMySqlFormat(data[i].f5)) {
          if(new Date(data[i].f4) <= new Date && new Date(data[i].f5) >= new Date) {

            if(data[i].f7.indexOf("|") > -1) {
              var flatTypes = data[i].f7.split("|").filter(function(v){return v!==''});

              flatTypes.forEach(function(type) {
                if(flatType.toLowerCase() == type.toLowerCase()) {
                  stocks.push(data[i]);
                }
              });
            } else if(data[i].f7.toLowerCase() == flatType.toLowerCase()) {
              stocks.push(data[i]);
            }

          }
        }
      }

      callback(stocks);

    });
  }

  flatObj.getFlats = function(callback) {
    var flats = null;
    $http.get('/api/data/table?t=273')
    .success(function(data){
      for(var i = data.length - 1; i >= 0; i--) {
        data[i].finalDate = checkFinalDate(data[i]);
         data[i].totalSumm = summRound(data[i].price * data[i].square);
        data[i].historyList = data[i].f8;
        data[i].paymentList = data[i].f9;
        data[i].NewClass = flatObj.getFlatClass(data[i]);
      }
      callback(data);
    });
  }

  function checkFinalDate(flat) {
    var finalDate = '';
    if (flat) {
      if(flat.f9 && flat.f9[flat.f9.length -1].f1) {
        finalDate = toTrueFormat(flat.f9[flat.f9.length -1].f1);
      } else if(flat.f8 && flat.f8[flat.f8.length -1] &&
        flat.f8[flat.f8.length -1].f1 != "Отмена задатка" && flat.f8[flat.f8.length -1].f1 != "Возврат средств") {
        finalDate = toTrueFormat(flat.f8[flat.f8.length -1].f2);
      }
    }
    return finalDate;
  }

  flatObj.toTrueFormat = function(date) {
    if(date) {
      return date.replace(/(\d+)\-(\d+)\-(\d+)/,"$3.$2.$1");
    } else {
      return date;
    }
  }

  flatObj.toMySqlFormat = function(date) {
    if (date) {
      return date.replace(/(\d+)\-(\d+)\-(\d+)/,"$3-$2-$1");
    } else {
      return date;
    }
  }

  flatObj.dataAdd = function(id, data) {
    var res = false,
    dataA = new FormData();
    dataA.append('t', id);
    for (var k in data) dataA.append('data['+k+']', data[k]);
      ajaxPost('/api/data/addNewRow', dataA, false, function(data) {
        if (parseInt(data)) res = parseInt(data);
      });
    return res;
  }
  flatObj.flatsAdd = function(flat,house,price) {
   var data = new FormData();
      data.append('t', '273');
      data.append('data[f1]', flat.number);
      data.append('data[f2]', flat.floor);
      data.append('data[f5]', flat.rooms);
      data.append('data[f3]', 1);
      data.append('data[f12]', flat.section);
      data.append('data[f11]', flat.type);
      data.append('data[f4]', flat.square);
      data.append('data[f10]', flat.squarelive);
      data.append('data[f21]', price);
      data.append('data[f6]', house);
      data.append('data[f13]', 1);
      data.append('data[f16]', null);
      data.append('data[f8]', null);
      data.append('data[f14]', '');
      
      ajaxPost('/api/data/addNewRow', data, false,function(){
        console.log('Добавлена квартира №',data.number);
      });
  }
  flatObj.dataUpdate = function(id, data) {
    var res = false,
    dataA = new FormData();
    dataA.append('r', id);
    for (var k in data) dataA.append('data['+k+']', data[k]);
      ajaxPost('/api/data/updateRow', dataA, false, function(data) {
        if (data == 'ok') res = true;
      });

    return res;
  }

  flatObj.dataDelete = function(dataId, callback) {
    ajaxGet('/api/data/delete?r=' + dataId, function(data) {
      callback(data);
    }, false);
  }

  flatObj.getDatapickerValueInMySqlFormat = function(operationBlockId, datePickerId) {
    var date = new Date(find(operationBlockId).querySelectorAll("input#"+datePickerId)[0].value);
    if (date) {
      return flatObj.toMySqlFormat(getTrueDate(date.getDate()) + "-" + getTrueMonth(date.getMonth() + 1) + "-" + date.getFullYear());
    } else {
      return null;
    }
  }

  function getTrueDate(date) {
    return date < 10 ? '0' + date : date;
  }
  function getTrueMonth(month) {
    return month < 10 ? '0' + month : month;
  }

  flatObj.getCurrentDateToMySqlFormat = function() {
    return flatObj.toMySqlFormat(getTrueDate(new Date().getDate()) + "-" + (getTrueMonth(new Date().getMonth() + 1)) + "-" + new Date().getFullYear());
  }

  flatObj.getLastOperationByFlat = function(flat) {
    if(flat) {
        if(flat.f8 && flat.f8.length) { // check if flat has at least one operation
          if (flat.f8[flat.f8.length -1].f2) {
            flat.f8[flat.f8.length -1].f2 = flatObj.toTrueFormat(flat.f8[flat.f8.length -1].f2);
          }
          return flat.f8[flat.f8.length -1];
        } else {
          return "";
        }
      } else {
        return "";
      }
    }

    flatObj.clearF8AndF9Fields = function(flat) {
      var data = {
        'f8': ' ',
        'f9': ' ',
        'f13': 1,
        'f15': ' ',
        'f14': ' ',
        'f16': ' '
        //'f10': summRound(parseFloat(flat.square) - 5.1)
        // 'f5' : "Офис"
      }
      flatObj.dataUpdate(flat.field_value_id, data);
    }

    //Work with flat table
    flatObj.updateFlatOperationField = function(newOperationId, callback) {
      if ($rootScope.selectedFlat && newOperationId) {
        var finalUpdatedOperationField = "|",
        data;
        if($rootScope.selectedFlat.historyList) {
          $rootScope.selectedFlat.historyList.forEach(function(item) {
            finalUpdatedOperationField += item.field_value_id + "|";
          });
        }
        finalUpdatedOperationField += newOperationId + "|";
        data = {
          'f8': finalUpdatedOperationField
        }

        callback(flatObj.dataUpdate($rootScope.selectedFlat.field_value_id, data));
      } else {
        Materialize.toast("Cant be apdated, something wrong!!!", 3000);
        callback(null);
      }
    }
    flatObj.updateFlatPlanningOperationField = function(newPlanningOperationId, callback) {
      if(newPlanningOperationId) {
        var finalUpdatedOperationField = "|",
        data;
        if($rootScope.selectedFlat.planningList) {
          $rootScope.selectedFlat.historyList.forEach(function(item) {
            finalUpdatedOperationField += item.field_value_id + "|";
          });
        }
        finalUpdatedOperationField += newPlanningOperationId + "|";
        data = {
          'f9': finalUpdatedOperationField
        }

        callback(flatObj.dataUpdate($rootScope.selectedFlat.field_value_id, data));
      }
    }
    function getClientById(clientId){
    	var f = new FormData();
    	f.append('r',clientId);
    	var clientFIO
    	ajaxPost('/api/data/tableRows',f,false,function(data){
    		clientFIO = JSON.parse(data)

    	});
    	return clientFIO[0].name;
    }
    function getClientsIdFromSelectedClientsArrayInScope() {
      if($rootScope.selectedFlat.clientsArray) {
        var clientIdBetweenPipes = "|";
        $rootScope.selectedFlat.clientsArray.forEach(function(selectedClient) {
          clientIdBetweenPipes += selectedClient.field_value_id + "|";
        });
        return clientIdBetweenPipes;
      } else {
        return null;
      }
    }

    function fillGenericFlatFields(formData, flat, type) {
      formData.append('snippet', getSnippetId(flat, type));
      formData.append('data[testImg]', getFloorImg(flat.floor, flat.section) || "");
      formData.append('data[contractNumber]', getContractNumber(getUserInfo(), $rootScope.selectedFlat.section, $rootScope.selectedFlat.f1));
      formData.append('data[section]', flat.section);
      formData.append('data[flatNum]', flat.f1);
      var flatNumCursive = getTextNumber(flat.f1);
      formData.append('data[flatNumCursive]', flatNumCursive || "");
      formData.append('data[flatHouse]', flat.f6[0].f1);
      var flatHouseCursive = getTextNumber(flat.f6[0].f1);
      if (flatHouseCursive === 'одна')      flatHouseCursive = 'один';
      if (flatHouseCursive === 'дві')      flatHouseCursive = 'два';
      if (flat.f6[0].f1 == "8,10") 
        flatHouseCursive = 'вісім, десять';
      formData.append('data[flatHouseCursive]', flatHouseCursive);
      var flatRoomsCursive = getTextNumber(flat.room);
      formData.append('data[flatRoomsCursive]', flatRoomsCursive);
      var flatAllSquareCursive = toCursive(flat.square);
      formData.append('data[flatAllSquareCursive]', flatAllSquareCursive || "");
      var flatLivingSquareCursive = toCursive(flat.liveSquare);
      formData.append('data[flatLivingSquareCursive]', flatLivingSquareCursive || "");
      formData.append('data[currentDate]', getTrueDate(new Date().getDate()));
      formData.append('data[currentMonth]', month[new Date().getMonth()]);
      formData.append('data[currentYear]', getTrueMonth(new Date().getFullYear()));
      formData.append('data[currentDMY]', ( getTrueDate(new Date().getDate()) + "." + getTrueMonth(new Date().getMonth() + 1) + "." + new Date().getFullYear()));
      var brickType = "цегла керамічна М100, гіпсова штукатурка";
      var floorType ="цементно-піщана стяжка"
      if(flat.floor == 1){
      	brickType = "цегла керамічна М100";
      	floorType ="цементно-піщана стяжка відсутня";
      }
      if(flat.floor > 4) {
        brickType = "газоблок стіновий";
      }
      formData.append('data[brickType]', brickType);
      formData.append('data[floorType]', floorType);
    }
    function getFloorImg(floorNumber, section) {
    	
      var returnedVal = "<img style=\"width: 500px; height: auto; text-align: center; display:block; margin: 0 auto;\" src=\"http://sales.barcelona.co.ua/files/imgPdf/Floors/";
      switch (floorNumber) {
        case "0":
        switch (section) {
          case "A1":
          returnedVal = "";
          break;
          case "A2":
          returnedVal = "";
          break;
          case "A3":
          returnedVal = "";
          break;
          case "A4":
          returnedVal = "";
          break;
          case "Б1":
          returnedVal = "";
          break;
          case "Б2":
          returnedVal = "";
          break;
          case "Б3":
          returnedVal = "";
          break;
          case "Б4":
          returnedVal = "";
          break;
          case "В1":
          returnedVal = "";
          break;
          case "В2":
          returnedVal = "";
          break;
          case "В3":
          returnedVal = "";
          break;
          case "В4":
          returnedVal = "";
          break;
          default:
          returnedVal = "";
        }
        break;
        case "1":
        switch (section) {
          case "A1":
          case "А1":
          returnedVal += "Floor1/А1_1_этаж.jpg\"/>";
          break;
          case "A2":
          returnedVal = "";
          break;
          case "A3":
          returnedVal = "";
          break;
          case "A4":
          case "А4":
          returnedVal += "Floor1/А4_1_этаж.jpg\"/>";
          break;
          case "Б1":
          returnedVal += "Floor1/Б1_2_этаж_цвет.jpg\"/>";
          break;
          case "Б2":
          returnedVal += "Floor1/Б2_1_этаж_цветное.jpg\"/>";
          break;
          case "Б3":
          returnedVal += "Floor1/Б3_1этаж.jpg\"/>";
          break;
          case "Б4":
          returnedVal += "Floor1/Б4_1_этаж.jpg\"/>";
          break;
          case "В1":
          returnedVal += "Floor1/В1_1_этаж.jpg\"/>";
          break;
          case "В2":
          returnedVal = "";
          break;
          case "В3":
          returnedVal += "Floor1/В3-В4_1_этаж.jpg\"/>";
          break;
          case "В4":
          returnedVal += "Floor1/В3-В4_1_этаж.jpg\"/>";
          break;
          default:
          returnedVal = "";
        }
        break;
        case "2":
        switch (section) {
          case "A1":
          case "А1":
          returnedVal += "Floor2/А1_2_этаж_цвет.jpg\"/>";
          break;
          case "A2":
          case "А2":
          returnedVal += "Floor2/А2_2_этаж_цветное.jpg\"/>";
          break;
          case "A3":
          case "А3":
          returnedVal += "Floor2/А3_2_этаж.jpg\"/>";
          break;
          case "A4":
          case "А4":
          returnedVal += "Floor2/А4_2_этаж.jpg\"/>";
          break;
          case "Б1":
          returnedVal += "Floor2/Б1_2_этаж_цвет.jpg\"/>";
          break;
          case "Б2":
          returnedVal += "Floor2/Б2_2_этаж_цветное.jpg\"/>";
          break;
          case "Б3":
          returnedVal += "Floor2/Б3_2этаж.jpg\"/>";
          break;
          case "Б4":
          returnedVal += "Floor2/Б4_2_этаж.jpg\"/>";
          break;
          case "В1":
          returnedVal += "Floor2/В1_2_этаж_цвет.jpg\"/>";
          break;
          case "В2":
          returnedVal += "Floor2/В2_2_этаж.jpg\"/>";
          break;
          case "В3":
          returnedVal += "Floor2/В3_2_этаж.jpg\"/>";
          break;
          case "В4":
          returnedVal += "Floor2/В4_2_этаж.jpg\"/>";
          break;
          default:
          returnedVal = "";
        }
        break;
        case "3":
        switch (section) {
          case "A1":
          case "А1":
          returnedVal += "Floor3/А1_3_этаж_цвет.jpg\"/>";
          break;
          case "A2":
          case "А2":
          returnedVal += "Floor3/А2_3_этаж_цветное.jpg\"/>";
          break;
          case "A3":
          case "А3":
          returnedVal += "Floor3/А3_3_этаж.jpg\"/>";
          break;
          case "A4":
          case "А4":
          returnedVal += "Floor3/А4_3_этаж.jpg\"/>";
          break;
          case "Б1":
          returnedVal += "Floor3/Б1_3_этаж_цвет.jpg\"/>";
          break;
          case "Б2":
          returnedVal += "Floor3/Б2_3_этаж_цветное.jpg\"/>";
          break;
          case "Б3":
          returnedVal += "Floor3/Б3_3_этаж.jpg\"/>";
          break;
          case "Б4":
          returnedVal += "Floor3/Б4_3_этаж.jpg\"/>";
          break;
          case "В1":
          returnedVal += "Floor3/В1-В2_3_этаж.jpg\"/>";
          break;
          case "В2":
          returnedVal += "Floor3/В1-В2_3_этаж.jpg\"/>";
          break;
          case "В3":
          returnedVal += "Floor3/В3_3_этаж.jpg\"/>";
          break;
          case "В4":
          returnedVal += "Floor3/В4_3_этаж.jpg\"/>";
          break;
          default:
          returnedVal = "";
        }
        break;
        case "4":
        switch (section) {
          case "A1":
          case "А1":
          returnedVal += "Floor4/А1_4_этаж_цвет.jpg\"/>";
          break;
          case "A2":
          case "А2":
          returnedVal += "Floor4/А2_4_этаж_цветное.jpg\"/>";
          break;
          case "A3":
          case "А3":

          returnedVal += "Floor4/А3_4_этаж.jpg\"/>";
          break;
          case "A4":
          case "А4":
          returnedVal += "Floor4/А4_4_этаж.jpg\"/>";
          break;
          case "Б1":
          returnedVal += "Floor4/Б1_4_этаж_цвет.jpg\"/>";
          break;
          case "Б2":
          returnedVal += "Floor4/Б2_4_этаж_цветное.jpg\"/>";
          break;
          case "Б3":
          returnedVal += "Floor4/Б3_4_этаж.jpg\"/>";
          break;
          case "Б4":
          returnedVal += "Floor4/Б4_4_этаж.jpg\"/>";
          break;
          case "В1":
          returnedVal += "Floor4/В1_4_этаж_цвет.jpg\"/>";
          break;
          case "В2":
          returnedVal += "Floor4/В2_4_этаж_цветное.jpg\"/>";
          break;
          case "В3":
          returnedVal += "Floor4/В3_4_этаж.jpg\"/>";
          break;
          case "В4":
          returnedVal += "Floor4/В4_4_этаж.jpg\"/>";
          break;
          default:
          returnedVal = "";
        }
        break;
        case "5":
        switch (section) {
          case "A1":
          case "А1":
          returnedVal += "Floor5/А1_5_этаж_цвет.jpg\"/>";
          break;
          case "A2":
          case "А2":
          returnedVal += "Floor5/А2_5_этаж_цветное.jpg\"/>";
          break;
          case "A3":
          case "А3":
          returnedVal += "Floor5/А3_5_этаж.jpg\"/>";
          break;
          case "A4":
          case "А4":
          returnedVal += "Floor5/А4_5_этаж.jpg\"/>";
          break;
          case "Б1":
          returnedVal += "Floor5/Б1_5_этаж_цвет.jpg\"/>";
          break;
          case "Б2":
          returnedVal += "Floor5/Б2_5_этаж_цветное.jpg\"/>";
          break;
          case "Б3":
          returnedVal += "Floor5/Б3_5_этаж.jpg\"/>";
          break;
          case "Б4":
          returnedVal += "Floor5/Б4_5_этаж.jpg\"/>";
          break;
          case "В1":
          returnedVal += "Floor5/В1-В2_5_этаж.jpg\"/>";
          break;
          case "В2":
          returnedVal += "Floor5/В1-В2_5_этаж.jpg\"/>";
          break;
          case "В3":
          returnedVal += "Floor5/В3_5_этаж.jpg\"/>";
          break;
          case "В4":
          returnedVal += "Floor5/В4_5_этаж.jpg\"/>";
          break;
          default:
          returnedVal = "";
        }
        break;
        case "6":
        switch (section) {
          case "A1":
          case "А1":
          returnedVal += "Floor6/А1_6_этаж_цвет.jpg\"/>";
          break;
          case "A2":
          case "А2":
          returnedVal += "Floor6/А2_6_этаж_цветное.jpg\"/>";
          break;
          case "A3":
          case "А3":
          returnedVal += "Floor6/А3_6_этаж.jpg\"/>";
          break;
          case "A4":
          case "А4":
          returnedVal += "Floor6/А4_6_этаж.jpg\"/>";
          break;
          case "Б1":
          returnedVal += "Floor6/Б1_6_этаж_цветное.jpg\"/>";
          break;
          case "Б2":
          returnedVal += "Floor6/Б2_6_этаж_цветное.jpg\"/>";
          break;
          case "Б3":
          returnedVal += "Floor6/Б3_6_этаж.jpg\"/>";
          break;
          case "Б4":
          returnedVal += "Floor6/Б4_6_этаж.jpg\"/>";
          break;
          case "В1":
          returnedVal += "Floor6/В1_6_этаж_цвет.jpg\"/>";
          break;
          case "В2":
          returnedVal += "Floor6/В2_6_этаж_цветное.jpg\"/>";
          break;
          case "В3":
          returnedVal += "Floor6/В3_6_этаж.jpg\"/>";
          break;
          case "В4":
          returnedVal += "Floor6/В4_6_этаж.jpg\"/>";
          break;
          default:
          returnedVal = "";
        }
        break;
        case "7":
        switch (section) {
          case "A1":
          case "А1":
          returnedVal = "";
          break;
          case "A2":
          case "А2":
          returnedVal = "";
          break;
          case "A3":
          case "А3":
          returnedVal = "";
          break;
          case "A4":
          case "А4":
          returnedVal = "";
          break;
          case "Б1":
          returnedVal += "Floor7/Б1_7_этаж_цветное.jpg\"/>";
          break;
          case "Б2":
          returnedVal += "Floor7/Б2-7-этаж-цвет.jpg\"/>";
          break;
          case "Б3":
          returnedVal += "Floor7/Б3-7-этаж-цвет.jpg\"/>";
          break;
          case "Б4":
          returnedVal += "Floor7/Б4-7-этаж-цвет.jpg\"/>";
          break;
          case "В1":
          returnedVal = "";
          break;
          case "В2":
          returnedVal = "";
          break;
          case "В3":
          returnedVal = "";
          break;
          case "В4":
          returnedVal = "";
          break;
          default:
          returnedVal = "";
        }
        break;
        default:
        returnedVal = "";
        break;
      }
      //console.log(floorNumber, "floorNumber");
      //console.log(returnedVal, "img");
      return returnedVal;
    }
    function getSnippetId(flat, type) {
      var id = 0;
      var deposit = flatObj.checkIfFlatHasDeposit(flat);
      var lastOperation = flatObj.getLastOperationByFlat(flat);
      if (flat.f11 == "Квартира" || flat.f11 == "квартира") { //жилое
        if (lastOperation && lastOperation.f1 == "Внесен задаток") {
          if (type == "Продано") {
            if (flat.clientsArray.length == 1) {
              id = 587;
            } else if(flat.clientsArray.length == 2) {
              id = 591;
            }
          } else if (type == "Рассрочка") {
            if (flat.clientsArray.length == 1) {
              id=595;//1 покупатель задаток + рассрочка
            } else if(flat.clientsArray.length == 2) {
              id=593;

            }
          }
        } else {
          if (type == "Внесен задаток") { //задаток
            if (flat.clientsArray.length == 1) { //на одного клиента
             id = 634;
           } else if (flat.clientsArray.length == 2) {
            Materialize.toast("Ошибка задаток только на одного клиента", 3000)
          }
        } else if (type == "Продано") {
            if (flat.clientsArray.length == 1) { //на одного клиента
             id = 602;
           } else if (flat.clientsArray.length == 2) {
            id = 604;
          }
        } else if (type == "Рассрочка") {
            if (flat.clientsArray.length == 1) { //на одного клиента
             id = 606;
           } else if (flat.clientsArray.length == 2) {
            id= 605;
          }
        }
      }

    } else if (flat.f11 == "Офис" || flat.f11 == "офис") {
      if (lastOperation && lastOperation.f1 == "Внесен задаток") {
        if (type == "Продано") {
          if (flat.clientsArray.length == 1) {
            id = 596;
          } else if(flat.clientsArray.length == 2) {
            id = 597;
          }
        } else if (type == "Рассрочка") {
          if (flat.clientsArray.length == 1) {
              id=601;//1 покупатель задаток + рассрочка
            } else if(flat.clientsArray.length == 2) {
              id=599;//2 покупателя + рассрочка

            }
          }
        }else{
          if (type == "Продано") {
            if (flat.clientsArray.length == 1) {
              id = 607;
            } else if (flat.clientsArray.length == 2) {
              id = 608;
            }
          } else if (type == "Рассрочка") {
            if (flat.clientsArray.length == 1) {
              id = 610;
            } else if (flat.clientsArray.length == 2) {
              id = 609;
            }
          } else if (type == "Внесен задаток") {
        if (flat.clientsArray.length == 1) { //на одного клиента
         id = 634;
       }else if (flat.clientsArray.length == 2) {
        Materialize.toast("Ошибка задаток только на одного клиента", 3000)
      }
    } else {
      Materialize.toast("На тестировании", 3000);
      id = 0;
    }
  }
}

return id;
}
function getContractNumber(manager, section, number) {
  var result = "";
  var ReturnedResult = '';
  manager.name.split(" ").forEach(function(item) {
    result += item.charAt( 0 );
  });
var request = new XMLHttpRequest();
request.open('GET', '/api/data/table?t=422&where[field_value_id]=103550', false);  // `false` makes the request synchronous
request.send(null);

if (request.status === 200) {
        var dataLast = JSON.parse(request.responseText);
        ReturnedResult = dataLast[0].f1 + '-' + result + "/" + section + "/" + number;  
        if ($rootScope.newLastNumberTest) {
        $rootScope.newLastNumber = dataLast[0].f1*1+1; 
        request.open('GET', '/api/data/updateRow?r=103550&data[f1]='+$rootScope.newLastNumber, true);
        request.send(null);
        $rootScope.newLastNumberTest = false;
        }  
        return ReturnedResult;  
    }
}
flatObj.getContract = function(type) {
    
  var dataObj = {},
  result,
  now = new Date();

  var formData = new FormData();

    var flat = flatObj.getSelectedFlat();
    fillGenericFlatFields(formData, flat, type);
    //HouseData
    if ( flat.f6[0]){
      var kadastrNumber  =  flat.f6[0].f3;
      var certificateNumber = flat.f6[0].f4
      var gosReestrNumber = flat.f6[0].f5;
      var area = flat.f6[0].f6;
      var fullAddressHouse = flat.f6[0].f7;
      var fullAddressHouseReverse = flat.f6[0].f8;
      var declarationNumberAndDate = flat.f6[0].f9;
      var constructionEnd = flat.f6[0].f10;
      var commissioning = flat.f6[0].f11;
      var sectionOneEndTwoOfContract =flat.f6[0].f12;
      formData.append('data[kadastrNumber]', kadastrNumber);
      formData.append('data[certificateNumber]', certificateNumber);
      formData.append('data[gosReestrNumber]', gosReestrNumber);
      formData.append('data[area]', area);
      formData.append('data[fullAddressHouse]', fullAddressHouse);
      formData.append('data[fullAddressHouseReverse]', fullAddressHouseReverse);
      formData.append('data[declarationNumberAndDate]', declarationNumberAndDate);
      formData.append('data[constructionEnd]', constructionEnd);
      formData.append('data[commissioning]', commissioning);
      formData.append('data[sectionOneEndTwoOfContract]', sectionOneEndTwoOfContract);
      formData.append('data[PurposeOfPayment]', "авансовий  внесок"); 
   
    }
    if (flat.clientsArray) {
      var clientOne = flat.clientsArray[0];

      formData.append('data[clientOneInithials]', makeInithials(clientOne.name) || " "); 
      
      formData.append('data[clientOne]', clientOne.name || " ");
    
      formData.append('data[clientOnePassportSer]', clientOne.passportSerialKey || " ");
      formData.append('data[clientOnePassportNum]', clientOne.passportSerialNum || " ");
      formData.append('data[clientOnePassportIssued]', clientOne.whoGavePassport || " ");
      formData.append('data[clientOneAddressReg]', clientOne.registrationAddress || " ");
      if (clientOne.homeAddress) {
        formData.append('data[clientOneAddressRes]', "(фактичне місце проживання: " + clientOne.homeAddress + "),");
        formData.append('data[clientOneAddressResBot]', "фактична адреса проживання:" + clientOne.homeAddress);
      } else {
        formData.append('data[clientOneAddressRes]', "");
        formData.append('data[clientOneAddressResBot]', "фактична адреса проживання:");
      }

      formData.append('data[clientOneINN]', clientOne.INN || "");
      formData.append('data[clientOneINNOriginalName]', clientOne.f13 || "");

      //new functonality start:
      if ($rootScope.newMeterSquarePriseWithStockAndDickountReg) {
        flat.price = $rootScope.newMeterSquarePriseWithStockAndDickountReg;
        flat.totalSumm = flat.price * flat.square;
      }
      //new functonality finish:


      formData.append('data[flatRooms]', flat.room || " ");
      formData.append('data[flatAllSquare]', flat.square || " ");
      formData.append('data[flatLivingSquare]', flat.liveSquare || " ");
      formData.append('data[flatFloor]', flat.floor || " ");
      formData.append('data[flatSumm]', summRound(+flat.price).toFixed(2) || " ");

      var flatSummCursive = getGrnAndCois(flat.price);
      formData.append('data[flatSummCursiveGrn]', flatSummCursive.bills);
      formData.append('data[flatSummCursiveKop]', getKopFromSumm(flat.price));

      var flatSummAll = getGrnAndCois(summRound(flat.totalSumm));
      formData.append('data[flatSummAll]', summRound(flat.totalSumm).toFixed(2) || " ");
      formData.append('data[flatSummAllCursiveGrn]', flatSummAll.bills);
      formData.append('data[flatSummAllCursiveKop]', getKopFromSumm(flat.totalSumm));

      var flatSummPdv = getGrnAndCois(summRound(flat.price / 6));
      formData.append('data[flatSummPdv]', summRound(flat.price / 6) || " ");
      formData.append('data[flatSummPdvCursiveGrn]', flatSummPdv.bills);
      formData.append('data[flatSummPdvCursiveKop]', getKopFromSumm(summRound(flat.price / 6)));

      var flatSummAllPdv = getGrnAndCois(summRound(flat.totalSumm / 6));
      formData.append('data[flatSummAllPdv]', summRound(flat.totalSumm / 6).toFixed(2) || " ");
      formData.append('data[flatSummAllPdvCursiveGrn]', flatSummAllPdv.bills);
      formData.append('data[flatSummAllPdvCursiveKop]', getKopFromSumm(summRound(flat.totalSumm / 6)));

      formData.append('data[clientOnePhone]', clientOne.phone || " ");
      formData.append('data[clientOneMail]', clientOne.email || " ");
      formData.append('data[clientOneAddressLetter]', clientOne.homeAddress || " ");

      var dollar = $rootScope.dollar;
      formData.append('data[dollar]', dollar);
      var dollarCursive = getGrnAndCois(dollar);
      formData.append('data[dollarCursiveCursiveUsd]', dollarCursive.bills);
      formData.append('data[dollarCursiveCursiveСent]', getKopFromSumm(dollar));
      formData.append('data[dollarCursiveCursiveСentEnd]', getEndOfWordCent(getKopFromSumm(dollar)));

      formData.append('data[flatSummUsd]', summRound(flat.totalSumm / dollar));
      var flatSummUsdCursive = getGrnAndCois(summRound(flat.depositPerFlatSumm / 6));
      formData.append('data[flatSummUsdCursiveUsd]', flatSummUsdCursive.bills);
      formData.append('data[flatSummUsdCursiveСent]', getKopFromSumm(summRound(flat.totalSumm / dollar)));

      formData.append('data[flatSummUsdForMeter]', summRound(flat.price / dollar));
      var flatSummUsdForMeterCursive = getGrnAndCois(summRound(flat.price / dollar));
      formData.append('data[flatSummUsdForMeterCursiveUsd]', flatSummUsdForMeterCursive.bills);
      formData.append('data[flatSummUsdForMeterCursiveСent]', getKopFromSumm(summRound(flat.price / dollar)));

        //credit

        var priceForMeterCredit = summRound(parseFloat(flat.price) * flat.coef);
        formData.append('data[flatSummGrnForMeterCredit]', priceForMeterCredit.toFixed(2));
        var flatSummGrnForMeterCreditCursive = getGrnAndCois(priceForMeterCredit);
        formData.append('data[flatSummGrnForMeterCreditCursiveGrn]', flatSummGrnForMeterCreditCursive.bills);
        formData.append('data[flatSummGrnForMeterCreditCursiveKop]', getKopFromSumm(summRound(parseFloat(flat.price) * flat.coef)));

        formData.append('data[flatSummGrnForMeterCreditPdv]', summRound(priceForMeterCredit / 6).toFixed(2));
        var flatSummGrnForMeterCreditCursivePdv = getGrnAndCois(summRound(priceForMeterCredit / 6));
        formData.append('data[flatSummGrnForMeterCreditCursiveGrnPdv]', flatSummGrnForMeterCreditCursivePdv.bills);
        formData.append('data[flatSummGrnForMeterCreditCursiveKopPdv]', getKopFromSumm(summRound(priceForMeterCredit / 6)));

        formData.append('data[flatSummUsdForMeterCredit]', summRound(priceForMeterCredit / dollar).toFixed(2));
        var flatSummUsdForMeterCursiveCredit = getGrnAndCois(summRound(priceForMeterCredit / dollar));
        formData.append('data[flatSummUsdForMeterCursiveCreditUsd]', flatSummUsdForMeterCursiveCredit.bills);
        formData.append('data[flatSummUsdForMeterCursiveCreditСent]', getKopFromSumm(summRound(priceForMeterCredit / dollar)));
        formData.append('data[flatSummUsdForMeterCursiveCreditСentEnd]', getEndOfWordCent(getKopFromSumm(summRound(priceForMeterCredit / dollar))));

        var priceForMeterUsdCreditPdv = summRound(summRound(priceForMeterCredit / dollar) / 6);
        formData.append('data[flatSummUsdForMeterCreditPdv]', priceForMeterUsdCreditPdv.toFixed(2));
        var flatSummUsdForMeterCreditCursivePdv = getGrnAndCois(summRound(priceForMeterCredit / dollar));
        formData.append('data[flatSummUsdForMeterCursiveUsdPdv]', flatSummUsdForMeterCreditCursivePdv.bills);
        formData.append('data[flatSummUsdForMeterCursiveСentPdv]', getKopFromSumm(summRound(summRound(priceForMeterCredit / dollar) / 6)));

        var flatTotalSummCreditGrn = summRound(priceForMeterCredit * flat.square);
        formData.append('data[flatTotalSummCreditGrn]', flatTotalSummCreditGrn.toFixed(2));
        var flatTotalSummCreditGrnCursive = getGrnAndCois(flatTotalSummCreditGrn);
        formData.append('data[flatTotalSummCreditGrnCursiveGrn]', flatTotalSummCreditGrnCursive.bills);
        formData.append('data[flatTotalSummCreditGrnCursiveKop]', getKopFromSumm(summRound(priceForMeterCredit * flat.square)));

        formData.append('data[flatTotalSummCreditGrnPdv]', summRound(flatTotalSummCreditGrn / 6).toFixed(2));
        var flatTotalSummCreditGrnCursivePdv = getGrnAndCois(summRound(flatTotalSummCreditGrn / 6));
        formData.append('data[flatTotalSummCreditGrnCursiveGrnPdv]', flatTotalSummCreditGrnCursivePdv.bills);
        formData.append('data[flatTotalSummCreditGrnCursiveKopPdv]', getKopFromSumm(summRound(flatTotalSummCreditGrn / 6)));

        var flatTotalSummCreditUsd = summRound((priceForMeterCredit * flat.square) / dollar);
        formData.append('data[flatTotalSummCreditUsd]', flatTotalSummCreditUsd.toFixed(2));
        var flatTotalSummCreditUsdCursive = getGrnAndCois(flatTotalSummCreditUsd);
        formData.append('data[flatTotalSummCreditUsdCursiveUsd]', flatTotalSummCreditUsdCursive.bills);
        formData.append('data[flatTotalSummCreditUsdCursiveCent]', getKopFromSumm(flatTotalSummCreditUsd));
        formData.append('data[flatTotalSummCreditUsdCursiveCentEnd]', getEndOfWordCent(getKopFromSumm(flatTotalSummCreditUsd)));

        formData.append('data[flatTotalSummCreditUsdPdv]', summRound(flatTotalSummCreditUsd / 6).toFixed(2));
        var flatTotalSummCreditUsdCursivePdv = getGrnAndCois(summRound(flatTotalSummCreditUsd / 6));
        formData.append('data[flatTotalSummCreditUsdCursiveUsdPdv]', flatTotalSummCreditUsdCursivePdv.bills);
        formData.append('data[flatTotalSummCreditUsdCursiveCentPdv]', getKopFromSumm(summRound(flatTotalSummCreditUsd / 6)));

        var creditPlanArrayLength = 0;
        if (flat.clientsArray.length == 1) {
          var clientOneSumm = getGrnAndCois(summRound(flat.totalSumm));
          formData.append('data[clientOneSumm]', summRound(flat.totalSumm).toFixed(2) || " ");
          formData.append('data[clientOneSummCursiveGrn]', clientOneSumm.bills);
          formData.append('data[clientOneSummCursiveKop]', getKopFromSumm(summRound(flat.totalSumm)));
          var clientOneSummPdv = getGrnAndCois(summRound(flat.totalSumm / 6));
          formData.append('data[clientOneSummPdv]', summRound(flat.totalSumm / 6).toFixed(2));
          formData.append('data[clientOneSummPdvCursiveGrn]', flatSummAllPdv.bills);
          formData.append('data[clientOneSummPdvCursiveKop]', getKopFromSumm(summRound(flat.totalSumm / 6)));

          formData.append('data[flatSummGrn]', flat.totalSumm);
          var flatSummGrnCursive = getGrnAndCois(summRound(flat.totalSumm));
          formData.append('data[flatSummGrnCursiveGrn]', flatSummGrnCursive.bills);
          formData.append('data[flatSummGrnCursiveKop]', getKopFromSumm(summRound(flat.totalSumm)));

          // Deposit
          if (type == "Внесен задаток") {
            // entranceSummGrn

            formData.append('data[entranceSummGrn]', summRound(flat.depositPerFlatSumm).toFixed(2));
            formData.append('data[clientOnePaymentSumm]', summRound(flat.depositPerFlatSumm).toFixed(2));
            var entranceSumm = getGrnAndCois(summRound(flat.depositPerFlatSumm));
            formData.append('data[entranceSummCursiveGrn]', entranceSumm.bills);
            formData.append('data[entranceSummCursiveKop]', getKopFromSumm(summRound(flat.depositPerFlatSumm)));

            // entranceSummPdvGrn
            formData.append('data[entranceSummPdvGrn]', summRound(flat.depositPerFlatSumm / 6));
            var entranceSummPdv = getGrnAndCois(summRound(flat.depositPerFlatSumm / 6));
            formData.append('data[entranceSummPdvCursiveGrn]', entranceSummPdv.bills);
            formData.append('data[entranceSummPdvCursiveKop]', getKopFromSumm(summRound(flat.depositPerFlatSumm / 6)));


            // flatHouse
            if ( flat.f6[0] && flat.f6[0].f2 == "Петровская") {

              formData.append('data[houseStreetName]', "Петрівська");


            } else if (flat.f6[0].f2 == "Белогородская") {
              formData.append('data[houseStreetName]', "Белогородська");
            }

            if(flat.f11 == "Квартира" || flat.f11 == "квартира") {
              formData.append('data[flatType]', "квартира");
            } else {
              formData.append('data[flatType]', "офис");
            }
          }

          //credit one client
          if (flat.firstMinPaymentSumm > 1) {
            // set length for planning operation list its depends for clients array
            if (flat.creditPlanArray && flat.creditPlanArray.length > 0) {
              creditPlanArrayLength = flat.creditPlanArray.length;/* / 2;*/
            }

            var firstPaymentSummGrn = flat.firstMinPaymentSumm;
            formData.append('data[clientFirstPaymentSummGrn]', summRound(firstPaymentSummGrn).toFixed(2));
            var firstPaymentSummGrnCursive = getGrnAndCois(summRound(firstPaymentSummGrn));
            formData.append('data[firstPaymentSummGrnCursiveGrn]', firstPaymentSummGrnCursive.bills);
            formData.append('data[firstPaymentSummGrnCursiveKop]', getKopFromSumm(summRound(firstPaymentSummGrn)));

            formData.append('data[clientFirstPaymentSummGrnPdv]', summRound(firstPaymentSummGrn / 6).toFixed(2));
            var firstPaymentSummGrnCursivePdv = getGrnAndCois(summRound(firstPaymentSummGrn / 6));
            formData.append('data[firstPaymentSummGrnCursiveGrnPdv]', firstPaymentSummGrnCursivePdv.bills);
            formData.append('data[firstPaymentSummGrnCursiveKopPdv]', getKopFromSumm(summRound(firstPaymentSummGrn / 6)));

            var residueTotalSummGrn = summRound(flatTotalSummCreditGrn - flat.firstMinPaymentSumm);
            formData.append('data[clientOneSummSecondPart]', residueTotalSummGrn.toFixed(2));
            var clientOneSummSecondPartCursive = getGrnAndCois(residueTotalSummGrn);
            formData.append('data[clientOneSummSecondPartCursiveGrn]', clientOneSummSecondPartCursive.bills);
            formData.append('data[clientOneSummSecondPartCursiveKop]', getKopFromSumm(residueTotalSummGrn));

            formData.append('data[clientOneSummSecondPartPdv]', summRound(residueTotalSummGrn / 6));
            var clientOneSummSecondPartCursivePdv = getGrnAndCois(summRound(residueTotalSummGrn / 6));
            formData.append('data[clientOneSummSecondPartPdvCursiveGrn]', clientOneSummSecondPartCursivePdv.bills);
            formData.append('data[clientOneSummSecondPartPdvCursiveKop]', getKopFromSumm(summRound(residueTotalSummGrn / 6)));

            // clientOneLastFeeSummDate clientOneLastFeeSummMonth clientOneLastFeeSummYear
          }
        }

        if (flat.clientsArray.length == 2) {
          var clientSumm = summRound(flat.totalSumm / 2),
          clientSummPdv = summRound(clientSumm / 6);
          var clientOneSumm = getGrnAndCois(clientSumm);
          formData.append('data[clientOneSumm]', clientSumm || " ");
          formData.append('data[clientOneSummCursiveGrn]', clientOneSumm.bills);
          formData.append('data[clientOneSummCursiveKop]', getKopFromSumm(clientSumm));
          var clientOneSummPdv = getGrnAndCois(clientSummPdv);
          formData.append('data[clientOneSummPdv]', clientSummPdv || "");
          formData.append('data[clientOneSummPdvCursiveGrn]', clientOneSummPdv.bills);
          formData.append('data[clientOneSummPdvCursiveKop]', getKopFromSumm(clientSummPdv));

          var clientTwoSumm = getGrnAndCois(clientSumm);
     
          formData.append('data[clientTwoSumm]', clientSumm || " ");
          formData.append('data[clientTwoSummCursiveGrn]', clientTwoSumm.bills);
          formData.append('data[clientTwoSummCursiveKop]', getKopFromSumm(clientSumm));

          var clientTwoSummPdv = getGrnAndCois(clientSummPdv);
          formData.append('data[clientTwoSummPdv]', clientSummPdv);
          formData.append('data[clientTwoSummPdvCursiveGrn]', clientTwoSummPdv.bills);
          formData.append('data[clientTwoSummPdvCursiveKop]', getKopFromSumm(clientSummPdv));

          var clientTwo = flat.clientsArray[1];
          formData.append('data[clientTwoInithials]', makeInithials(clientTwo.name) || " "); 
          formData.append('data[clientTwo]', clientTwo.name || " ");
          formData.append('data[clientTwoPassportSer]', clientTwo.passportSerialKey || " ");
          formData.append('data[clientTwoPassportNum]', clientTwo.passportSerialNum || " ");
          formData.append('data[clientTwoPassportIssued]', clientTwo.whoGavePassport || " ");
          formData.append('data[clientTwoAddressReg]', clientTwo.registrationAddress || " ");
          if (clientTwo.homeAddress) {
            formData.append('data[clientTwoAddressRes]', "(фактичне місце проживання: " + clientTwo.homeAddress + "),");
            formData.append('data[clientTwoAddressResBot]', "фактична адреса проживання:" + clientTwo.homeAddress);
          } else {
            formData.append('data[clientTwoAddressRes]', "");
            formData.append('data[clientTwoAddressResBot]', "фактична адреса проживання:");
          }
          formData.append('data[clientTwoINN]', clientTwo.INN || "");
          formData.append('data[clientTwoINNOriginalName]', clientTwo.f13 || "");

          formData.append('data[clientTwoPhone]', clientTwo.phone || " ");
          formData.append('data[clientTwoMail]', clientTwo.email || " ");
          formData.append('data[clientTwoAddressLetter]', clientTwo.homeAddress || " ");

          //credit two clients
          if (flat.firstMinPaymentSumm > 1) {
            // set length for planning operation list its depends for clients array
            if (flat.creditPlanArray && flat.creditPlanArray.length > 0) {
              creditPlanArrayLength = flat.creditPlanArray.length;
            }

            var firstPaymentSummGrn = summRound(flat.firstMinPaymentSumm / 2);
            formData.append('data[clientOneFirstPaymentSummGrn]', firstPaymentSummGrn.toFixed(2));
            //first client
            var clientOneFirstPaymentSummGrnCursive = getGrnAndCois(firstPaymentSummGrn);
            formData.append('data[clientOneFirstPaymentSummGrnCursiveGrn]', clientOneFirstPaymentSummGrnCursive.bills);
            formData.append('data[clientOneFirstPaymentSummGrnCursiveKop]', getKopFromSumm(firstPaymentSummGrn));

            formData.append('data[clientOneFirstPaymentSummGrnPdv]', summRound(firstPaymentSummGrn / 6).toFixed(2));
            var clientOneFirstPaymentSummGrnCursivePdv = getGrnAndCois(summRound(firstPaymentSummGrn / 6));
            formData.append('data[clientOneFirstPaymentSummGrnCursiveGrnPdv]', clientOneFirstPaymentSummGrnCursivePdv.bills);
            formData.append('data[clientOneFirstPaymentSummGrnCursiveKopPdv]', getKopFromSumm(summRound(firstPaymentSummGrn / 6)));

            var clientOneResidueTotalSummGrn = summRound(summRound(flatTotalSummCreditGrn / 2) - firstPaymentSummGrn);
            formData.append('data[clientOneSummSecondPartCredit]', clientOneResidueTotalSummGrn.toFixed(2));
            var clientOneSummSecondPartCursive = getGrnAndCois(clientOneResidueTotalSummGrn);
            formData.append('data[clientOneSummSecondPartCursiveGrn]', clientOneSummSecondPartCursive.bills);
            formData.append('data[clientOneSummSecondPartCursiveKop]', getKopFromSumm(clientOneResidueTotalSummGrn));

            formData.append('data[clientOneSummSecondPartPdv]', summRound(clientOneResidueTotalSummGrn / 6));
            var clientOneSummSecondPartCursivePdv = getGrnAndCois(summRound(clientOneResidueTotalSummGrn / 6));
            formData.append('data[clientOneSummSecondPartPdvCursiveGrn]', clientOneSummSecondPartCursivePdv.bills);
            formData.append('data[clientOneSummSecondPartPdvCursiveKop]', getKopFromSumm(summRound(clientOneResidueTotalSummGrn / 6)));

            //second client
            formData.append('data[clientTwoFirstPaymentSummGrn]', firstPaymentSummGrn.toFixed(2));
            var clientTwoFirstPaymentSummGrnCursive = getGrnAndCois(firstPaymentSummGrn);
            formData.append('data[clientTwoFirstPaymentSummGrnCursiveGrn]', clientTwoFirstPaymentSummGrnCursive.bills);
            formData.append('data[clientTwoFirstPaymentSummGrnCursiveKop]', clientTwoFirstPaymentSummGrnCursive.coins);

            formData.append('data[clientTwoFirstPaymentSummGrnPdv]', summRound(firstPaymentSummGrn / 6).toFixed(2));
            var clientTwoFirstPaymentSummGrnCursivePdv = getGrnAndCois(summRound(firstPaymentSummGrn / 6));
            formData.append('data[clientTwoFirstPaymentSummGrnCursiveGrnPdv]', clientTwoFirstPaymentSummGrnCursivePdv.bills);
            formData.append('data[clientTwoFirstPaymentSummGrnCursiveKopPdv]', getKopFromSumm( summRound(firstPaymentSummGrn / 6)));

            var clientTwoResidueTotalSummGrn = summRound(summRound(flatTotalSummCreditGrn / 2) - firstPaymentSummGrn);
            formData.append('data[clientTwoSummSecondPartCredit]', clientTwoResidueTotalSummGrn.toFixed(2));
            var clientTwoSummSecondPartCursive = getGrnAndCois(clientTwoResidueTotalSummGrn);
            formData.append('data[clientTwoSummSecondPartCursiveGrn]', clientTwoSummSecondPartCursive.bills);
            formData.append('data[clientTwoSummSecondPartCursiveKop]', getKopFromSumm(clientTwoResidueTotalSummGrn));

            formData.append('data[clientTwoSummSecondPartPdv]', summRound(clientTwoResidueTotalSummGrn / 6));
            var clientTwoSummSecondPartCursivePdv = getGrnAndCois(summRound(clientTwoResidueTotalSummGrn / 6));
            formData.append('data[clientTwoSummSecondPartPdvCursiveGrn]', clientTwoSummSecondPartCursivePdv.bills);
            formData.append('data[clientTwoSummSecondPartPdvCursiveKop]', getKopFromSumm(summRound(clientTwoResidueTotalSummGrn / 6)));
          }
        }

        // creating credit operation list
        if (flat.creditPlanArray && creditPlanArrayLength > 0) {
          var lastCredit = flat.creditPlanArray[creditPlanArrayLength - 1];
          var date = lastCredit.date.split("-");
          formData.append('data[clientOneLastFeeSummDate]', date[0]);
          formData.append('data[clientOneLastFeeSummMonth]', month[date[1] -1]);
          formData.append('data[clientOneLastFeeSummYear]', date[2]);

          var creditOperationList = "",
          creditResidueTotalSummGrn = 0,
          creditResidueTotalSummUsd = 0;

          for (var i = 0; i < creditPlanArrayLength; i++) {

            var monthNumber = flat.creditPlanArray[i].date.split("-")[1];
            if(monthNumber.indexOf('0') == 0){
              +monthNumber.replace('0','');
            }
            creditOperationList += "<tr><td>" + (1+i) + " внесок</td>";
            creditOperationList += "<td>" + flat.creditPlanArray[i].summ.toFixed(2) + "</td>";
            creditResidueTotalSummGrn += flat.creditPlanArray[i].summ;
            creditOperationList += "<td>" + summRound(flat.creditPlanArray[i].summ / dollar).toFixed(2) + "</td>";
            creditResidueTotalSummUsd += summRound(flat.creditPlanArray[i].summ / dollar);
            var oneDate = lastCredit.date.split("-");
            creditOperationList += "<td>" + oneDate[0] + " " + month[monthNumber-1]+ " " + oneDate[2] + " року</td>";
            creditOperationList += "</tr>";
          }
          creditOperationList += "<tr><td> Всього </td><td>"+ creditResidueTotalSummGrn.toFixed(2) +"</td><td>" + creditResidueTotalSummUsd.toFixed(2)  +"</td><td></td></tr>"
          formData.append('data[creditOperationList]', creditOperationList);
        }
        // formData.append('data[flatSummUsd]', clientOne.homeAddress || " ");
      }

      var res = 'contract';

      var deposit = flatObj.checkIfFlatHasDeposit(flat);
      formData.append('options','{"border":{"top":"10mm"}}');

      if (deposit && deposit.f1 == "Внесен задаток" && deposit.f9 && deposit.f6 == "Оплачено") {
        $rootScope.ifCustomerPayedDeposit = true;
        var depositSummGrn = summRound(deposit.f21);
        formData.append('data[depositSummGrn]', depositSummGrn.toFixed(2));
        formData.append('data[depositSummCursiveGrn]', getGrnAndCois(depositSummGrn).bills);
        formData.append('data[depositSummCursiveKop]', getKopFromSumm(depositSummGrn));
        if (flat.clientsArray.length == 1) {
          var clientOneSummMinusDeposit = getGrnAndCois(summRound(flat.totalSumm - depositSummGrn));
          formData.append('data[clientOneSummMinusDeposit]', summRound(flat.totalSumm-depositSummGrn).toFixed(2));
          formData.append('data[clientOneSummMinusDepositCursiveGrn]', clientOneSummMinusDeposit.bills);
          formData.append('data[clientOneSummMinusDepositCursiveKop]', getKopFromSumm(summRound(flat.totalSumm-depositSummGrn)));
          var clientOneSummMinusDepositPdv = getGrnAndCois(summRound((flat.totalSumm-depositSummGrn) / 6));
          formData.append('data[clientOneSummMinusDepositPdv]', summRound((flat.totalSumm-depositSummGrn) / 6).toFixed(2));
          formData.append('data[clientOneSummMinusDepositPdvCursiveGrn]', clientOneSummMinusDepositPdv.bills);
          formData.append('data[clientOneSummMinusDepositPdvCursiveKop]', getKopFromSumm(summRound((flat.totalSumm-depositSummGrn) / 6)));
          if (flat.firstMinPaymentSumm > 1) {
            // set length for planning operation list its depends for clients array
            // if (flat.creditPlanArray && flat.creditPlanArray.length > 0) {
            //   creditPlanArrayLength = flat.creditPlanArray.length / 2;
            // }

            var firstPaymentSummMinusDepositGrn = flat.firstMinPaymentSumm-depositSummGrn;
            formData.append('data[clientFirstPaymentSummMinusDepositGrn]', summRound(firstPaymentSummMinusDepositGrn).toFixed(2));
            var firstPaymentSummMinusDepositGrnCursive = getGrnAndCois(summRound(firstPaymentSummMinusDepositGrn));
            formData.append('data[firstPaymentSummMinusDepositGrnCursiveGrn]', firstPaymentSummMinusDepositGrnCursive.bills);
            formData.append('data[firstPaymentSummMinusDepositGrnCursiveKop]', getKopFromSumm(summRound(firstPaymentSummMinusDepositGrn)));

            formData.append('data[clientFirstPaymentSummMinusDepositGrnPdv]', summRound(firstPaymentSummMinusDepositGrn/ 6).toFixed(2));
            var firstPaymentSummMinusDepositGrnCursivePdv = getGrnAndCois(summRound(firstPaymentSummMinusDepositGrn / 6));
            formData.append('data[firstPaymentSummMinusDepositCurciveGrnPdv]', firstPaymentSummMinusDepositGrnCursivePdv.bills);
            formData.append('data[firstPaymentSummMinusDepositGrnCursiveKopPdv]', getKopFromSumm(summRound(firstPaymentSummMinusDepositGrn  / 6)));

            var residueTotalSummGrn = summRound(flatTotalSummCreditGrn - flat.firstMinPaymentSumm);
            formData.append('data[clientOneSummSecondPart]', residueTotalSummGrn.toFixed(2));
            var clientOneSummSecondPartCursive = getGrnAndCois(residueTotalSummGrn);
            formData.append('data[clientOneSummSecondPartCursiveGrn]', clientOneSummSecondPartCursive.bills);
            formData.append('data[clientOneSummSecondPartCursiveKop]', getKopFromSumm(residueTotalSummGrn));

            formData.append('data[clientOneSummSecondPartPdv]', summRound(residueTotalSummGrn / 6));
            var clientOneSummSecondPartCursivePdv = getGrnAndCois(summRound(residueTotalSummGrn / 6));
            formData.append('data[clientOneSummSecondPartPdvCursiveGrn]', clientOneSummSecondPartCursivePdv.bills);
            formData.append('data[clientOneSummSecondPartPdvCursiveKop]', getKopFromSumm(summRound(residueTotalSummGrn / 6)));

            // clientOneLastFeeSummDate clientOneLastFeeSummMonth clientOneLastFeeSummYear
          }
        }
        if (flat.clientsArray.length == 2) {
          var clientOneSummMinusDeposit = getGrnAndCois(summRound((flat.totalSumm/2) - depositSummGrn));
          formData.append('data[clientOneSummMinusDeposit]', summRound((flat.totalSumm/2)-depositSummGrn).toFixed(2));
          formData.append('data[clientOneSummMinusDepositCursiveGrn]', clientOneSummMinusDeposit.bills);
          formData.append('data[clientOneSummMinusDepositCursiveKop]', getKopFromSumm(summRound((flat.totalSumm/2)-depositSummGrn)));
          var clientOneSummMinusDepositPdv = getGrnAndCois(summRound(((flat.totalSumm/2)-depositSummGrn) / 6));
          formData.append('data[clientOneSummMinusDepositPdv]', summRound(((flat.totalSumm/2)-depositSummGrn) / 6).toFixed(2));
          formData.append('data[clientOneSummMinusDepositPdvCursiveGrn]', clientOneSummMinusDepositPdv.bills);
          formData.append('data[clientOneSummMinusDepositPdvCursiveKop]', getKopFromSumm(summRound(((flat.totalSumm/2)-depositSummGrn) / 6)));

          var clientTwoSummMinusDeposit = getGrnAndCois(summRound(flat.totalSumm/2));
          formData.append('data[clientTwoSummMinusDeposit]', summRound(flat.totalSumm/2).toFixed(2));
          formData.append('data[clientTwoSummMinusDepositCursiveGrn]', clientTwoSummMinusDeposit.bills);
          formData.append('data[clientTwoSummMinusDepositCursiveKop]', getKopFromSumm(summRound(flat.totalSumm/2)));
          var clientTwoSummMinusDepositPdv = getGrnAndCois(summRound((flat.totalSumm/2) / 6));
          formData.append('data[clientTwoSummMinusDepositPdv]', summRound((flat.totalSumm/2) / 6).toFixed(2));
          formData.append('data[clientTwoSummMinusDepositPdvCursiveGrn]', clientTwoSummMinusDepositPdv.bills);
          formData.append('data[clientTwoSummMinusDepositPdvCursiveKop]', getKopFromSumm(summRound((flat.totalSumm/2) / 6)));
          //рассрочка на 2 клиента + задаток
          if (flat.firstMinPaymentSumm > 1) {
            // set length for planning operation list its depends for clients array
            if (flat.creditPlanArray && flat.creditPlanArray.length > 0) {
              creditPlanArrayLength = flat.creditPlanArray.length;
            }

            var firstPaymentSummGrn = summRound(flat.firstMinPaymentSumm / 2);
            formData.append('data[clientOneFirstPaymentSummMinusDepositGrn]', summRound(firstPaymentSummGrn-depositSummGrn).toFixed(2));
            //first client
            var clientOneFirstPaymentSummMinusDepositCursiveGrn = getGrnAndCois(summRound(firstPaymentSummGrn-depositSummGrn));
            formData.append('data[clientOneFirstPaymentSummMinusDepositCursiveGrn]', clientOneFirstPaymentSummMinusDepositCursiveGrn.bills);
            formData.append('data[clientOneFirstPaymentSummMinusDepositCursiveKop]', getKopFromSumm(summRound(firstPaymentSummGrn-depositSummGrn)));

            formData.append('data[clientOneFirstPaymentSummMinusDepositGrnPdv]', summRound(summRound(firstPaymentSummGrn-depositSummGrn) / 6).toFixed(2));
            var clientOneFirstPaymentSummGrnCursivePdv = getGrnAndCois(summRound(summRound(firstPaymentSummGrn-depositSummGrn) / 6));
            formData.append('data[clientOneFirstPaymentSummMinusDepositCursiveGrnPdv]', clientOneFirstPaymentSummGrnCursivePdv.bills);
            formData.append('data[clientOneFirstPaymentSummMinusDepositCursiveKopPdv]', getKopFromSumm(summRound(summRound(firstPaymentSummGrn-depositSummGrn) / 6)));

            var clientOneResidueTotalSummGrn = summRound(summRound(flatTotalSummCreditGrn / 2) - firstPaymentSummGrn);
            formData.append('data[clientOneSummSecondPartCredit]', clientOneResidueTotalSummGrn.toFixed(2));
            var clientOneSummSecondPartCursive = getGrnAndCois(clientOneResidueTotalSummGrn);
            formData.append('data[clientOneSummSecondPartCursiveGrn]', clientOneSummSecondPartCursive.bills);
            formData.append('data[clientOneSummSecondPartCursiveKop]', getKopFromSumm(clientOneResidueTotalSummGrn));

            formData.append('data[clientOneSummSecondPartPdv]', summRound(clientOneResidueTotalSummGrn / 6));
            var clientOneSummSecondPartCursivePdv = getGrnAndCois(summRound(clientOneResidueTotalSummGrn / 6));
            formData.append('data[clientOneSummSecondPartPdvCursiveGrn]', clientOneSummSecondPartCursivePdv.bills);
            formData.append('data[clientOneSummSecondPartPdvCursiveKop]', getKopFromSumm(summRound(clientOneResidueTotalSummGrn / 6)));

            //second client
            formData.append('data[clientTwoFirstPaymentSummGrn]', firstPaymentSummGrn.toFixed(2));
            var clientTwoFirstPaymentSummGrnCursive = getGrnAndCois(firstPaymentSummGrn);
            formData.append('data[clientTwoFirstPaymentSummGrnCursiveGrn]', clientTwoFirstPaymentSummGrnCursive.bills);
            formData.append('data[clientTwoFirstPaymentSummGrnCursiveKop]', clientTwoFirstPaymentSummGrnCursive.coins);

            formData.append('data[clientTwoFirstPaymentSummGrnPdv]', summRound(firstPaymentSummGrn / 6).toFixed(2));
            var clientTwoFirstPaymentSummGrnCursivePdv = getGrnAndCois(summRound(firstPaymentSummGrn / 6));
            formData.append('data[clientTwoFirstPaymentSummGrnCursiveGrnPdv]', clientTwoFirstPaymentSummGrnCursivePdv.bills);
            formData.append('data[clientTwoFirstPaymentSummGrnCursiveKopPdv]', getKopFromSumm( summRound(firstPaymentSummGrn / 6)));

            var clientTwoResidueTotalSummGrn = summRound(summRound(flatTotalSummCreditGrn / 2) - firstPaymentSummGrn);
            formData.append('data[clientTwoSummSecondPartCredit]', clientTwoResidueTotalSummGrn.toFixed(2));
            var clientTwoSummSecondPartCursive = getGrnAndCois(clientTwoResidueTotalSummGrn);
            formData.append('data[clientTwoSummSecondPartCursiveGrn]', clientTwoSummSecondPartCursive.bills);
            formData.append('data[clientTwoSummSecondPartCursiveKop]', getKopFromSumm(clientTwoResidueTotalSummGrn));

            formData.append('data[clientTwoSummSecondPartPdv]', summRound(clientTwoResidueTotalSummGrn / 6));
            var clientTwoSummSecondPartCursivePdv = getGrnAndCois(summRound(clientTwoResidueTotalSummGrn / 6));
            formData.append('data[clientTwoSummSecondPartPdvCursiveGrn]', clientTwoSummSecondPartCursivePdv.bills);
            formData.append('data[clientTwoSummSecondPartPdvCursiveKop]', getKopFromSumm(summRound(clientTwoResidueTotalSummGrn / 6)));
          }
        }

        // formData.append('data[entranceSummGrn]', deposit.f21);
        $.ajax({
          url:'/api/data/tableRows?r='+deposit.f9.replace(/[|,]/g, ""),
          method:'GET',
          async:false
        }).success(function(data) {

          var depositDataFromBank = JSON.parse(data);
          var depositDataFromBankNumber = depositDataFromBank[0].f1;
          var depositDataFromBankDate = depositDataFromBank[0].f2.split('-');
            // numOrdering
            formData.append('data[numOrdering]', depositDataFromBankNumber);
            formData.append('data[numOrderingDate]', depositDataFromBankDate[2]);
            formData.append('data[numOrderingMonth]', depositDataFromBankDate[1]);
            formData.append('data[numOrderingYear]', depositDataFromBankDate[0]);
            console.log(data,"data1");
            
            ajaxPost('/api/other/pdf_from_snippet', formData, false, function(data) {
              res = data;
              
              console.log(data, "dataaaa");
            });
          });


      } else {
        
        ajaxPost('/api/other/pdf_from_snippet', formData, false, function(data) {
          res = data;
          
          console.log(data, "dataaaa");
        });
      }


      if (type == "Продано" || type == "Внесен задаток" || type == "Рассрочка") {
        console.log(flatObj.getSelectedFlat(),'type');

        return res;
      } else if(type) {
        return 'contract1';
      } else {
        return 'contract2';
      }

    }

    //Work with operation table
    flatObj.addOperationToOperationTable = function(type, summ, dollar, operationBlockId, datePickerId,clientFIO) {
      var newOperationId = null,
      date;
      if(operationBlockId && datePickerId) {
        date = flatObj.getDatapickerValueInMySqlFormat(operationBlockId, datePickerId);
      } else {
        date = flatObj.getCurrentDateToMySqlFormat();
      }
      var dollar = $rootScope.dollar;

      //TODO: Add dollar course

      if(type && summ >= 0 && date && getClientsIdFromSelectedClientsArrayInScope() != null) {
        var payer;
		if(clientFIO){
			payer = clientFIO;
		}else{
			payer ='';
		}
        var newOperationObj = {
          'f1':   type,
          'f2':   date,
          'f3':   getUserInfo().field_value_id,
          'f21':  summ,
          'f7' :  $rootScope.selectedFlat.price,
          'f8' :  getContractNumber(getUserInfo(), $rootScope.selectedFlat.section, $rootScope.selectedFlat.f1),
          'f4':   getClientsIdFromSelectedClientsArrayInScope(),
          'f5':   flatObj.getContract(type),
          'f6':   'Ожидаем',
          'f23':  dollar,
          'f10':payer
        }

        newOperationId = flatObj.dataAdd(295, newOperationObj);
        console.log("new operation added");
      } else {
        Materialize.toast("Ошибка. Необходимо выбрать дату");
      }
      return newOperationId;
    }
    //!!!Work with operation table!!!
    //Work with planning operation table
    flatObj.addPlanningOperationToPlanningOparationTable = function(summ, date, clientId) {
      var newPlanningOperationId = null;

      var clientFIO = getClientById(clientId);
      if (date && summ > 0 && clientId) {
        var newPlanningOperationObj = {
          'f1' : date,
          'f2' : summ,
          'f3' : "Ожидаем",
          'f4' : clientFIO

        }
        newPlanningOperationId = flatObj.dataAdd(297, newPlanningOperationObj);
        console.log("newPlanningOperationId", newPlanningOperationId);
      } else {
        Materialize.toast("Can't add new planning operation", 5000);
      }
      return newPlanningOperationId;
    }
    //Work with planning operation table

    flatObj.setClientsByLastOperationToScope = function(lastOperation) {
      if(lastOperation && (lastOperation.f1 !== "Отмена брони" && lastOperation.f1 !== "Отмена задатка" &&
        lastOperation.f1 !== "Возврат средств") && lastOperation.f4) {
        var clientsId = [];
      lastOperation.f4.indexOf('|') > -1 ? clientsId = lastOperation.f4.match(/\d+/g) : clientsId.push(lastOperation.f4);
      if(clientsId && clientsId.length) {
        clientsId.forEach(function(clientId) {
          $http.get('/api/data/tableRows?r=' + clientId)
          .success(function(data) {
            if (data) {
              if(data[0].photo.indexOf('|') > -1) {
                data[0].photo = data[0].photo.replace(/[|,]/g, "");
              }
              $rootScope.selectedFlat.clientsArray.push(data[0]);
            }
          });
        });
      }
    }
  }
  flatObj.rewriteSelectedFlatAndImportantField = function(flatId) {
    $http.get('/api/data/tableRows?r=' + flatId)
    .success(function(flat) {
      if (flat) {

        //console.log($rootScope.creditMonth);
        var clientsForPlannedOperationView =$rootScope.selectedFlat.clientsArray
        $rootScope.selectedFlat = flat[0];
        $rootScope.selectedFlat.clientsArray = [];
        $rootScope.selectedFlat.historyList = [];
        $rootScope.selectedFlat.paymentList = [];
        var lastOperation = flatObj.getLastOperationByFlat($rootScope.selectedFlat);
        if(lastOperation) {
          lastOperation.f4 = lastOperation.client;
          lastOperation.f1 = lastOperation.type;
          lastOperation.f2 = flatObj.toTrueFormat(lastOperation.date);
        }
        if($rootScope.creditMonth === 6){
         $rootScope.selectedFlat.totalSumm = summRound(parseFloat($rootScope.selectedFlat.price) * parseFloat($rootScope.selectedFlat.square)*1.03);
       }else if($rootScope.creditMonth === 12){
        $rootScope.selectedFlat.totalSumm = summRound(parseFloat($rootScope.selectedFlat.price) * parseFloat($rootScope.selectedFlat.square)*1.06);
      }else{
        $rootScope.selectedFlat.totalSumm = summRound(parseFloat($rootScope.selectedFlat.price) * parseFloat($rootScope.selectedFlat.square));
      }
      $rootScope.selectedFlat.lastOperation = lastOperation;
      flatObj.setClientsByLastOperationToScope(lastOperation);

      $rootScope.selectedFlat.historyList = flat[0].f8;
      if(flat[0].f8 && flat[0].f8.length > 0) {
        $rootScope.selectedFlat.historyList.forEach(function(item) {
          item.f21 = item.summ;
          item.f1 = item.type;
        })
      }
      $rootScope.selectedFlat.paymentList = flat[0].f9;
      if(flat[0].f9 && flat[0].f9.length > 0) {
        $rootScope.selectedFlat.paymentList.forEach(function(item) {
         	item.f1 = item.date;
         	item.f2 = item.summ;
         	item.f3 = item.status;
         	item.f4 = item.client
   //       	clientsForPlannedOperationView.forEach(function(client){
			// 	if(item.client == client.field_value_id){
			// 		item.f5 = client.name;
			// 	}
			// });
        })
      }
      if (getUserInfo()) {
        $rootScope.selectedFlat.manager = getUserInfo();
      }
      flatObj.setSelectedFlat($rootScope.selectedFlat);

        console.log($rootScope.selectedFlat);
        $http.get('/api/data/updateRow?r=' + $rootScope.selectedFlat.field_value_id+"&data[f14]="+getUserInfo().name).success();
      }
    });
  }
  flatObj.countFlatResidue = function(flatTotalSumm, inputSumm) {
    if (flatTotalSumm > 0 && inputSumm > 0) {
      if(flatTotalSumm > inputSumm) {
        return flatTotalSumm - inputSumm;
      } else if (flatTotalSumm === inputSumm) {
          /// Call sell flat function
          return 0;
        } else {
          Materialize.toast("Сумма не может быть больше стоимости квартиры", 3000);
          return null;
        }
      } else {
        Materialize.toast("Неверно введена сумма", 3000);
        return null;
      }
    }

    flatObj.getDollar = function(callback) {
      var dollar = 0;
      $http.get('/api/data/table?t=385')
      .success(function(data){
        callback(data);
      });
    }
    flatObj.checkIfFlatHasDeposit = function(selectedFlat) {
      var returnedOperation = null;
      if (selectedFlat && selectedFlat.f8 && selectedFlat.f8.length > 0 && selectedFlat.clientsArray && selectedFlat.clientsArray.length > 0) {
        selectedFlat.f8.forEach(function(operation) {
          if (operation.f1 == "Внесен задаток") {
            if (selectedFlat.clientsArray.length == 1) {
              if (operation.f4 && operation.f4.match(/\d+/g)[0] == selectedFlat.clientsArray[0].field_value_id) {
                returnedOperation = operation;
              } else {
                returnedOperation = null;
              }
            } else if (selectedFlat.clientsArray.length == 2) {
              selectedFlat.clientsArray.forEach(function(client) {
                if (operation.f4.match(/\d+/g)[0] == selectedFlat.clientsArray[0].field_value_id) {
                  returnedOperation = operation;
                } else {
                  returnedOperation = null;
                }
              })
            } else {
              returnedOperation = null;
            }
          }
        })
      }
      return returnedOperation;
    }
    flatObj.getFlatClass = function(sFlat) {
        if (sFlat.f16){
            /*18.06.2016*/

            if(sqlDateNow > sFlat.f16) {

                return "flat-is-overdue"
            }
        }


        if(sFlat.f8 && sFlat.f8.length > 0) {
            var lastOperation = sFlat.f8[sFlat.f8.length -1];
            if(lastOperation.f1 === "Доплата по рассрочке") {
              return "flat-is-surcharge-for-installment";
        } else if(lastOperation.f1 === "Забронировано") {
              // if(lastOperation.date && new Date(lastOperation.date) < new Date()) {
              //     return "flat-is-free";
              // } else {{testImg}
              return "flat-is-booked";
              // }
            } else if(lastOperation.f1 === "Внесен задаток") {
              console.log(lastOperation, "Deposit");
              // return "flat-is-introduced-a-deposit";
              // // TODO: забрати це, як полагодятья планові платежі
              // if(sFlat.f9 == undefined) return "flat-is-free";
              // if(new Date(sFlat.f9[sFlat.f9.length-1].date) > new Date()) {
                return "flat-is-introduced-a-deposit";
              // } else {
                  // return "flat-is-introduced-a-deposit-lated";
              // }

            } else if(lastOperation.f1 === "Рассрочка") {
              return "flat-in-installments";
            } else if(lastOperation.f1 === "Продано") {
              return "flat-is-sold";
            } else {
              return "flat-is-free";
            }
          } else {
            return "flat-is-free";
          }
        }


        return flatObj;
      }])
.factory('ClientsFactory', ['$rootScope', '$http', function($rootScope, $http) {
  var clientsObj = {};

  clientsObj.getClients = function(callback) {
    var clients = [];
    $http.get('/api/data/table?t=296')
    .success(function(data) {
      for(var i = data.length - 1; i >= 0; i--) {
        if(data[i].photo){
          data[i].photo = data[i].photo.indexOf('|') > -1 ? data[i].photo.replace(/[|,]/g, "") : data[i].photo;
        }
      }
      callback(data);
    })
  }

  return clientsObj;
}])
.controller('FlatsCtrl', ['$scope', '$rootScope', '$http', 'FlatsFactory', 'ClientsFactory',
  function($scope, $rootScope, $http, FlatsFactory, ClientsFactory) {
 
//do not delete;
// $http.get('/api/data/table?t=273')
//     .success(function(data){
//       var flats =data;
//       var flatsLength = data.length;
//       var petrovskogo1Length = petrovskogo1.length
//     first:  for(var i = 0; i < flatsLength; i++ ){
//     second:  	for(var j = 0; j < petrovskogo1Length; j++ ){
//       			//debugger;
//         			if(flats[i] && flats[i].f1 == petrovskogo1[j].number){
//           				if(flats[i].floor == petrovskogo1[j].floor && flats[i].room == petrovskogo1[j].rooms && flats[i].section== petrovskogo1[j].section && flats[i].square == petrovskogo1[j].square && flats[i].liveSquare == petrovskogo1[j].squarelive){
//             				console.log('Квартира ',flats[i].f1,' в секции ',flats[i].section,'  - корректна.');
//             				continue first;
//           				}else{
//             				console.log('Квартира ',flats[i].f1,' в секции ',flats[i].section,'  - не корректна.');
//             				continue first;
//          				 }
//         			}

//         		}
//         		console.log('Квартира ',flats[i].f1,' в секции ',flats[i].section,'  - не совпала.');
//       		}
//     });
//do not delete;
// flatsToTable.forEach(function(flat){
//   FlatsFactory.flatsAdd(flat);
// });



    $scope.bookDate = "";
    $scope.priceFrom = "";
    $scope.priceTo = "";
    $scope.squareFrom = "";
    $scope.squareTo = "";

    //$rootScope.accept = FlatsFactory.typeUserAccept();
    $scope.listCtrlr = true;
    $scope.byPriceFrom = function(val) {
      if (parseFloat(val.price*1) >= $scope.priceFrom || !$scope.priceFrom ) {
        return true;
      } else {
        return false;
      }
    }
    
    $scope.byPriceTo = function(val) {
      if (parseFloat(val.price*1) <= $scope.priceTo || !$scope.priceTo ) {
        return true; 
      } else {
        return false;
      }
    }
    
    $scope.bySquareFrom = function(val) {
      if (parseFloat(val.square*1) >= $scope.squareFrom || !$scope.squareFrom ) {
        return true;
      } else {
        return false;
      }
    }
    
    $scope.bySquareTo = function(val) {
      if (parseFloat(val.square*1) <= $scope.squareTo || !$scope.squareTo ) {
        return true;
      } else {
        return false;
      }
    }
    
    $scope.byFilterFloors = function(val) {
      if (parseFloat(val.floor*1) == $scope.filterFloors || !$scope.filterFloors ) {
        return true;
      } else {
        return false;
      }
    }
    
    $scope.byFilterRooms = function(val) {
      if (parseFloat(val.room*1) == $scope.filterRooms || !$scope.filterRooms ) {
        return true;
      } else {
        return false;
      }
    }
 $scope.viewMode = "list";
        $scope.setViewMode = function (mode) {
        $scope.viewMode = mode;
    }
     $scope.viewMode = "list";
        $scope.setViewMode = function (mode) {
        $scope.viewMode = mode;
        if (mode == "list") {
            $scope.ChessCtrlr = false;
            $scope.listCtrlr = true;
        }
        if (mode == "chess") {
            $scope.ChessCtrlr = true;
            $scope.listCtrlr = false;
        }
    }


   FlatsFactory.getFlats(function(flats) {
      /*flat.f6[0].f2*/
      $rootScope.flats = flats;
      //do not delete
	    // flats.forEach(function(item) {
	    //     if(item) {
	    //    	FlatsFactory.clearF8AndF9Fields(item);
	    //    	console.log(true);
	    //    		// if(item.f6[0].f2 == "Белогородская") {
	    //    	// 	var str = item.square;
	    //      	// 	item.square = str.replace(",",".");
	    //     	// 	var data = {
	    //      //   			'f4': item.square
	    //       // 			};
	    //  		// 	FlatsFactory.dataUpdate(item.field_value_id, data);
	    //    		// }
	    //     }
	    // });


    $scope.chessFlats = makeHouseArr();


    });

     $scope.changeHouse = function () {
       $scope.chessFlats = makeHouseArr();
     }

     function makeHouseArr(houseName) {
         var sortBySection = [];

         for (var fl in $rootScope.flats){

         if ($rootScope.flats[fl].f6) {
          
            sortBySection.push($rootScope.flats[fl]); 
        
         }

        }

        function compare(a, b) {
            if (a.section > b.section) return 1;
            if (a.section < b.section) return -1;
        }
        function compareFloor(a, b) {
            if (a.floor > b.floor) return 1;
            if (a.floor < b.floor) return -1;
        }
      var sortedBeSection = sortBySection.sort(compare);
       var sectionKey = 0;
       var sectionFromKey = sortedBeSection[0].section;
       var sortWithSection = [];
       sortWithSection[sectionKey] = [];

       for (var thisFlat in sortedBeSection) {
           if (sectionFromKey !== sortedBeSection[thisFlat].section) {
             sectionKey++;
             sortWithSection[sectionKey] = [];
             sectionFromKey = sortedBeSection[thisFlat].section;
            }
         sortWithSection[sectionKey].push(sortedBeSection[thisFlat]);
       }
      var lastSort = []
       for (var thisSection in sortWithSection) {

         var middleArray  = sortWithSection[thisSection].sort(compareFloor)
         var floorKey = 0;
         var firstFloor = middleArray[0].floor;
         var sortWithFloors = [];
         sortWithFloors[floorKey] = [];

         for (var thatFlat in middleArray) {
             if (firstFloor !== middleArray[thatFlat].floor) {
             floorKey++;
             sortWithFloors[floorKey] = [];
             firstFloor = middleArray[thatFlat].floor;
            }
            sortWithFloors[floorKey].push(middleArray[thatFlat]);
         }

         lastSort.push( sortWithFloors );

       }

       return lastSort;

     }

    $scope.openFlatModal = function(flat) {
      var lastOperation = FlatsFactory.getLastOperationByFlat(flat);
      $rootScope.selectedFlat = flat;
      $rootScope.selectedFlat.lastOperation = lastOperation;
      $rootScope.selectedFlat.clientsArray = [];
      FlatsFactory.setClientsByLastOperationToScope(lastOperation);

      $rootScope.unpayedDeposit = false;
      if($rootScope.selectedFlat.lastOperation && $rootScope.selectedFlat.lastOperation.f1 == "Внесен задаток" && $rootScope.selectedFlat.lastOperation.f6 =='Ожидаем'){
       $rootScope.unpayedDeposit = true;
     }else if($rootScope.selectedFlat.lastOperation && $rootScope.selectedFlat.lastOperation.f1 == "Внесен задаток" && $rootScope.selectedFlat.lastOperation.f6 =='Оплачено'){
      $rootScope.unpayedDeposit = false;
    }

    if(lastOperation && lastOperation.f1) {
      setActiveTab(lastOperation.f1);
    } else {
      setActiveTab("Забронировано");
    }
    FlatsFactory.setSelectedFlat($rootScope.selectedFlat);
    console.log($rootScope.selectedFlat);
    $('#flatModal').openModal();
  }
   $scope.checkFlatEditable = function(flat) {
    $http.get('/api/data/tableRows?r=' + flat.field_value_id)
    .success(function(data) {
         var userEditor = getUserInfo().name;
         var flatManagerIs = data[0].f15 ? data[0].f15.replace(/\s+/g, '') : '';
         var parseReady = parseInt(data[0].f13);
    
      if (parseReady || flatManagerIs === userEditor.replace(/\s+/g, '')) {
        $scope.openFlatModal(flat);
        var f = new FormData();
        f.append('r', flat.field_value_id);
        f.append('data[f13]', '0');
        f.append('data[f15]', userEditor);
        ajaxPost('/api/data/updateRow',f, true, function(res) {});

      } else {
        $('#warningModal').openModal();
      }
    })
  }
  $scope.checkIfDateIsOverdue = function(date) {
    return new Date(date) < new Date;
  }
  $scope.toTrueFormat = function(date) {
    return FlatsFactory.toTrueFormat(date);
  }

  function setActiveTab(lastOperationType) {
    var activeTabId = "";
    switch (lastOperationType) {
      case "Забронировано":
      activeTabId = "bookContentBlock";
      break;

      case "Внесен задаток":
      activeTabId = "depositPerFlatBlock";
      break;
      case "Продано":
      activeTabId = "sellFlatBlock";
      break;
      case "Доплата по рассрочке":
      activeTabId = "creditFlatBlock";
      break;
      case "Рассрочка":
      activeTabId = "creditFlatBlock";
      break;
      default: {
        activeTabId = "bookContentBlock";
      }

    }
    //$(document).ready(function(){
      //$('ul.tabs').tabs('select_tab', activeTabId);
   // });
  }

      //TODO: do this later
      $scope.updateClientData = function(clientId) {
      	debugger;
        input = find('addUser').querySelectorAll('input');
        for (i = 0; i < input.length; i++) if (input[i].id !== "userValFilephoto" && input[i].value == '') return;
          if (clientId) {
            var f = new FormData();
            var photo = null;
            if(find('userValFilephoto').files[0]) {
              f.append('data[f2]', find('userValFilephoto').files[0]);
            }
            f.append('r', clientId);
            f.append('data[f1]', find('userValname').value);
            f.append('data[f3]', find('userValphone').value);
            f.append('data[f4]', find('userValemail').value);
            f.append('data[f5]', find('userValpassportSerialKey').value);
            f.append('data[f6]', find('userValpassportSerialNum').value);
            f.append('data[f7]', find('userValwhoGavePassport').value);
            f.append('data[f8]', find('userValregistrationAddress').value);
            f.append('data[f9]', find('userValhomeAddress').value);
            f.append('data[f10]', find('userValINN').value);
            f.append('data[f13]', find('innOriginalName').value);
            ajaxPost('/api/data/updateRow',f, true, function(res) {
              if (res === "ok") {
                Materialize.toast('Клиент изменен!', 2000);
                $('#userModal').closeModal();
                if (typeof printClientsList == 'function') {
                  printClientsList();
                }
                if (typeof setClient == 'function')  setClient(res);
              }
              else Materialize.toast('Возникла ошибка. Попробуйте еще раз или обновите страницу.', 4000);
            });
          }
        }
        //!!!To do!!!
      }
      ])
.controller('FlatCtrl', ['$scope', '$rootScope', '$http', 'FlatsFactory', 'ClientsFactory',

  function($scope, $rootScope, $http, FlatsFactory, ClientsFactory) {

    $scope.selectedFlat = FlatsFactory.getSelectedFlat();

    $scope.$on('setSelectedFlatChanged', function () {
      $scope.selectedFlat = FlatsFactory.getSelectedFlat();
    });

    $(document).keydown(function(e) {
    if( e.keyCode === 27 ) {
        e.preventDefault();
        $scope.setEditableTrue();
    }

});

    $scope.setEditableTrue = function() {
        // var id = document.querySelector('#saveFlatModal').getAttribute('data-flat-id');
        var id = $scope.selectedFlat.field_value_id;
        var f = new FormData();
        f.append('r', id);
        f.append('data[f13]', '1');
        f.append('data[f15]', '');
        ajaxPost('/api/data/updateRow',f, true, function(res) {
          if(res == "ok") {
            FlatsFactory.getFlats(function(flats) {
              $scope.flats = flats;

               location.reload(true);
              // $rootScope.flats.forEach(function(item) {
              //   item.NewClass = getFlatClass(item);
              // })
            });
          } else {
            console.error("!!achtung!!!");
          }
        });

      }
      function getFlatClass(item) {
        return FlatsFactory.getFlatClass(item);
      }
      $scope.getValue = function(doc, f5) {
        return doc || f5;
      }
      $scope.abilityToAddClient = function() {
        if($scope.selectedFlat && $scope.selectedFlat.clientsArray && $scope.selectedFlat.clientsArray.length != 2) {
          var lastOperation = FlatsFactory.getLastOperationByFlat($scope.selectedFlat);
          if(!lastOperation || (lastOperation.f1 === "Отмена брони" || lastOperation.f1 === "Отмена задатка" ||
            lastOperation.f1 === "Возврат средств") || lastOperation.f1 === "Внесен задаток") {
            return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    $scope.removeSelectedClient = function(item) {
      if ($scope.selectedFlat && $scope.selectedFlat.clientsArray && $scope.selectedFlat.clientsArray.length >= 1) {
        $scope.selectedFlat.clientsArray.splice(item, 1);
      } else {
        throw new Error("Can`t remove client");
      }
    }
    $scope.showRemoveClientIcon = function() {
      var lastOperation = FlatsFactory.getLastOperationByFlat($scope.selectedFlat);
      if(lastOperation.f1 == "Внесен задаток" || lastOperation.f1 == "Доплата по рассрочке" ||
        lastOperation.f1 == "Рассрочка" || lastOperation.f1 == "Продано") {
        return false;
    } else {
      return true;
    }
  }
  $scope.openClientAddModal = function() {
    $('#clientAddModal').openModal();
  }
  $scope.toTrueFormat = function(date) {
    return FlatsFactory.toTrueFormat(date);
  }
  $scope.openOperationModal = function(paymentOperation, paymentList) {
    $scope.selectedFlat = FlatsFactory.getSelectedFlat();
    $scope.$on('setSelectedFlatChanged', function () {
      $scope.selectedFlat = FlatsFactory.getSelectedFlat();
    });

    $scope.selectedFlat.paymentOperation = paymentOperation;
    FlatsFactory.setSelectedFlat($scope.selectedFlat);
    $('#plannedOperationModal').openModal();
  }
}
])
.controller('ClientCtrl', ['$scope', '$rootScope', '$http', 'FlatsFactory', 'ClientsFactory',
  function($scope, $rootScope, $http, FlatsFactory, ClientsFactory) {
    ClientsFactory.getClients(function(clients) {
      $rootScope.clients = clients;
    })
    $scope.addNewClientAndSave = function() {
      var data = new FormData();
      data.append('t', '296');
      data.append('data[f1]', find('userValname').value);
      data.append('data[f2]', find('userValFilephoto').files[0]);
      data.append('data[f3]', find('userValphone').value);
      data.append('data[f4]', find('userValemail').value);
      data.append('data[f5]', find('userValpassportSerialKey').value);
      data.append('data[f6]', find('userValpassportSerialNum').value);
      data.append('data[f7]', find('userValwhoGavePassport').value);
      data.append('data[f8]', find('userValregistrationAddress').value);
      data.append('data[f9]', find('userValhomeAddress').value);
      data.append('data[f10]', find('userValINN').value);
      data.append('data[f13]', find('innOriginalName').value)
      ajaxPost('/api/data/addNewRow', data, true, function(res) {
        if(parseInt(res)) {
          setClientToSelectedFlatScope(res);
          $('#clientAddModal').closeModal();
          Materialize.toast('Клиент добавлен!', 2000);

        }
        else Materialize.toast('Возникла ошибка. Попробуйте еще раз или обновите страницу.', 4000);
      });
    }
    $scope.pickClientFromExistsAndAddToSelectedFlatScope = function(client) {
      if (client && $rootScope.selectedFlat) {
        $rootScope.selectedFlat.clientsArray.push(client);
        console.log("client added", $rootScope.selectedFlat);
        $('#clientAddModal').closeModal();
        Materialize.toast("ok", 2000);
      } else {
        Materialize.toast("Error to pick client", 3000);
      }
    }
    function setClientToSelectedFlatScope(clientId) {
      $http.get('/api/data/tableRows?r=' + clientId)
      .success(function(client) {
        if (client) {
          if(client[0].photo.indexOf('|') > -1) {
            client[0].photo = client[0].photo.replace(/[|,]/g, "");
          }
          $rootScope.selectedFlat.clientsArray.push(client[0]);
        }
      });
    }
      //filters
      $scope.byName = function(client) {
        if(client && client.name && $scope.searchClientValue) {
          if(client.name.indexOf($scope.searchClientValue) > -1) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      }
      //!!!filters!!!
    }
    ])
.controller('BookFlatCtrl', ['$scope', '$rootScope', '$http', 'FlatsFactory', 'ClientsFactory',
  function($scope, $rootScope, $http, FlatsFactory, ClientsFactory) {

    // if(flatObj.checkIfFlatHasDeposit(flat).f6 && flatObj.checkIfFlatHasDeposit(flat).f6=="Ожидаем"){
    //   $rootScope.ifCustomerPayedDeposit = false;
    // }else{
    //   $rootScope.ifCustomerPayedDeposit = true;
    // }


      //Work with action BOOK
      $scope.bookFlat = function() {
        if($rootScope.selectedFlat) {
          var newOperationId = FlatsFactory.addOperationToOperationTable("Забронировано", 0, 0, "bookContentBlock", "bookDate");
          FlatsFactory.updateFlatOperationField(newOperationId, function(result) {
            if (result) {
              console.log(result, "bookFlat worked");
              FlatsFactory.rewriteSelectedFlatAndImportantField($rootScope.selectedFlat.field_value_id);
              Materialize.toast("Операция успешна. Вы забронировали квартиру!", 3000);
            }
          });
        } else {
          Materialize.toast("Error, you didn't select the flat", 3000);
        }
      }
      $scope.showBookFlat = function() {
        if($rootScope.selectedFlat) {
          if($rootScope.selectedFlat.clientsArray.length > 0 && $rootScope.selectedFlat.lastOperation) {
            if($rootScope.selectedFlat.lastOperation.f1 !== "Забронировано" && $rootScope.selectedFlat.lastOperation.f1 !== "Внесен задаток" &&
              $rootScope.selectedFlat.lastOperation.f1 !== "Продано" && $rootScope.selectedFlat.lastOperation.f1 !== "Рассрочка" &&
              $rootScope.selectedFlat.lastOperation.f1 !== "Доплата по рассрочке") {
              return true;
          } else {
            return false;
          }
        } else if ($rootScope.selectedFlat.clientsArray.length > 0) {
          return true;
        }  else {
          return false;
        }
      } else {
        return false;
      }
    }
    $scope.hideCancelBookFlat = function() {
      if($scope.selectedFlat) {
        if($scope.selectedFlat.lastOperation) {
          if($scope.selectedFlat.lastOperation.f1 == "Забронировано") {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
    }
    $scope.cancelBookFlat = function() {
      if($scope.selectedFlat && $scope.selectedFlat.lastOperation.f1 == "Забронировано") {
        FlatsFactory.dataDelete($scope.selectedFlat.lastOperation.field_value_id, function(res) {
          if(res == "ok") {
            FlatsFactory.rewriteSelectedFlatAndImportantField($scope.selectedFlat.field_value_id);
            Materialize.toast("Операция бронирования успешно отменена!", 3000);
          } else {
            Materialize.toast("You cant cancel book. Something wrong!", 3000);
          }
        });
      } else {
        Materialize.toast("You cant cancel book. Something wrong!", 3000);
      }
    }
      //datepicker
      $('#bookDate').pickadate({
        min: true,
        max: +2,
        selectMonths: true,
        selectYears: 15,
        // closeOnSelect: true
        onSet: function( arg ) {
            if ( 'select' in arg ) { //prevent closing on selecting month/year
              this.close();
            }
          }
        });
      //!!!datepicker!!!
      //!!!Work with action BOOK
    }
    ])
.controller('DepositPerFlatCtrl', ['$scope', '$rootScope', '$http', 'FlatsFactory', 'ClientsFactory',
  function($scope, $rootScope, $http, FlatsFactory, ClientsFactory) {
    $scope.selectedFlat = FlatsFactory.getSelectedFlat();
    $scope.selectedFlat.depositPerFlatSumm = 0;
    $scope.selectedFlat.returnedSumm = 0;
    $scope.$on('setSelectedFlatChanged', function () {
      $scope.selectedFlat = FlatsFactory.getSelectedFlat();
    });
      //Work with deposit (show And hide button)
      $scope.showDepositPerFlat = function() {
        if($scope.selectedFlat && $scope.selectedFlat.clientsArray && $scope.selectedFlat.clientsArray.length > 0 && $scope.selectedFlat.clientsArray.length < 2) {
          if($scope.selectedFlat.lastOperation) {
            if($scope.selectedFlat.lastOperation.f1 !== "Внесен задаток" &&
              $scope.selectedFlat.lastOperation.f1 !== "Продано" && $scope.selectedFlat.lastOperation.f1 !== "Рассрочка" &&
              $scope.selectedFlat.lastOperation.f1 !== "Доплата по рассрочке") {
              return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
    //скрытие кнопки если не выбрана дата
    $scope.isHaveDate = function() {

      if ($('#depositPerFlatDatepicker').val()) return true;
    }
    //Добавляем операцию в таблицу операций
    $scope.depositPerFlat = function() {
      if($scope.selectedFlat) {
        FlatsFactory.setSelectedFlat($scope.selectedFlat);
        var newOperationId = FlatsFactory.addOperationToOperationTable("Внесен задаток", $scope.selectedFlat.depositPerFlatSumm),
        flatResidue = FlatsFactory.countFlatResidue($scope.selectedFlat.totalSumm, $scope.selectedFlat.depositPerFlatSumm),
        date = FlatsFactory.getDatapickerValueInMySqlFormat('depositPerFlatBlock', 'depositPerFlatDatepicker'),
        client = $scope.selectedFlat.clientsArray[0].field_value_id,
        newPlanningOperationId = FlatsFactory.addPlanningOperationToPlanningOparationTable(flatResidue, date, client);
        $rootScope.toFlatDate = date;
        FlatsFactory.updateFlatPlanningOperationField(newPlanningOperationId, function(planningOperationFieldUpdateResult) {
          if(planningOperationFieldUpdateResult) {
            FlatsFactory.updateFlatOperationField(newOperationId, function(result) {
              if (result) {
                console.log(result, "deposit per flat worked");
                $rootScope.unpayedDeposit = true;
                FlatsFactory.rewriteSelectedFlatAndImportantField($scope.selectedFlat.field_value_id);

                Materialize.toast("Операция успешна. Вы забронировали квартиру!", 3000);
                $http.get('/api/data/updateRow?r=' + $rootScope.selectedFlat.field_value_id+"&data[f14]="+getUserInfo().name+'&data[f16]='+$rootScope.toFlatDate).success();

              }
            });
          } else {
            Materialize.toast("Can't update flat planning operation field", 3000);
          }
        })

      } else {
        Materialize.toast("Error, you didn't select the flat", 3000);
      }
    }
    $scope.showCancelDepositPerFlat = function() {
      if($scope.selectedFlat) {
        if ($scope.selectedFlat.clientsArray && $scope.selectedFlat.clientsArray.length > 0 && $scope.selectedFlat.clientsArray.length < 2) {
          if($scope.selectedFlat.lastOperation) {
            if($scope.selectedFlat.lastOperation.f1 && $scope.selectedFlat.lastOperation.f1 === "Внесен задаток") {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    $scope.cancelDepositPerFlat = function() {
      if($scope.selectedFlat && $scope.selectedFlat.lastOperation && $scope.selectedFlat.lastOperation.f1 == "Внесен задаток") {
        if($scope.selectedFlat.returnedSumm && $scope.selectedFlat.returnedSumm <= $scope.selectedFlat.lastOperation.f21) {
          FlatsFactory.dataDelete($scope.selectedFlat.paymentList[0].field_value_id, function(deletePlanningOperationResult) {
            if(deletePlanningOperationResult == "ok") {
              var newOperationId = FlatsFactory.addOperationToOperationTable("Отмена задатка", $scope.selectedFlat.returnedSumm);
              FlatsFactory.updateFlatOperationField(newOperationId, function(updateOperationFieldInFlatTableStatus) {
                if(updateOperationFieldInFlatTableStatus) {
                  //console.log(updateOperationFieldInFlatTableStatus, " cancel deposit per flat worked");
                  FlatsFactory.rewriteSelectedFlatAndImportantField($scope.selectedFlat.field_value_id);
                   $rootScope.unpayedDeposit = false;
                  Materialize.toast("Операция успешна. Вы отменили задаток за квартиру!", 3000);
                } else {
                  Materialize.toast("Ошибка, квартира не обновлена, сообщите администратору");
                }
              });
            }
          });
        } else {
          Materialize.toast("Ошибка! Нет возвращаемой суммы или она больше внесенной", 3000);
        }
      } else {
        Materialize.toast("Error, something wrong with cancel deposit per flat", 3000);
      }
      console.log("cancel deposit per flat");
    }
    $('#depositPerFlatDatepicker').pickadate({
      min: true,
      selectMonths: true,
      selectYears: true,
      max: +14,
      onSet: function( arg ) {
              if ( 'select' in arg ) { //prevent closing on selecting month/year
                this.close();
              }
            }
          });

    $scope.toTrueFormat = function(date) {
      return FlatsFactory.toTrueFormat(date);
    }
      //!!!Work with deposit!!!
    }
    ])
.controller('SellFlatCtrl', ['$scope', '$rootScope', '$http', 'FlatsFactory', 'ClientsFactory',
  function($scope, $rootScope, $http, FlatsFactory, ClientsFactory) {
    $scope.selectedFlat = FlatsFactory.getSelectedFlat();

    $scope.selectedFlat.selectedDiscount = 0;
    $scope.selectedFlat.selectedStock = 0;
    $scope.selectedFlat.returnedSellSumm = 0;

    $scope.$on('setSelectedFlatChanged', function () {
      $scope.selectedFlat = FlatsFactory.getSelectedFlat();
      $scope.selectedFlat.stockForFlat = [];
      if($scope.selectedFlat.room) {
        FlatsFactory.getStock(function(stockResult) {
          $scope.selectedFlat.stockForFlat = stockResult;
        }, $scope.selectedFlat.room);

        FlatsFactory.getDiscount(function(discountResult) {
          $scope.selectedFlat.discountForFlat = discountResult;
        }, $scope.selectedFlat.room);
      }
    });
    $rootScope.CheckDeposit= function(){
      if($rootScope.unpayedDeposit == true){
        return false;
      }else{
        return true;
      }
    }
    $scope.showSellFlat = function() {

      if($scope.selectedFlat && $scope.selectedFlat.clientsArray && $scope.selectedFlat.clientsArray.length > 0 && $scope.selectedFlat.clientsArray.length <= 2) {
        if($scope.selectedFlat.lastOperation) {
          if($scope.selectedFlat.lastOperation.f1 !== "Продано") {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
    $scope.showCancelSellFlat = function() {
      if($scope.selectedFlat && $scope.selectedFlat.clientsArray && $scope.selectedFlat.clientsArray.length > 0 && $scope.selectedFlat.clientsArray.length <= 2) {
        if($scope.selectedFlat.lastOperation) {
          if($scope.selectedFlat.lastOperation.f1 === "Продано") {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    }

      //TODO:Добавить проверку на наличие рассрочки, если она есть, то не давать скидку
      //TODO добавить в базу пересчитанную стоимость метра квадратного после скидки
      $scope.sellFlat = function() {
        var flatDeposit = checkIfFlatHasDeposit($scope.selectedFlat),
        residueSumm = 0,
        finalSumm = countFinalSummWithAllStocks();
        if (flatDeposit && flatDeposit.f1 == "Внесен задаток") {
          residueSumm = summRound(parseFloat(finalSumm) - parseFloat(flatDeposit.f21));
        } else {
          residueSumm = summRound(parseFloat(finalSumm));
        }
        FlatsFactory.getDollar(function(dollars) {
          var dollar = dollars[dollars.length-1].f2;
          var newOperationId = FlatsFactory.addOperationToOperationTable("Продано", residueSumm, dollar);
          FlatsFactory.updateFlatOperationField(newOperationId, function(result) {
            if (result) {
              if($scope.selectedFlat.paymentList && $scope.selectedFlat.paymentList.length > 0) {
                $scope.selectedFlat.paymentList.forEach(function(planningOperation) {
                  FlatsFactory.dataDelete(planningOperation.field_value_id, function(deletePlanningOperationResult) {
                    if(deletePlanningOperationResult == "ok") {
                      Materialize.toast("Плановая операция удалена", 3000);
                    } else {
                      Materialize.toast("Плановая операция не удалена", 3000);
                    }
                  });
                })
              }
              console.log(result, "sell flat worked");
              FlatsFactory.rewriteSelectedFlatAndImportantField($scope.selectedFlat.field_value_id);

              Materialize.toast("Операция успешна. Вы продали квартиру!", 3000);
            } else {
              console.log("sell flat not worked");
            }
          });
        })


      }
      $scope.cancelSellFlat = function() {
        if($scope.selectedFlat && $scope.selectedFlat.lastOperation && $scope.selectedFlat.lastOperation.f1 == "Продано") {
          if($scope.selectedFlat.returnedSellSumm && $scope.selectedFlat.returnedSellSumm <= $scope.selectedFlat.lastOperation.f21) {
            var newOperationId = FlatsFactory.addOperationToOperationTable("Возврат средств", $scope.selectedFlat.returnedSellSumm);
            FlatsFactory.updateFlatOperationField(newOperationId, function(updateOperationFieldInFlatTableStatus) {
              if(updateOperationFieldInFlatTableStatus) {
                console.log(updateOperationFieldInFlatTableStatus, "flat sell cancelling is working");
                FlatsFactory.rewriteSelectedFlatAndImportantField($scope.selectedFlat.field_value_id);
                Materialize.toast("Операция успешна. Вы вернули средства за квартиру!", 3000);
              } else {
                Materialize.toast("Ошибка, квартира не обновлена, сообщите администратору");
              }
            });
          } else {
            Materialize.toast("Ошибка! Нет возвращаемой суммы или она больше внесенной", 3000);
          }
        } else {
          Materialize.toast("Error, something wrong with cancel deposit per flat", 3000);
        } 
        console.log("cancel sell flat");
      }
      function checkIfFlatHasDeposit(selectedFlat) {
        return FlatsFactory.checkIfFlatHasDeposit(selectedFlat);
      }
      function countFinalSummWithAllStocks() {
        if($scope.selectedFlat.selectedDiscount > 0 || $scope.selectedFlat.selectedStock > 0) {
          if ($scope.selectedFlat.selectedStock) {
            $rootScope.newMeterSquarePriseWithStockAndDickountReg = parseFloat($scope.selectedFlat.selectedStock);
            return summRound(parseFloat($scope.selectedFlat.square) * parseFloat($scope.selectedFlat.selectedStock));
          } else {
           $rootScope.newMeterSquarePriseWithStockAndDickountReg = (parseFloat($scope.selectedFlat.price) - parseFloat($scope.selectedFlat.selectedDiscount));
           return summRound(parseFloat($scope.selectedFlat.square) * (parseFloat($scope.selectedFlat.price) - parseFloat($scope.selectedFlat.selectedDiscount)));
         }
       } else {
        return $scope.selectedFlat.totalSumm;
      }
    }
  }
  ])
.controller('CreditPerFlatCtrl', ['$scope', '$rootScope', '$http', 'FlatsFactory', 'ClientsFactory','$timeout',
  function($scope, $rootScope, $http, FlatsFactory, ClientsFactory,$timeout) {
// $scope.showPreloader = function(){
//       $rootScope.preloader = true;
//     };
   $scope.selectedFlat = FlatsFactory.getSelectedFlat();
   $scope.$on('setSelectedFlatChanged', function () {
    $scope.selectedFlat = FlatsFactory.getSelectedFlat();
  });
   $scope.selectedFlat.firstMinPaymentSumm = 1;

   $scope.selectedFlat.creditMonth = 6;
   $scope.selectedFlat.creditPlanArray = [];
   $scope.selectedFlat.returnedCreditSumm = 0;

   var deposit = checkIfFlatHasDeposit($scope.selectedFlat);
   // $scope.avans = $scope.selectedFlat.minPaymentSumm;
   $scope.$watch('selectedFlat.creditMonth', function(value){
      if(+value == 6) {
        $scope.selectedFlat.minPaymentSummOutput =summRound($scope.selectedFlat.minPaymentSumm*1.03).toFixed(2);
        $scope.selectedFlat.totalSummFlat = summRound($scope.selectedFlat.totalSumm*1.03);
        $scope.selectedFlat.coef = 1.03;
      }
      if(+value == 12){
        $scope.selectedFlat.minPaymentSummOutput =summRound($scope.selectedFlat.minPaymentSumm*1.06).toFixed(2);
        $scope.selectedFlat.totalSummFlat = summRound($scope.selectedFlat.totalSumm*1.06);
        $scope.selectedFlat.coef = 1.06;
      }

      $rootScope.creditMonth = value;
      countPlanningOperations();
    }, true);
   $scope.$watch('selectedFlat.firstMinPaymentSumm', function() {
    countPlanningOperations();
  }, true);

   function checkIfFlatHasDeposit(selectedFlat) {
    return FlatsFactory.checkIfFlatHasDeposit(selectedFlat);
  }
  function getTrueMonth(month) {
    return month < 10 ? '0' + month : month;
  }
      function countPlanningOperations() { // без задатка

        $scope.selectedFlat.creditPlanArray = [];
        var m2 = summRound(summRound(summRound($scope.selectedFlat.square * $scope.selectedFlat.price) * $scope.selectedFlat.coef) / $scope.selectedFlat.square);

        var totalSumm = summRound($scope.selectedFlat.totalSummFlat - $scope.selectedFlat.firstMinPaymentSumm);
        var residueM2 = summRound(totalSumm / m2);
        var resultSumm = summRound(residueM2 * m2);
        var partSumm = summRound(resultSumm / $scope.selectedFlat.creditMonth);
        if ($scope.selectedFlat.clientsArray && $scope.selectedFlat.clientsArray.length == 2) {
          partSumm = summRound(partSumm / 2);
          totalSumm = summRound(totalSumm / 2);
        }
        var totalSummWithoutLastMonth=0;
        for (var i = 0; i < $scope.selectedFlat.creditMonth; i++) {
          var newDate = new Date(new Date(new Date()).setMonth(new Date().getMonth()+ (1 + i)));
          if(i < $scope.selectedFlat.creditMonth-1){
            totalSummWithoutLastMonth += partSumm;

            $scope.selectedFlat.creditPlanArray.push(
            {
              "date" : "25-" + getTrueMonth(new Date(newDate).getMonth() +1) + "-" + new Date(newDate).getFullYear(),
              "summ": partSumm,
              "user" : 1
            }
            );
          }else{

            partSumm = summRound(totalSumm-totalSummWithoutLastMonth);
            $scope.selectedFlat.creditPlanArray.push(
            {
              "date" : "25-" + getTrueMonth(new Date(newDate).getMonth() +1) + "-" + new Date(newDate).getFullYear(),
              "summ": partSumm,
              "user" : 1
            }
            );
          }
        }
      }

      $scope.showCreditFlat = function() {
        if($scope.selectedFlat && $scope.selectedFlat.clientsArray && $scope.selectedFlat.clientsArray.length > 0 && $scope.selectedFlat.clientsArray.length <= 2) {
          if($scope.selectedFlat.lastOperation) {
            if($scope.selectedFlat.lastOperation.f1 !== "Продано" && $scope.selectedFlat.lastOperation.f1 !== "Рассрочка") {
              return true;
            } else {
              return false;
            }
          } else {
            return true;
          }
        } else {
          return false;
        }
      }
      $scope.showCancelCreditFlat = function() {
        if($scope.selectedFlat && $scope.selectedFlat.clientsArray && $scope.selectedFlat.clientsArray.length > 0 && $scope.selectedFlat.clientsArray.length <= 2) {
          if($scope.selectedFlat.lastOperation) {
            if($scope.selectedFlat.lastOperation.f1 === "Рассрочка") {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      }

      //TODO: рассрочка работает только для одного человека без  учета задатка доделать
      $scope.creditFlat = function() {
        $rootScope.preloader = true;
        $timeout(function(){
        var newPlanningOperationId = "|";
        if ($scope.selectedFlat.creditPlanArray && $scope.selectedFlat.creditPlanArray.length > 0) {
          if ($scope.selectedFlat.clientsArray && $scope.selectedFlat.clientsArray.length == 1) {
            for (var i = 0; i < $scope.selectedFlat.creditPlanArray.length; i++) {
              newPlanningOperationId += FlatsFactory.addPlanningOperationToPlanningOparationTable(
                $scope.selectedFlat.creditPlanArray[i].summ,
                FlatsFactory.toMySqlFormat($scope.selectedFlat.creditPlanArray[i].date),
                $scope.selectedFlat.clientsArray[0].field_value_id) + "|";
            }
          } else if ($scope.selectedFlat.clientsArray && $scope.selectedFlat.clientsArray.length == 2) {
            for (var i = 0; i < $scope.selectedFlat.clientsArray.length; i++) {
              for (var j = 0; j < $scope.selectedFlat.creditPlanArray.length; j++) {
                newPlanningOperationId += FlatsFactory.addPlanningOperationToPlanningOparationTable(
                  $scope.selectedFlat.creditPlanArray[j].summ,
                  FlatsFactory.toMySqlFormat($scope.selectedFlat.creditPlanArray[j].date),
                  $scope.selectedFlat.clientsArray[i].field_value_id) + "|";
                
              }
            }
          } else {
            Materialize.toast("Что-то пошло не так", 3000);
          }
        }
        var newOperationId = FlatsFactory.addOperationToOperationTable("Рассрочка", $scope.selectedFlat.firstMinPaymentSumm);
        FlatsFactory.updateFlatPlanningOperationField(newPlanningOperationId, function(planningOperationFieldUpdateResult) {
          if(planningOperationFieldUpdateResult) {
            FlatsFactory.updateFlatOperationField(newOperationId, function(result) {
              if (result) {
                console.log(result, "credit per flat worked");
                FlatsFactory.rewriteSelectedFlatAndImportantField($scope.selectedFlat.field_value_id);
                
                $rootScope.preloader = false;
                Materialize.toast("Операция успешна. Вы взяли кредит на квартиру!", 3000);
              }
            });
          } else {
            $rootScope.preloader = false;
            Materialize.toast("Can't update flat planning operation field", 3000);
          }
        });
      },10);
      }
      $scope.cancelCreditFlat = function() {
        if($scope.selectedFlat && $scope.selectedFlat.lastOperation && $scope.selectedFlat.lastOperation.f1 == "Рассрочка") {
          if($scope.selectedFlat.returnedCreditSumm && $scope.selectedFlat.returnedCreditSumm <= $scope.selectedFlat.lastOperation.f21) {
            $scope.selectedFlat.paymentList.forEach(function(itemList) {
              FlatsFactory.dataDelete(itemList.field_value_id, function(deletePlanningOperationResult) {
                if(deletePlanningOperationResult == "ok") {
                  console.log("deleted");
                }
              });
            })
            var newOperationId = FlatsFactory.addOperationToOperationTable("Возврат средств", $scope.selectedFlat.returnedCreditSumm);
            FlatsFactory.updateFlatOperationField(newOperationId, function(updateOperationFieldInFlatTableStatus) {
              if(updateOperationFieldInFlatTableStatus) {
                console.log(updateOperationFieldInFlatTableStatus, " cancel credit per flat worked");
                FlatsFactory.rewriteSelectedFlatAndImportantField($scope.selectedFlat.field_value_id);
                Materialize.toast("Операция успешна. Вы отменили рассрочку за квартиру!", 3000);
              } else {
                Materialize.toast("Ошибка, квартира не обновлена, сообщите администратору");
              }
            });
          } else {
            Materialize.toast("Ошибка! Нет возвращаемой суммы или она больше внесенной", 3000);
          }
        } else {
          Materialize.toast("Error, something wrong with cancel deposit per flat", 3000);
        }
        console.log("cancel deposit per flat");
      }

    }
    ])

.controller('PlannedOperationCtrl', ['$scope', '$rootScope', '$http', 'FlatsFactory', 'ClientsFactory',
  function($scope, $rootScope, $http, FlatsFactory, ClientsFactory) {
    $scope.paymentOperationEnteredSumm = 0;
    $scope.selectedFlat = FlatsFactory.getSelectedFlat();
    $scope.$on('setSelectedFlatChanged', function () {
      $scope.selectedFlat = FlatsFactory.getSelectedFlat();
    });

    $scope.setPaymentOperation = function(clientFIO) {
      if ($scope.selectedFlat && $scope.selectedFlat.paymentOperation && $scope.paymentOperationEnteredSumm) {
          if ($scope.paymentOperationEnteredSumm == $scope.selectedFlat.paymentOperation.f2) { // только один клиент и только когда задаток равен
            FlatsFactory.dataDelete($scope.selectedFlat.paymentOperation.field_value_id, function(deletePlanningOperationResult) {
              if(deletePlanningOperationResult == "ok") {
                var newOperationId = FlatsFactory.addOperationToOperationTable("Доплата по рассрочке", $scope.paymentOperationEnteredSumm,undefined,undefined,undefined,clientFIO);
                FlatsFactory.updateFlatOperationField(newOperationId, function(updateOperationFieldInFlatTableStatus) {
                  if(updateOperationFieldInFlatTableStatus) {
                    console.log(updateOperationFieldInFlatTableStatus, "plannedOperation per flat worked");
                    FlatsFactory.rewriteSelectedFlatAndImportantField($scope.selectedFlat.field_value_id);
                    Materialize.toast("Операция успешна. Вы произвели оплату!", 3000);
                  } else {
                    Materialize.toast("Ошибка, квартира не обновлена, сообщите администратору");
                  }
                });
              } else {
                console.log("can`t delete planning operation");
              }
            });
          }
        }
      }
      $scope.toTrueFormat = function(date) {
        return FlatsFactory.toTrueFormat(date);
      }
    }
    ])
  // get bills and coins in text format from number sume
  // dependence of getTextNumber function
  // take number
  // return object with coins and bills
  //
  // example:
  // 12250 => {
  //    bills: 'дванадцять тисяч двісті п'ятдесят п'ять',
  //    coins: 'нуль'
  // }
  // 12250.50 => {
  //    bills: 'дванадцять тисяч двісті п'ятдесят п'ять',
  //    coins: 'п'ятдесят'
  // }
  function getGrnAndCois(summ) {
    if (isNaN(parseInt(summ))) {
      return {
        bills: 'нет данных',
        coins: 'нет данных'
      }
    }
    if (typeof summ === 'number') {
      summ += '';
    }
    var summArray = summ.split('.'),
    bills = getTextNumber(summArray[0]),
    coins =  summArray[1] ? getTextNumber(summArray[1]) : "00",
    billsArray,
    coinsArray,
    last;

    billsArray = bills.split(' ');
    last = billsArray.length - 1;

    if (billsArray[last] == 'один') {
      billsArray[last] = 'одна'
    };

    if (billsArray[last] == 'два') {
      billsArray[last] = 'дві'
    };

    coinsArray = coins.split(' ');
    last = coinsArray.length - 1;

    if (coinsArray[last] == 'один') {
      coinsArray[last] = 'одна'
    };

    if (coinsArray[last] == 'два') {
      coinsArray[last] = 'дві'
    };

    bills = billsArray.join(' ');
    coins = coinsArray.join(' ');

    return {
      bills: bills,
      coins: coins
    }
  }
// get text from number
// take number
// return string
// example 1684 => "одна тисяча шістсот вісімдесят чотири"
function getTextNumber(dig) {
  var words = {
    m3:[['тисяча','тисячі','тисяч'], ['мільйон','мільйона','мільйонів'], ['мільярд', 'мільярда', 'мільярдів']],
    m2:['сто','двісті','триста','чотириста', "п'ятсот",'шістсот','сімсот','вісімсот',"дев'ятсот"],
    m1:['десять','двадцать','тридцять','сорок',"п'ятдесят",'шістдесят','сімдесят','вісімдесят',"дев'яносто"],
    m0:['одна','дві','три','чотири',"п'ять","шість",'сім','вісім',"дев'ять",'десять'],
    f0:['одна','дві'],
    l0:['десять', 'одинадцять','дванадцять','тринадцять','чотирнадцять',"п'ятнадцять",'шістнадцять','сімнадцять','вісімнадцять',"дев'ятнадцять"]
  };
  var dim = function(dig, power, words) {
    var result = '';
    var pow = Math.floor(dig / Math.pow(10, power)) % Math.pow(10,3);
    if(!pow) return result;
    var n2 =  Math.floor(pow / 100);
    var n1 =  Math.floor(pow % Math.pow(10,2) / 10);
    var n0 =  Math.floor(pow % 10);
    var s1 = (n1 > 0) ?' ':'';
    var s0 = (n0 > 0) ?' ':'';
    var get_n = function(){
      switch(power){
        case 0:
        case 6:
        case 9:
        result +=s0+words.m0[n0-1];
        break;
        case 3:
        if(n0 < 3){
          result +=s0+words.f0[n0-1];
        }else{
          result +=s0+words.m0[n0-1];
        }
        break;
      }
    };
    if(n2 > 0){
      result += words.m2[n2-1];
    }
    if(n1 > 0){
      if(n1 > 1){
        result +=s1+words.m1[n1-1];
        if(n0 > 0) get_n();
      }
      else{
        result +=s1+words.l0[n0];
      }
    }else{
      if(n0 > 0) get_n();
    }
    if(power){
      var d = (power-3)/3;
      if((d == 0) && (n0+n1*10 >= 11 && n0+n1*10 <= 14)){
        result +=' '+words.m3[0][2];
      }else if(n0 == 1){
        result +=' '+words.m3[d][0];
      }
      else if((n0 >= 2) && (n0 <= 4)){
        result +=' '+words.m3[d][1];
      }
      else if((n0 == 0) || (n0 >= 5 && n0 <= 9)){
        result +=' '+words.m3[d][2];
      }
    }
    return result;
  }
  var finalResult = '';
  for(var i = 9 ; i > -1; i-=3){
    finalResult += dim(dig, i, words) + ' ';

  }
  var oneMilionCntrl = finalResult.replace(/[\s]{2,}/ig,' ').trim();
  return oneMilionCntrl.replace('одна мільйон','один мільйон');
}

function summRound(summ) {

  return Math.round(summ * 100)  / 100;

}
function getKopFromSumm(price){
  var summ = ''+price,
  splitedSumm;
  if(isNaN(parseFloat(summ))) {
    return 'нет данных';
  }else{
    if(summ.indexOf('.') == -1 && summ.indexOf(',') == -1 ){
      return '00';
    }else{
      if(summ.indexOf('.') != -1){
        splitedSumm = summ.split('.');
        switch(splitedSumm[1].length){
          case 2:
          return splitedSumm[1];
          case 1:
          return splitedSumm[1]+'0';
          default:
          return '00';
        }
      } else if(summ.indexOf(',') != -1){
        splitedSumm = summ.split(',');
        switch(splitedSumm[1].length){
          case 2:
          return splitedSumm[1];
          case 1:
          return splitedSumm[1]+'0';
          default:
          return '00';
        }
      }
    }
  }
}
function toCursive(number) {
  var result = "";
  if (number && number >= 0) {
    if(number.indexOf('.') > -1 || number.indexOf(',') > -1) { //check if number have point/comma if have, split
      var parseredArray = [];
      if (number.indexOf('.') > -1 ) {
        parseredArray = number.split(".");
      } else {
        parseredArray = number.split(",");
      }
      result = getTextNumber(parseredArray[0]) + " цілих, " + getTextNumber(parseredArray[1]);
      if (parseredArray[1] <= 9) {
        result += " десятих";
      } else if (parseredArray[1] > 9 && parseredArray[1] <= 99) {
        result += " сотих ";
      }

    } else {
      result = getTextNumber(number) + " цілих";
    }
  } else {
    console.log("You use wrong number", number);
  }
  return result;
}
function isInteger(num) {
  return (num ^ 0) === num;
}
function getEndOfWordCent(param){
  var cents = param;
  if(cents[0] == '1'){
    return "ів";
  }else{
    switch(cents[1]){
      case '1':
      return '';

      case '2':
      case '3':
      case '4':
      return 'а';

      default:
      return 'ів';
    }
  }

}
function flatTooltip() {
 $('#flattable').find('tr').tooltip({delay: 1000});
}
var toogleTooltip = true;
var timerId = setInterval(function() {
  if (toogleTooltip) {
    flatTooltip();
    toogleTooltip = false;
  }
}, 3000);
 // $(document).ready(function(){
 //  $('.cssload-thecube').hide();
 //      $('#click-preloader').on('click',function(){
 //        $('.cssload-thecube').show();
 //      });
 //    });