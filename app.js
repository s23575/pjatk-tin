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

  var schemaAddress1 = "https://s23575.github.io/pjatk-tin/JednostkaInnaStrukturyDanychSprFin_v1-2.xsd";
  var schemaAddress2 = "https://s23575.github.io/pjatk-tin/StrukturyDanychSprFin_v1-2.xsd";
  var schemaAddress3 = "https://s23575.github.io/pjatk-tin/JednostkaInnaWZlotych(1)_v1-2(1).xsd";

  // var schemaAddress1 = "http://szuflandia.pjwstk.edu.pl/~s23575/JednostkaInnaStrukturyDanychSprFin_v1-2.xsd";
  // var schemaAddress2 = "http://szuflandia.pjwstk.edu.pl/~s23575/StrukturyDanychSprFin_v1-2.xsd";
  // var schemaAddress3 = "http://szuflandia.pjwstk.edu.pl/~s23575/JednostkaInnaWZlotych(1)_v1-2(1).xsd";

  // var schemaAddress1 = "https://www.gov.pl/attachment/df9f95d2-ed06-4df2-9338-b486174f124c";
  // var schemaAddress2 = "https://www.gov.pl/documents/2034621/2182793/StrukturyDanychSprFin_v1-2.xsd";
  // var schemaAddress3 = "https://www.gov.pl/attachment/419a55e1-ed6f-4e81-bfde-4968c066d912";

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

    $parentCategory.children().each(function(i, child) {

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

      if (entData.getCategory() == "Adres" && entData.getLevel() == 2) {

        entData.setLevel(1);
        level--;
        entDataSet.pop();

      } else if (entData.getCategory() == "Kod pkd") {

        entData.setCategory("Kod PKD");

      } else if (entData.getCategory() == "Identyfikator podatkowy NIP") {

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

      getChildrenContentEnt($(child) , level);

    });
  }

  function getChildrenContentFin($parentCategory, level=0) {
    level++;

    $parentCategory.children().each(function(i, child) {
      if ($(child).children().length > 0) {
        var finData = new financialData();

        var categoryNameString;
        var categoryName;

        finData.setLevel(level);

        var prefix = $(child).children(":first").prop("tagName");
        prefix = prefix.substr(0, prefix.indexOf(':'));

        if (child.nodeName.includes("PozycjaUszczegolawiajaca")) {
          finData.setCategory($(child).children(prefix + "\\:NazwaPozycji").text());
          if (finData.getCategory().startsWith("– ") || finData.getCategory().startsWith("- ")) {
            finData.setCategory(finData.getCategory().slice(2));
          }
          finData.setValueCurrentYear(parseFloat($(child).children(prefix + "\\:KwotyPozycji").children(prefix + "\\:KwotaA").text()));
          finData.setValuePreviousYear(parseFloat($(child).children(prefix + "\\:KwotyPozycji").children(prefix + "\\:KwotaB").text()));
          finDataSet.push(finData);
        } else if (child.nodeName.includes("KwotyPozycji")) {
        } else {
          categoryNameString = child.nodeName.substring(child.nodeName.indexOf(":") + 1);
          finData.setCategory(getCategoryName(categoryNameString));
          if (finData.getCategory().startsWith("– ") || finData.getCategory().startsWith("- ")) {
            finData.setCategory(finData.getCategory().slice(2));
          }
          finData.setValueCurrentYear(parseFloat($(child).children(prefix + "\\:KwotaA").text()));
          finData.setValuePreviousYear(parseFloat($(child).children(prefix + "\\:KwotaB").text()));
          finDataSet.push(finData);
        }
        getChildrenContentFin($(child) , level);
      }
    });
  }

  function getContentByCategory ($xmlData, category, type) {

    if (category == "RZiS" || category == "tns\\:RZiS" || category == "ns1\\:RZiS" || category == "ns1\\:tns\\:RZiS") {
      profitAndLossType = $xmlData.find(category).children().get(0).nodeName;
      profitAndLossType = profitAndLossType.substring(profitAndLossType.indexOf(":") + 1);
      profitAndLossType = "xsd\\:element[name='" + profitAndLossType + "']:first";
    }

    var $category = $xmlData.find(category);

    if (type == 1) {
      getChildrenContentFin($category);
      var date = new Date(Date.parse(entDataSet.at(-2).getValue()) - 86400000);
      var finData = new financialData();
      finData.setLevel(1);
      finData.setValueCurrentYear(entDataSet.at(-1).getValue());
      finData.setValuePreviousYear(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate());

      if (category == "RZiS" || category == "tns\\:RZiS" || category == "ns1\\:RZiS" || category == "ns1\\:tns\\:RZiS") {
        finData.setCategory(finDataSet[0].getCategory());
        finDataSet[0] = finData;
      } else {
        finData.setCategory("Bilans");
        finDataSet.unshift(finData);
      }

    } else if (type == 0) {
      getChildrenContentEnt($category);
    }
  }

  var file;

  function openFile() {

    file = $('input[type=file]')[0].files[0];

    if (file.type != "text/xml") {
      $(".input" ).text("Wybrano plik o niewłaściwym rozszerzeniu – wybierz ponownie plik...");
      $(".parent").attr("loaded", "false");
      return;
    } else {
      $(".input" ).text(file.name );
    }

    var reader = new FileReader();
    reader.addEventListener("load", () => {

      // Wyczyszczenie dotychczas odczytanych danych

      $(".dataSet").each(function(i, element) {
        $(element).empty();
      });
      $(".parent").each(function(i, element) {
        element.setAttribute("clicked","false");
      });
      $("#entityData").prev().attr("clicked","true");
      profitAndLossType = undefined;

      var data = reader.result;
      var xmlData = $.parseXML(data);
      $xmlData = $(xmlData);

      var kod = $xmlData.find('[kodSystemowy]').text();
      if (kod != "SprFinJednostkaInnaWZlotych" && kod != "SprFinJednostkaInnaWTysiacach") {
        $(".input" ).text("Wybrano sprawozdanie finansowe niewłaściwego typu – wybierz ponownie plik...");
        $(".parent").attr("loaded", "false");
        return;
      }

      var prefix = "";

      if ($xmlData.find('Naglowek').length == 0) {
        prefix += "ns1\\:";
      }

      if (kod == "SprFinJednostkaInnaWTysiacach") {
        prefix += "tns\\:";
        unitK = true;
      }

      var balanceSheet;
      var profitAndLoss;

      // Typy danych:
      // 0 - dane opisowe (dotyczące podmiotu),
      // 1 - dane finansowe,

      getContentByCategory($xmlData, prefix + "P_1", 0);
      getContentByCategory($xmlData, prefix + "P_3", 0);
      if (entDataSet.length > 0) {
        console.log('Log :\tuwtorzono tablicę "entDataSet" zawierającą ' + entDataSet.length + ' element/y/ów/');
      } else {
        console.log('Błąd :\tutworzona tablica "entDataSet" jest pusta');
        $(".input" ).text("Wystąpił błąd przy pobieraniu danych – spróbuj ponownie wybrać plik...");
        $(".parent").attr("loaded", "false");
        return;
      }

      getContentByCategory($xmlData, prefix + 'Bilans', 1);
      balanceSheet = finDataSet;
      finDataSet = [];
      if (balanceSheet.length > 0) {
        console.log('Log :\tuwtorzono tablicę "balanceSheet" zawierającą ' + balanceSheet.length + ' element/y/ów/');
      } else {
        console.log('Błąd :\tutworzona tablica "balanceSheet" jest pusta');
        $(".input" ).text("Wystąpił błąd przy pobieraniu danych – spróbuj ponownie wybrać plik...");
        $(".parent").attr("loaded", "false");
        return;
      }

      getContentByCategory($xmlData, prefix + 'RZiS', 1);
      profitAndLoss = finDataSet;
      finDataSet = [];
      if (profitAndLoss.length > 0) {
        console.log('Log :\tuwtorzono tablicę "profitAndLoss" zawierającą ' + profitAndLoss.length + ' element/y/ów/');
      } else {
        console.log('Błąd :\tutworzona tablica "profitAndLoss" jest pusta');
        $(".input" ).text("Wystąpił błąd przy pobieraniu danych – spróbuj ponownie wybrać plik...");
        $(".parent").attr("loaded", "false");
        return;
      }

      displayData(entDataSet, balanceSheet, profitAndLoss);
      entDataSet = [];
      balanceSheet = [];
      profitAndLoss = [];
      unitK = false;

    }, false);

    if (Boolean(file)) {
      reader.readAsText(file);
      $(".parent").removeAttr("loaded");
      console.log('Log :\totwarto plik "' + file.name + '"');
    } else {
      console.log('Błąd :\tnie otwarto wybranego pliku');
    }

  }

  // </ - - Pobieranie i agregowanie danych - - >

  // < - - Wyświetlanie danych - - >

  var unitK;

  function formatNumber(number, type) {

    // Typy formatowania:
    // 0 - wartości liczbowe,
    // 1 - wartości procentowe,

    if (type == 0) {
      result = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(number);
      if (unitK == true) {
        result = result.replace("zł", "tys. zł");
      }
    } else if (type == 1) {
      result = new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2}).format(number);
    }

    return result;
  }

  function displayEntData(entityData) {

    var string;
    var levelIndicator = "";

    entityData.forEach(function(data, i) {

      for (var i = 1; i < data.getLevel(); i++) {
          levelIndicator += "–&nbsp;";
      }

      if (data.getValue() === undefined) {
        if (data.getLevel() == 1) {
          string = '<div class="dane" level="' + data.getLevel() + '"><div class="kategoria"><div class="level"><p>' + levelIndicator +'</p></div>' +
          '<p>' + data.getCategory() + '</p></div></div>';
        } else {
          string = '<div class="dane" level="' + data.getLevel() + '"><div class="kategoria"><div class="level"><p>' + levelIndicator +'</p></div>' +
                   '<p>' + data.getCategory() + '</p></div>' +
                   '<div class="wartosci"><div class="wartosc"><p></p></div></div></div>';
        }
      } else {
        string = '<div class="dane" level="' + data.getLevel() + '"><div class="kategoria"><div class="level"><p>' + levelIndicator +'</p></div>' +
                 '<p>' + data.getCategory() + '</p></div>' +
                 '<div class="wartosci"><div class="wartosc"><p>' + data.getValue() + '</p></div></div></div>';
      }

      $("#entityData" ).append(string);

      levelIndicator = "";
    });
  }

  function displayFinData(finData, type) {
    var string;
    var levelIndicator = "";
    var growth;

    finData.forEach(function(data, i) {

      for (var j = 1; j < data.getLevel(); j++) {
          levelIndicator += "–&nbsp;";
      }

      growth = (data.getValueCurrentYear() - data.getValuePreviousYear()) / data.getValuePreviousYear();
      if (isNaN(growth)) {
        growth = "";
      } else {
        growth = formatNumber(growth, 1);
        if (growth.at(0) == "-") {
          growth = "– " + growth.slice(1);
        } else if (growth.startsWith("0,00")) {
        } else {
          growth = "+ " + growth;
        }

      }

      if (i == 0) {
        string = '<div class="dane" level="' + data.getLevel() + '"><div class="kategoria"><div class="level"><p>' + levelIndicator +'</p></div>' +
                 '<p>' + data.getCategory() + '</p></div>' +
                 '<div class="wartosci"><div class="wartosc"><p>' + data.getValueCurrentYear() + '</p></div>' +
                 '<div class="wartosc"><p>' + data.getValuePreviousYear()  + '</p></div>' +
                 '<div class="wartosc"><p>Różnica r / r</p></div></div></div>';
      } else {
        if ((data.getValueCurrentYear() == data.getValuePreviousYear()) && (data.getValueCurrentYear() == 0)) {
          var empty = true;
          if (!(finData[i-1].getValueCurrentYear() == finData[i-1].getValuePreviousYear() && finData[i-1].getValueCurrentYear() == 0)) {
            string = '<div class="dane" level="' + data.getLevel() + '" clicked="false"><div class="kategoria"><div class="level"><p>' + levelIndicator +'</p></div>' +
                     '<p>Puste wiersze  (kliknij, aby rozwinąć / zwinąć)</p></div>' +
                     '<div class="wartosci"><div class="wartosc"><p>' + formatNumber(data.getValueCurrentYear(), 0) + '</p></div>' +
                     '<div class="wartosc"><p>' + formatNumber(data.getValuePreviousYear(), 0) + '</p></div>' +
                     '<div class="wartosc"><p></p></div></div></div>';
          }
          string += '<div class="emptyRecord">';
        }
        string += '<div class="dane" level="' + data.getLevel() + '"><div class="kategoria"><div class="level"><p>' + levelIndicator +'</p></div>' +
                  '<p>' + data.getCategory() + '</p></div>' +
                  '<div class="wartosci"><div class="wartosc"><p>' + formatNumber(data.getValueCurrentYear(), 0) + '</p></div>' +
                  '<div class="wartosc"><p>' + formatNumber(data.getValuePreviousYear(), 0) + '</p></div>' +
                  '<div class="wartosc"><p ' + (growth.at(0) == "0" ? '' : (growth.at(0) == "+" ? 'growth="positive"' : 'growth="negative"' )) +
                  '>' + growth + '</p></div></div></div>';
        if (empty == true) {
          string += '</div>';
        }
      }

      if (type == 0) {
        $("#balanceSheet" ).append(string);
      } else if (type == 1) {
        $("#profitAndLoss" ).append(string);
      }

      levelIndicator = "";
      string = "";
    });
  }

  function displayData (entityData, balanceSheet, profitAndLoss) {

    displayEntData(entityData);

    // Typy danych:
    // 0 - bilans,
    // 1 - RZiS,

    displayFinData(balanceSheet, 0);
    displayFinData(profitAndLoss, 1);

  }

  // </ - - Wyświetlanie danych - - >

  // < - - Rozwijanie / zwijanie wierszy - - >

  $(function(){

    // Rozwijanie / zwijanie nagłówków

    $(".parent").click(function(e) {
      var clicked = e.target.getAttribute("clicked");
      if (clicked == "false") {
        if (Boolean(file)) {
          e.target.setAttribute("clicked","true");
        }
      } else {
        if (Boolean(file)) {
          e.target.setAttribute("clicked","false");
        }
      }
    });

    // Rozwijanie / zwijanie wszystkich pustych wierszy

    $(document).on('click', '.dane[clicked]', function(e) {
      var emptyRecord = $(e.target).parents('.dane[clicked]');
      if (emptyRecord.attr("clicked") == "false") {
        $(".dane[clicked]").attr("clicked","true");
      } else {
        $(".dane[clicked]").attr("clicked","false");
      }
    });

  })
