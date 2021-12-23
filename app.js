function previewFile() {
  const content = document.querySelector('.content');
  const [file] = document.querySelector('input[type=file]').files;
  const reader = new FileReader();

  reader.addEventListener("load", () => {

//    const parser = new DOMParser();
    var xmlString = reader.result;
    var xml = $.parseXML(xmlString);
    $xml = $(xml);
    $adres = $xml.find('jin\\:Aktywa');
    // console.log($adres.text());

logChildren($adres);

function logChildren( $parent ) {
    $parent.children().each( function( i, child ) {
        if ($(this).children().length > 1) {
          console.log( child.nodeName.replace(/([a-z])([A-Z])/g, '$1 $2') + " : ");
          logChildren( $(child) );
        } else {
          console.log( child.nodeName.replace(/([a-z])([A-Z])/g, '$1 $2') + " : " + child.textContent);
          logChildren( $(child) );
        }
    });
}

    // $adres.each(function( index ) {
    //   console.log( index + ": " + $( this ).text() );
    // });



    // const doc1 = parser.parseFromString(xmlString, "application/xml");
    // content.innerText = doc1.getElementsByTagName("dtsf:OkresOd")[0].childNodes[0].nodeValue;
    //
    // const elements = doc1.querySelectorAll("Naglowek")[0].childNodes;

  }, false);

  if (file) {
    reader.readAsText(file);
  }
}
