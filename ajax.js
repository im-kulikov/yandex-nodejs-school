"use strict"

const actions = [
    'answer.error.json',
    'answer.progress.json',
    'answer.success.json',
]

// Рандомное значение для url:
const randomAction = () => {
return './' + actions[Math.floor(Math.random()*actions.length)]
}

const ajax = (url, callback, data)=> {

    const sendRequest = (url,callback,postData) => {
        const req = createXMLHTTPObject();
        
        if (!req) return;
        
        const method = (postData) ? "POST" : "GET";
        
        req.open(method,url,true);
        
        if (postData) {
            req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
        }
            
        req.onreadystatechange = function (event) {
            if (req.readyState != 4) return;
            
            if (req.status != 200 && req.status != 304) {
                return;
            }

            let response = JSON.parse(req.responseText)
            
            callback(response);
        }
        
        if (req.readyState == 4) return;
        
        req.send(postData);
    }

    const XMLHttpFactories = [
        function () {return new XMLHttpRequest()},
        function () {return new ActiveXObject("Msxml3.XMLHTTP")},
        function () {return new ActiveXObject("Msxml2.XMLHTTP.6.0")},
        function () {return new ActiveXObject("Msxml2.XMLHTTP.3.0")},
        function () {return new ActiveXObject("Msxml2.XMLHTTP")},
        function () {return new ActiveXObject("Microsoft.XMLHTTP")}
    ];

    const createXMLHTTPObject = () => {
        let xmlhttp = false;
        
        for (let i=0; i < XMLHttpFactories.length; i++) {
            try {
                xmlhttp = XMLHttpFactories[i]();
            } catch (e) {
                continue;
            }

            break;
        }
        return xmlhttp;
    }

    // url += '?_=' + (new Date()).getTime()

    return sendRequest(url, callback, data)
}