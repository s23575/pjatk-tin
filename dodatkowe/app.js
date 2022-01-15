getData("http://szuflandia.pjwstk.edu.pl/~ppisarski/zad8/dane.php");

function getData(address) {
  $.ajax({
    type: "GET",
    dataType: 'json',
    url: address,
    success: function(response){
         callback(response, address);
    },
    error: function(){
      $(".status").attr("status", "error").text("Nie pobrano danych z adresu :" + address);
    },
    complete: setTimeout(function(){
      getData(address);
    }, 10000),
  })
}

var k = 0;

function callback(response, address) {
  k++;
  $(".status").attr("status", "success").text("Pobrano dane z adresu : " + address + " ("+ k +")");
  for (var i in response) {
    if (i == "stock") {
      $("#stock.dataSet").each(function(i, element) {
        $(element).empty();
      });
      for (var j in response[i]) {
        presentData(response[i][j], j);
      }
    } else {
      $("#news.dataSet").each(function(i, element) {
        $(element).empty();
      });
      presentData(response[i]);
    }
  }
}

function presentData(value, category="") {
  var s;
  if (Boolean(category)) {
    s = '<div class="dane"><div class="kategoria"><p>'+ category +'</p></div><div class="wartosc"><p>'+ value +'</p></div>  </div>';
    $("#stock").append(s);
  } else {
      s = '<div class="dane"><div class="wartosc"><p>'+ value +'</p></div></div>';
      $("#news").append(s);
  }
}
