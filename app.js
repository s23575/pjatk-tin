// < - - Pobieranie struktur danych - - >

  function callback(response, address) {
    switch(address) {
      case schemaAddress1:
        $schema1 = $(response);
        console.log("Log :\tpobrano strukturę danych (schemę XML) nr 1");
        break;
      case schemaAddress2:
        $schema2 = $(response);
        console.log("Log :\tpobrano strukturę danych (schemę XML) nr 2");
        break;
      case schemaAddress3:
        $schema3 = $(response);
        console.log("Log :\tpobrano strukturę danych (schemę XML) nr 3");
        break;
      default:
        console.log("Błąd :\tnie pobrano struktur danych (schem XML)");
    }
  }

  function getSchemas(address) {
    $.ajax({
      type: "GET",
      dataType: 'xml',
      url: address,
      success: function(response){
           callback(response, address);
      },
    });
  }

  var schemaAddress1 = "https://www.gov.pl/attachment/df9f95d2-ed06-4df2-9338-b486174f124c";
  var schemaAddress2 = "https://www.gov.pl/documents/2034621/2182793/StrukturyDanychSprFin_v1-2.xsd";
  var schemaAddress3 = "https://www.gov.pl/attachment/419a55e1-ed6f-4e81-bfde-4968c066d912";

  var $schema1 = getSchemas(schemaAddress1);
  var $schema2 = getSchemas(schemaAddress2);
  var $schema3 = getSchemas(schemaAddress3);

// < - - / Pobieranie struktur danych - - >

// < - - Pobieranie i agregowanie danych - - >

  // function numberWithCommas(x) {
  //     return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ").replace(".",",");
  // }

  var finDataSet = new Array();
  var entDataSet = new Array();

  function financialData() {
    this.level;
    this.category;
    this.valueCurrentYear;
    this.valuePreviousYear;

    this.getLevel = function(){ return this.level; };
    this.setLevel = function(level){ this.level = level; };

    this.getCategory = function(){ return this.category; };
    this.setCategory = function(category){ this.category = category; };

    this.getValueCurrentYear = function(){ return this.valueCurrentYear; };
    this.setValueCurrentYear = function(valueCurrentYear){ this.valueCurrentYear = valueCurrentYear; };

    this.getValuePreviousYear = function(){ return this.valuePreviousYear; };
    this.setValuePreviousYear = function(valuePreviousYear){ this.valuePreviousYear = valuePreviousYear; };
  }

  function entityData(category, value) {
    this.category = category;
    this.value = value;
  }

  function getCategoryName(categoryNameString) {
    var string = "xsd\\:element[name='" + categoryNameString + "'] > xsd\\:annotation > xsd\\:documentation:first";
    var result;
    var $category;
    if ($schema1 === undefined || $schema2 === undefined || $schema3 === undefined) {
      console.log("Błąd :\tnie pobrano struktur danych (schem XML)");
    }

    $category = $schema1.find(string);
    result = $category.text();

    if ($category.text() === "") {
      $category = $schema2.find(string);
      result = $category.text();

      if ($category.text() === "") {
        $category = $schema3.find(s);
        result = $category.text();

        if ($category.text() === "") {
          result = categoryNameString.replace(/([a-z])([A-Z])/g, '$1 $2');
          result = result.toLowerCase().charAt(0).toUpperCase() + result.slice(1);
        }
      }
    }

    return result;
  }

  function getChildrenContent($parentCategory, level=0) {
    var finData = new financialData();
    finDataSet.push(finData);

    var categoryNameString;
    var categoryName;
    level++;
    // var dashes = "";
    // for (var i = 1; i < level; i++) {
    //   dashes += "– ";
    // }
    $parentCategory.children().each( function( i, child ) {
      categoryNameString = child.nodeName.substring(child.nodeName.indexOf(":") + 1);
      if ($(child).children().length > 0) {
        categoryName = getCategoryName(categoryNameString);
        finDataSet.at(-1).setCategory(categoryName);
        finDataSet.at(-1).setLevel(level);
        //         d = getNodeName(s);
        //         $( ".content" ).append( '<div class="dane" level=' + level + '><div class="kategoria"><p>' + p + d + '</p></div></div>' );
        // //        // console.log(d + " : " + level);
        getChildrenContent( $(child) , level);
      } else {
        if (finDataSet.at(-2).getValueCurrentYear() === undefined) {
          finDataSet.at(-2).setValueCurrentYear(parseFloat(child.textContent));
        } else {
          finDataSet.at(-2).setValuePreviousYear(parseFloat(child.textContent));
        }
        // //        d = getNodeName(s);
        //         d = numberWithCommas(child.textContent);
        //         $( ".dane" ).last().append( /*'<div class="dane">' +*/
        // //                                '<div class="kategoria">' + d + '</div>' +
        //                                 '<div class="wartosc"><p>' + d + '</p></div>');
      }
    });
  }

  function getContentByCategory ($xmlData, category) {
    var $category = $xmlData.find(category);
    // var categoryName = getNodeName($category[0].nodeName.substring($category[0].nodeName.indexOf(":") + 1));
    // $( ".content" ).append( '<div class="parent">' + categoryName + '</div>' );
    getChildrenContent($category);
  }

  function openFile() {
    var file = $('input[type=file]')[0].files[0];
    $(".input" ).text( file.name );

    var reader = new FileReader();
    reader.addEventListener("load", () => {

      var data = reader.result;
      var xmlData = $.parseXML(data);
      $xmlData = $(xmlData);

      // getContentByCategory($xmlData,'P_1');
      // getContentByCategory($xmlData,'P_3');
        getContentByCategory($xmlData,'Bilans');
//      getContentByCategory($xmlData,'jin\\:Aktywa');
      // // getContentByCategory($xmlData,'jin\\:Pasywa');
      // getContentByCategory($xmlData,'RZiS');

    }, false);

    if (Boolean(file)) {
      reader.readAsText(file);
      console.log('Log :\totwarto plik "' + file.name + '"');
    } else {
      console.log('Błąd :\tnie otwarto pliku "' + file.name + '"');
    }

    console.log(finDataSet);
  }
