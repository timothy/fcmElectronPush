'use strict';

angular.module('myApp.view1', ['ngRoute', 'ngSanitize'])

    .config(['$routeProvider', ($routeProvider) => {
        $routeProvider.when('/view1', {
            templateUrl: 'view1/view1.html',
            controller: 'View1Ctrl'
        });
    }])

    .controller('View1Ctrl', ['$http', '$scope', 'jsonWebView', ($http, $scope, jsonWebView) => {

        console.log(jsonWebView);

        $scope.checkboxModel = {
            remember: true
        };
        $scope.dataObj = {};
        $scope.prettyJson = false;

        $scope.hasTried = false;
        $scope.loading = false;
        $scope.pushHandle = {message: ''};
        $scope.theForm = {
            authKey: '',
            topic: 'all',
            title: '',
            body: '',
            data: {key: '', value: ''}
        };

        let dataPayload = {
            "to": "/topics/all",
            "content_available": true,
            "priority": "high",
            "notification": {
                "title": "default",
                "body": "default",
                "sound": "default",
                "click_action": "FCM_PLUGIN_ACTIVITY",
                "icon": "lu_today_icon_android"
            },
            "data": {
                "title": "Title test",
                "msg": "Text of the test",
                "code": 2
            }
        };

        let req = {
            method: 'POST',
            url: 'https://fcm.googleapis.com/fcm/send',
            headers: {
                'Authorization': 'key=',
                'Content-Type': 'application/json'
            },
            data: dataPayload
        };


        $scope.submit = (formData) => {
            if (!formData.$valid) return;

            dataPayload.to = "/topics/" + $scope.theForm.topic;
            dataPayload.notification.title = $scope.theForm.title;
            dataPayload.notification.body = $scope.theForm.body;
            dataPayload.notification.sound = ($scope.theForm.sound) ? $scope.theForm.sound : "default";
            dataPayload.notification.icon = ($scope.theForm.icon) ? $scope.theForm.icon : "";
            dataPayload.data = $scope.dataObj;

            req.data = dataPayload;
            req.headers.Authorization = 'key=' + $scope.theForm.authKey;

            console.log(req);
            $scope.hasTried = true;

            $scope.loading = true;
            $http(req).then((success) => {
                $scope.loading = false;
                console.log(success);
                $scope.pushHandle.message = "Push Successful";
                $scope.pushHandle.color = "green";
            }, (error) => {
                $scope.loading = false;
                console.log(error);
                $scope.pushHandle.message = "The following Error Occurred:" + JSON.stringify(error);
                $scope.pushHandle.color = "red";
            });

        };

        let temp = {key: []};//store the last instance

        $scope.addData = (key, value) => {
            if (!key) return;

            $scope.dataObj[key] = value;
            temp.key.push(key);
            console.log($scope.dataObj);
            $scope.theForm.data.key = "";
            $scope.theForm.data.value = "";
            $scope.prettyJson = jsonWebView.prettyPrint($scope.dataObj);
        };


        $scope.deleteLast = () => {
            if (!temp.key.length) return;

            delete $scope.dataObj[temp.key.pop()];
            $scope.prettyJson = jsonWebView.prettyPrint($scope.dataObj);
        };

    }])
    .factory("jsonWebView", () => {

           let replacer =  (match, pIndent, pKey, pVal, pEnd) => {
                let key = '<span class=json-key>';
                let val = '<span class=json-value>';
                let str = '<span class=json-string>';
                let r = pIndent || '';
                if (pKey)
                    r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
                if (pVal)
                    r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
                return r + (pEnd || '');
            };

            let prettyPrint =  (obj) => {
                let jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
                return JSON.stringify(obj, null, 3)
                    .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
                    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    .replace(jsonLine, replacer);
            };

            return {
                prettyPrint: prettyPrint
            }
    });