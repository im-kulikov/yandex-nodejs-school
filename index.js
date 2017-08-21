"use strict"

const MyForm = (() => {
    let self = {}

    const allowedDomains = [
            'ya.ru',
            'yandex.ru',
            'yandex.ua',
            'yandex.by',
            'yandex.kz',
            'yandex.com'
        ],
        wordsCount = 3,
        phoneSum = 30

    let values = {
        fio: "",
        email: "",
        phone: ""
    }

    let form,         // HTML-форма
        submitButton, // Кнопка для submit
        fillButton,   // Я лентяй, пусть кнопка запоняет      
        resultDiv,    // Результирующий div
        // Поля формы, с которыми будем работать:
        formFields = {
            fio: null,
            email: null,
            phone: null
        }

    const rules = {
        // Метод валидации ФИО:
        fio: val => {
            return val
                // Разбиваем по пробелу:
                .split(/\s/g)
                // Проверяем, на соответствие "словам" (/[а-яёa-z]+/i):
                .map(item => {
                    return /[а-яёa-z]+/i.test(item)
                })
                // Оставляем только "положительные" результаты:
                .filter(item => item === true)
                // Поле должно содержать все слова:
                .length == wordsCount
        },
        
        // Метод валидации почты:
        email: val => {
            let items = val.match(/[a-zA-Z1-9\-\._]+@([a-z1-9.]+){1}/i)

            // проверяем на наличие всех чанков:
            if (items.length != 2 ) return false

            // Можно было бы решить с помощью regexp, но выходило громоздко.
            // Проверяем домены:
            return allowedDomains.includes(items[1])
        },
        
        // Метод валидации телефона:
        phone: val => {
            // Проверяем на соответствие формату:
            let result = /\+7\([\d+]{3}\)[\d+]{3}\-[\d+]{2}\-[\d+]{2}/i.test(val)

            // Проверяем сумму всех цифр в телефоне:
            if (result) {
                let sum = 0
                val                                       // Наш телефон
                    .replace(/[^\d]/g, "")                // Убираем всё что не есть цифра
                    .match(/(\d){1}/g)                    // Разбиваем на массив
                    .forEach(num => sum += parseInt(num)) // Суммируем все цифры
                result = sum <= phoneSum
            }

            return result
        }
    }

    // Метод getData возвращает объект с данными формы,
    // где имена свойств совпадают с именами инпутов.
    self.getData = () => {
        return values
    }

    // Метод setData принимает объект с данными формы
    // и устанавливает их инпутам формы.
    // Поля кроме phone, fio, email игнорируются.
    self.setData = obj => {
        Object.keys(formFields).forEach(field => {
            if (!!obj[field]) {
                formFields[field].value = obj[field]
                
                // Имитация изменения (просто чтобы валидировать):
                var event = document.createEvent("HTMLEvents");
                event.initEvent("change", false, true);
                formFields[field].dispatchEvent(event);
            }
        })
    }

    // Метод validate возвращает объект с признаком результата валидации (isValid)
    // и массивом названий полей, которые не прошли валидацию (errorFields).
    self.validate = () => {
        // Получаем названия полей:
        let items = Object.entries(rules)
        
        let result = {
            isValid: false,
            errorFields: [],
        }
        
        result.isValid = items
            // Идём по полям и проверяем их:
            .map(item => {
                let field = item[0],
                    rule = item[1]
                
                if (!values[field]) {
                    result.errorFields.push(field)
                    return false
                }

                if (!rule(values[field])) {
                    result.errorFields.push(field)
                    return false
                }

                return true
            })
            // Оставляем только "положительные" результаты:
            .filter(value => value == true)
            // Все поля 
            .length == items.length

        // Блокируем кнопку :)
        submitButton.disabled = !result.isValid

        return result
    }

    // Если валидация прошла успешно, кнопка отправки формы должна стать неактивной
    // и должен отправиться ajax-запрос
    let isSubmited = false

    // Метод submit выполняет валидацию полей и отправку ajax-запроса,
    // если валидация пройдена. Вызывается по клику на кнопку отправить.
    self.submit = () => {
        if (isSubmited) return

        // На всякий случай, если будет прямое обращение:
        let result = self.validate()
        if (!result.isValid) return

        submitButton.disabled = true

        let url = randomAction(),
            data = new FormData(form)
        
        isSubmited = true

        try {
            ajax(url, response => { 
                resultDiv.classList.remove('success')
                resultDiv.classList.remove('error')
                resultDiv.classList.remove('progress')
                resultDiv.textContent = ''

                switch (response.status) {
                    case "success":
                        isSubmited = false
                        submitButton.disabled = false
                        resultDiv.classList.add('success')
                        resultDiv.textContent = "Success"
                        break;
                    case "error":
                        isSubmited = false
                        submitButton.disabled = false
                        resultDiv.classList.add('error')
                        resultDiv.textContent = response.reason
                        break;
                    case "progress":
                        resultDiv.classList.add('progress')
                        setTimeout(() => {
                            isSubmited = false
                            self.submit()
                        }, response.timeout)
                        break;
                    default:
                        isSubmited = false
                        break;
                }
            }, data)
        } catch (e) {
            isSubmited = false
            submitButton.disabled = false
        }
    }

    // DocumentReady:
    window.addEventListener('load', e => {
        // === Связываем поля: === //
        // Наша форма
        form = document.querySelector('#myForm')
        
        // поле ФИО
        formFields['fio'] = form.querySelector('[name="fio"]')
        
        // поле Email
        formFields['email'] = form.querySelector('[name="email"]')
        
        // поле Телефона
        formFields['phone'] = form.querySelector('[name="phone"]')
        
        // наша кнопка, альтернативно - form.querySelector('.form__submit')
        submitButton = document.querySelector('#submitButton')
        
        // кнопка для заполенния:
        fillButton = document.querySelector('#setButton')
        
        // поле ответа
        resultDiv = document.querySelector('#resultContainer')
        
        // === Подписка на события: === //
        
        // Отправка формы:
        form.addEventListener('submit', e => {
            // Убираем действие по-умолчанию:
            e.preventDefault()
            
            // выполняет валидацию полей и отправку ajax-запроса, если валидация пройдена:
            MyForm.submit()

        })
        
        // Устал вбивать данные, сделал кнопку:
        fillButton.addEventListener('click', e => {
            self.setData({
                fio: "Иванов Иван Иванович",
                email: "ivanov777@yandex.by",
                phone: "+7(111)222-33-11"
            })
        })

        // Получаем название полей и обходим каждый:
        Object.entries(formFields).forEach(item => {
            let fieldName = item[0],
                fieldInput = item[1]

            fieldInput.addEventListener('change', e => {
                values[fieldName] = e.target.value
                
                let result = self.validate()

                if (result.errorFields.includes(fieldName)) {
                    fieldInput.classList.add('error')
                    fieldInput.classList.remove('success')
                } else {
                    fieldInput.classList.add('success')
                    fieldInput.classList.remove('error')
                }
            })
        });

        self.validate()
    })

    return self
})()