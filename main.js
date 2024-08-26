
function Validator(options) {
    // Lấy thẻ form-group
    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {}
    // Hàm thực hiện validate 
    function validate(inputElement, rule) {
        var parentElement = getParent(inputElement, options.formGroupSelector);
        var messageElement = parentElement.querySelector(options.errorSelector);
        var errorMessage;

        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        //lặp qua từng rules  & kiểm tra 
        for(var i = 0; i < rules.length; i++) {
            switch (inputElement.type){
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if(errorMessage) break;
        }

        if(errorMessage){ 
            messageElement.innerText = errorMessage;
            parentElement.classList.add('invalid');
        }else{
            messageElement.innerText = '';
            parentElement.classList.remove('invalid');
        } 

        return !errorMessage;
    }

    // Ẩn validate khi input giá trị vào
    function validateOninput(inputElement) {
        var parentElement = getParent(inputElement, options.formGroupSelector);
        var messageElement = parentElement.querySelector(options.errorSelector)

        messageElement.innerText = '';
        parentElement.classList.remove('invalid');
    }


    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form);

    if(formElement){
        // Khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();
            var isFormValid = true;

            // Thực hiện lặp qua từng rule và validate
            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector);
                    var isValid = validate(inputElement, rule)
                    if(!isValid){
                        isFormValid = false;
                    }
            })

            if(isFormValid){

                // Trường hợp submit với javascript
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInputs).reduce((values,input) => {
                        switch(input.type){
                            case 'radio':
                                if(input.matches(':checked')){
                                    values[input.name] = input.value;
                                }
                                break;
                            case 'checkbox':
                                if(Array.isArray(values[input.name])){
                                    if(input.matches(':checked')){
                                        values[input.name].push(input.value);
                                    }
                                }else{
                                    if(input.matches(':checked')){
                                        values[input.name] = [input.value];
                                    }else{
                                        values[input.name] = '';
                                    }
                                }
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                                break;
                        }

                        // values[input.name] = input.value
                        return values;
                    },{});

                    options.onSubmit(formValues)
                }else {
                    // Trường hợp submit với hành vi mặc định
                    formElement.submit();
                }
            }
        }

        // Lặp qua từng rules  & kiểm tra
        options.rules.forEach(rule => {

            //lưu lại các rule cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            }else{
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(inputElement => {
                if(inputElement){
    
                    // Khi người dùng blur vào input thì sẽ thực hiện validate
                    inputElement.onblur = () => {
                        validate(inputElement, rule)
                    };
    
                    // Khi người dùng click vào input thì sẽ thực hiện validate
                    inputElement.oninput = () => {
                        validateOninput(inputElement);
                    };

                    // Khi người dùng thay đổi giá trị
                    inputElement.onchange = () => {
                        validate(inputElement, rule)
                    };
                }
            })

        });

    }
}

// Định nghĩa các rules
// Nguyên tắc của các rules
// 1. khi có lỗi trả ra message lỗi
// 2. khi không có lỗi không trả ra message
Validator.isRequired = function(selector, message){
    return {
        selector: selector,
        test: function(value){
            return value ? undefined : message || 'Vui lòng nhập trường này';
        }
    }
}

Validator.isEmail = function(selector){
    return {
        selector: selector,
        test: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Vui lòng nhập đúng định dạng email';
        }
    }
}

Validator.minLength = function(selector, min, message){
    return {
        selector: selector,
        test: function(value){
            return value.length >= min? undefined : message ||  `Mật khẩu phải có ít nhât ${min} kí tự`;
        }
    }
}

Validator.minLength = function(selector, min, message){
    return {
        selector: selector,
        test: function(value){
            return value.length >= min? undefined : message || `Mật khẩu phải có ít nhât ${min} kí tự`;
        }
    }
}

Validator.isConfirmed = function(selector , getConfirValue, message){
    return {
        selector: selector,
        test: function(value){
            return value === getConfirValue() ? undefined : message || 'Giá trị nhập vào không trùng khớp';
        }
    }
}