var $xsd1;
var $xsd2;

var xsd1 = "https://www.gov.pl/attachment/df9f95d2-ed06-4df2-9338-b486174f124c";
var xsd2 = "https://www.gov.pl/documents/2034621/2182793/StrukturyDanychSprFin_v1-2.xsd";

getXSDSchemas(xsd1);
getXSDSchemas(xsd2);

function callback(response, adres) {
  if (adres == xsd1) {
    $xsd1 = $(response);
  } else if (adres == xsd2) {
    $xsd2 = $(response);
  }
  // jeżeli undefined to bląd
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
  s = "xsd\\:element[name='" + name + "'] > xsd\\:annotation > xsd\\:documentation:first";
  if ($xsd1 === undefined || $xsd2 === undefined) {
    // jeżeli nie ma to błąd
  }
  $y = $xsd1.find(s);
  if ($y.text() === "") {
    $y = $xsd2.find(s);
    if ($y.text() === "") {
      $y.text() = "BŁĄD!";
    }
  }

  console.log($y.text());
}

function logChildren( $parent ) {
  var s;
  $parent.children().each( function( i, child ) {
      if ($(this).children().length > 1) {
        s = child.nodeName.substring(child.nodeName.indexOf(":") + 1);
        getNodeName(s);
        logChildren( $(child) );
      } else {
        console.log( child.nodeName.replace(/([a-z])([A-Z])/g, '$1 $2') + " : " + child.textContent);
        logChildren( $(child) );
      }
  });
}

function previewFile() {
  var [file] = document.querySelector('input[type=file]').files;
  var reader = new FileReader();

  reader.addEventListener("load", () => {

    var xmlString = reader.result;
    var xml = $.parseXML(xmlString);
    $xml = $(xml);
    console.log($.isXMLDoc(xml));
    $adres = $xml.find('jin\\:Aktywa');

    logChildren($adres);

  }, false);

  if (file) {
    reader.readAsText(file);
  }
}
