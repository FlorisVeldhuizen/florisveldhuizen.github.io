    const defaultColor = "#474544";
    const passColor = 'green';
    const failColor = 'red';

    const isActiveElement = (element) => (document.activeElement === element);

    const hasNumber = (myString) =>  /^\d+[a-zA-Z-]*$/.test(myString);
    const hasName = (myString) => /^[A-Za-z' -.]+$/.test(myString);
    const hasEmail = (myString) =>  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(myString);
    const hasPhone = (myString) =>  /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]{6,10}$/.test(myString);
    const hasZip = (myString) => /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-zA-Z]{2}$/.test(myString);
    const hasStreet = (myString) => /^[A-Za-z' -.]+$/.test(myString);
    const hasCity = (myString) => /^[A-Za-z' -]+$/.test(myString);
    const hasMeal = (myString) => /^[A-Za-z0-9' -,.]{1,50}$/.test(myString);


    const isName = (value, isActive = false, c) => {
      let borderColor = "";
      let displayValue = "";
      value = String(value);

      // Dit is de tussentijdse check voor ONMIDDELIJKE feedback
      if (isActive) {
        if(value == ""){
          borderColor = defaultColor;
          displayValue = "none";
        } else {
          borderColor = hasName(value) ? defaultColor : failColor;
          displayValue = hasName(value) ? "inline" : "none";
        }
        c[2].style.setProperty("display",displayValue,"important");
      }
      return borderColor
    };

    const isEmail = (value, isActive = false, c) => {
      let borderColor = "";
      let displayValue = "";
      value = String(value);

      if (isActive) {
        if(value == ""){
          borderColor = defaultColor
          displayValue = "none";
        } else {
          borderColor = hasEmail(value) ? defaultColor : failColor;
          displayValue = hasEmail(value) ? "inline" : "none";
        }
        c[2].style.setProperty("display",displayValue,"important");
      }
      return borderColor
    }

    const isEqual = (value, isActive = false, c) => {
      var email = document.forms["mealform"]["email"].value;
      var emailC = document.forms["mealform"]["emailC"].value;

      let borderColor = "";
      let displayValue = "";
      value = String(value);

      if (isActive) {
        if(value == ""){
          borderColor = defaultColor
          displayValue = "none";
        } else {
          if (emailC == email) {
            displayValue = "inline";
          }else{
            borderColor = failColor;
            displayValue = "none";
          }
        }
        c[2].style.setProperty("display",displayValue,"important");
      }
      return borderColor
    }

    const isPhone = (value, isActive = false, c) => {
      let borderColor = "";
      let displayValue = "";
      value = String(value);

      if (isActive) {
        if(value == ""){
          borderColor = defaultColor
          displayValue = "none";
        } else {
          borderColor = hasPhone(value) ? defaultColor : failColor;
          displayValue = hasPhone(value) ? "inline" : "none";
        }
        c[2].style.setProperty("display",displayValue,"important");
      }
      return borderColor
    }

    const isZip = (value, isActive = false, c) => {
      let borderColor = "";
      let displayValue = "";
      value = String(value);

      if (isActive) {
        if(value == ""){
          borderColor = defaultColor
          displayValue = "none";
        } else {
          borderColor = hasZip(value) ? defaultColor : failColor;
          displayValue = hasZip(value) ? "inline" : "none";
        }
        c[2].style.setProperty("display",displayValue,"important");
      }
      return borderColor
    }

    const isNumber = (value, isActive = false, c) => {
      let borderColor = "";
      let displayValue = "";
      value = String(value);

      if (isActive) {
        if(value == ""){
          borderColor = defaultColor
          displayValue = "none";
        } else {
          borderColor = hasNumber(value) ? defaultColor : failColor;
          displayValue = hasNumber(value) ? "inline" : "none";
        }
        c[2].style.setProperty("display",displayValue,"important");
      }
      return borderColor
    }

    const isStreet = (value, isActive = false, c) => {
      let borderColor = "";
      let displayValue = "";
      value = String(value);

      if (isActive) {
        if(value == ""){
          borderColor = defaultColor
          displayValue = "none";
        } else {
          borderColor = hasStreet(value) ? defaultColor : failColor;
          displayValue = hasStreet(value) ? "inline" : "none";
        }
        c[2].style.setProperty("display",displayValue,"important");
      }
      return borderColor
    }

    const isCity = (value, isActive = false, c) => {
      let borderColor = "";
      let displayValue = "";
      value = String(value);

      if (isActive) {
        if(value == ""){
          borderColor = defaultColor
          displayValue = "none";
        } else {
          borderColor = hasCity(value) ? defaultColor : failColor;
          displayValue = hasCity(value) ? "inline" : "none";
        }
        c[2].style.setProperty("display",displayValue,"important");
      }
      return borderColor
    }

    const isMeal = (value, isActive = false, c) => {
      let borderColor = "";
      let displayValue = "";
      value = String(value);

      if (isActive) {
        if(value == ""){
          borderColor = defaultColor
          displayValue = "none";
        } else {
          borderColor = hasMeal(value) ? defaultColor : failColor;
          displayValue = hasMeal(value) ? "inline" : "none";
        }
        c[2].style.setProperty("display",displayValue,"important");
      }
      return borderColor
    }

    const checkInput = (element, evalFunc) => {
      let value = element.value;
      var c = element.parentElement.children;
      element.style.borderColor = isActiveElement(element) ?
        evalFunc(value, true, c) : evalFunc(value, false, c);
      return;
    }
