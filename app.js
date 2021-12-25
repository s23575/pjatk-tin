var $xsd1;
var $xsd2;
var $xsd3;

var xsd1 = "https://www.gov.pl/attachment/df9f95d2-ed06-4df2-9338-b486174f124c";
var xsd2 = "https://www.gov.pl/documents/2034621/2182793/StrukturyDanychSprFin_v1-2.xsd";
var xsd3 = "https://www.gov.pl/attachment/419a55e1-ed6f-4e81-bfde-4968c066d912";

getXSDSchemas(xsd1);
getXSDSchemas(xsd2);
getXSDSchemas(xsd3);

function callback(response, adres) {

  switch(adres) {
    case xsd1:
      $xsd1 = $(response);
      break;
    case xsd2:
      $xsd2 = $(response);
      break;
    case xsd3:
      $xsd3 = $(response);
      break;
    default:
    // jeżeli undefined to bląd
  }
}

function getXSDSchemas(adres) {
  $.ajax({
    'type': "GET",
  //  'global': false,
    'dataType': 'xml',
    'url': adres,
    //'data': { 'request': "", 'target': arrange_url, 'method': method_target },
    'success': function(data){
         callback(data, adres);
    },
  });
}

function getNodeName(name) {
  var s = "xsd\\:element[name='" + name + "'] > xsd\\:annotation > xsd\\:documentation:first";
  var r;
  if ($xsd1 === undefined || $xsd2 === undefined) {
    // jeżeli nie ma to błąd
  }

  $y = $xsd1.find(s);
  r = $y.text();

  if ($y.text() === "") {
    $y = $xsd2.find(s);
    r = $y.text();

    if ($y.text() === "") {
      $y = $xsd3.find(s);
      r = $y.text();

      if ($y.text() === "") {
        r = name.replace(/([a-z])([A-Z])/g, '$1 $2');
        r = r.toLowerCase();
        r = r.charAt(0).toUpperCase() + r.slice(1);
      }
    }
  }

  return r;
}

function getCategory ($xml, kategoria) {
  var $adres = $xml.find(kategoria);
  var s = $adres[0].nodeName.substring($adres[0].nodeName.indexOf(":") + 1);
  var d = getNodeName(s);
  $( ".content" ).append( '<div class="parent">' + d + '</div>' );
  logChildren($adres);
}

function logChildren( $parent , level=0) {
  var s;
  var d;
  level++;
  $parent.children().each( function( i, child ) {
    s = child.nodeName.substring(child.nodeName.indexOf(":") + 1);
      if ($(this).children().length > 0) {
        d = getNodeName(s);
        $( ".content" ).append( '<div class="parent">' + d + '</div>' );
        // console.log(d + " : " + level);
        logChildren( $(child) , level);
      } else {
        d = getNodeName(s);
        $( ".content" ).append( '<div class="dane">' +
                                '<div class="kategoria">' + d + '</div>' +
                                '<div class="wartosc">' + child.textContent + '</div>' +
                                '</div>');
      }
  });
}

function previewFile() {
  var file = $('input[type=file]')[0].files[0];
  $(".input" ).text( file.name );

  var reader = new FileReader();
  reader.addEventListener("load", () => {

    var xmlString = reader.result;
    var xml = $.parseXML(xmlString);
    $xml = $(xml);

    // getCategory($xml,'P_1');
    // getCategory($xml,'P_3');
     getCategory($xml,'jin\\:Aktywa');
    // getCategory($xml,'jin\\:Pasywa');
    // getCategory($xml,'RZiS');
    // getCategory($xml,'InformacjaDodatkowaDotyczacaPodatkuDochodowego');

  }, false);

  if (file) {
    reader.readAsText(file);
  }
}
