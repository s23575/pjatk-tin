$.ajax({
    type: "get",
    url: "https://www.gov.pl/attachment/df9f95d2-ed06-4df2-9338-b486174f124c",
    dataType: "xml",
    success: function(data) {
        /* handle data here */
        $x = $(data);
    },
    error: function(xhr, status) {
        /* handle error here */
        console.log("nie ok");
    }
});

function getNodeName(name) {
  $y = $x.find("xsd\\:element[name='" + name + "'] > xsd\\:annotation > xsd\\:documentation:first");
  console.log($y.text());
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

  }, false);

  if (file) {
    reader.readAsText(file);
  }
}
