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

  function entityData() {
    this.level;
    this.category;
    this.value;

    this.getLevel = function(){ return this.level; };
    this.setLevel = function(level){ this.level = level; };

    this.getCategory = function(){ return this.category; };
    this.setCategory = function(category){ this.category = category; };

    this.getValue = function(){ return this.value; };
    this.setValue = function(value){ this.value = value; };
  }

  var profitAndLossType;

  function getCategoryName(categoryNameString) {
    var string = "xsd\\:element[name='" + categoryNameString + "'] > xsd\\:annotation > xsd\\:documentation:first";
    var result;
    var $category;
    if ($schema1 === undefined || $schema2 === undefined || $schema3 === undefined) {
      console.log("Błąd :\tnie pobrano struktur danych (schem XML)");
    }

    if (profitAndLossType !== undefined) {
      $category = $schema1.find(profitAndLossType).find(string);
    } else {
      $category = $schema1.find(string);
    }
    result = $category.text();

    if ($category.text() === "") {
      $category = $schema2.find(string);
      result = $category.text();

      if ($category.text() === "") {
        $category = $schema3.find(string);
        result = $category.text();

        if ($category.text() === "") {
          result = categoryNameString.replace(/([a-z])([A-Z])/g, '$1 $2');
          result = result.toLowerCase().charAt(0).toUpperCase() + result.slice(1).toLowerCase();
        }
      }
    }

    return result;
  }

  function getChildrenContentEnt($parentCategory, level=0) {
    level++;

    $parentCategory.children().each( function( i, child ) {

      var entData = new entityData();

      var categoryNameString;
      var categoryName;
      var entDataAdd;

      categoryNameString = child.nodeName.substring(child.nodeName.indexOf(":") + 1);
      entData.setLevel(level);
      entData.setCategory(getCategoryName(categoryNameString));

      if ($(child).children().length == 0) {
        entData.setValue($(child).text());
      }

      if (entData.getCategory().includes("Identyfikator podatkowy NIP")) {

        var entDataAdd = new entityData();
        entDataAdd.setLevel(1);
        entDataAdd.setCategory("Numery identyfikacyjne");
        entDataSet.push(entDataAdd);
        entData.setLevel(2);

      } else if (entData.getCategory().includes("Numer KRS")) {

        entData.setCategory(entData.getCategory().substring(0, entData.getCategory().indexOf(".")));
        entData.setLevel(2);

      } else if (entData.getCategory().includes("Data")) {

        if (entData.getCategory() == "Data od") {
          var entDataAdd = new entityData();
          entDataAdd.setLevel(1);
          entDataAdd.setCategory("Okres objęty sprawozdaniem finansowym");
          entDataSet.push(entDataAdd);
        }
        entData.setLevel(2);

      }

      entDataSet.push(entData);

      getChildrenContentEnt( $(child) , level);

    });
  }

  function getChildrenContentFin($parentCategory, level=0) {
    level++;

    $parentCategory.children().each( function( i, child ) {
      if ($(child).children().length > 0) {
        var finData = new financialData();

        var categoryNameString;
        var categoryName;

        finData.setLevel(level);

        if (child.nodeName.includes("PozycjaUszczegolawiajaca")) {
          finData.setCategory($(child).children("dtsf\\:NazwaPozycji").text());
          finData.setValueCurrentYear(parseFloat($(child).children("dtsf\\:KwotyPozycji").children("dtsf\\:KwotaA").text()));
          finData.setValuePreviousYear(parseFloat($(child).children("dtsf\\:KwotyPozycji").children("dtsf\\:KwotaB").text()));
          finDataSet.push(finData);
        } else if (child.nodeName == "dtsf:KwotyPozycji") {
        } else {
          categoryNameString = child.nodeName.substring(child.nodeName.indexOf(":") + 1);
          finData.setCategory(getCategoryName(categoryNameString));
          finData.setValueCurrentYear(parseFloat($(child).children("dtsf\\:KwotaA").text()));
          finData.setValuePreviousYear(parseFloat($(child).children("dtsf\\:KwotaB").text()));
          finDataSet.push(finData);
        }
        getChildrenContentFin( $(child) , level);
      }
    });
  }

  function getContentByCategory ($xmlData, category, type) {

    if (category == "RZiS") {
      profitAndLossType = $xmlData.find(category).children().get(0).nodeName;
      profitAndLossType = profitAndLossType.substring(profitAndLossType.indexOf(":") + 1);
      profitAndLossType = "xsd\\:element[name='" + profitAndLossType + "']:first";
    }

    var $category = $xmlData.find(category);
    if (type == 1) {
      getChildrenContentFin($category);
    } else {
      getChildrenContentEnt($category);
    }
  }

  function openFile() {

    var balanceSheet;
    var profitAndLoss;
    var entityData;

    var file = $('input[type=file]')[0].files[0];
    $(".input" ).text( file.name );

    var reader = new FileReader();
    reader.addEventListener("load", () => {

      var data = reader.result;
      var xmlData = $.parseXML(data);
      $xmlData = $(xmlData);

      // Typy danych:
      // 0 - dane opisowe (dotyczące podmiotu),
      // 1 - dane finansowe,

      getContentByCategory($xmlData,'P_1', 0);
      getContentByCategory($xmlData,'P_3', 0);
      console.log(entDataSet);

      getContentByCategory($xmlData,'Bilans', 1);
      balanceSheet = finDataSet;
      finDataSet = [];
      console.log(balanceSheet);

      getContentByCategory($xmlData,'RZiS', 1);
      profitAndLoss = finDataSet;
      finDataSet = [];
      console.log(profitAndLoss);

    }, false);

    if (Boolean(file)) {
      reader.readAsText(file);
      console.log('Log :\totwarto plik "' + file.name + '"');
    } else {
      console.log('Błąd :\tnie otwarto pliku "' + file.name + '"');
    }

  }

  // < - - Wyświetlanie danych - - >


  // function numberWithCommas(x) {
    //     return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ").replace(".",",");
    // }
