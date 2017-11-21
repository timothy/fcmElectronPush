'use strict';

angular.module('myApp.view1', ['ngRoute','ngSanitize'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {
            templateUrl: 'view1/view1.html',
            controller: 'View1Ctrl'
        });
    }])

    .controller('View1Ctrl', ['$http', '$scope', function ($http, $scope) {
        if (!library)
            var library = {};

        library.json = {
            replacer: function(match, pIndent, pKey, pVal, pEnd) {
                var key = '<span class=json-key>';
                var val = '<span class=json-value>';
                var str = '<span class=json-string>';
                var r = pIndent || '';
                if (pKey)
                    r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
                if (pVal)
                    r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
                return r + (pEnd || '');
            },
            prettyPrint: function(obj) {
                var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
                return JSON.stringify(obj, null, 3)
                    .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
                    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    .replace(jsonLine, library.json.replacer);
            }
        };


        $scope.checkboxModel = {
            remember: true
        };
        $scope.dataObj = {};
        $scope.prettyJson = false;

        $scope.hasTried = false;
        $scope.loading = false;
        $scope.pushHandle = {message: ''};
        $scope.theForm = {
            authKey:'',
            topic: 'all',
            title: '',
            body:'',
            data: {key:'',value:''}
        };

        var dataPayload = {
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

        var req = {
            method: 'POST',
            url: 'https://fcm.googleapis.com/fcm/send',
            headers: {
                'Authorization': 'key=',
                'Content-Type': 'application/json'
            },
            data: dataPayload
        };


        $scope.submit = function (formData) {
            if (!formData.$valid) return;

            dataPayload.to = "/topics/" + $scope.theForm.topic;
            dataPayload.notification.title = $scope.theForm.title;
            dataPayload.notification.body = $scope.theForm.body;
            dataPayload.notification.sound = ($scope.theForm.sound) ? $scope.theForm.sound: "default";
            dataPayload.notification.icon = ($scope.theForm.icon) ? $scope.theForm.icon: "";
            dataPayload.data = $scope.dataObj;

            req.data = dataPayload;
            req.headers.Authorization = 'key=' + $scope.theForm.authKey;

            console.log(req);
            $scope.hasTried = true;

                $scope.loading = true;
                $http(req).then(function (success) {
                    $scope.loading = false;
                 console.log(success);
                    $scope.pushHandle.message = "Push Successful";
                    $scope.pushHandle.color = "green";
                }, function (error) {
                    $scope.loading = false;
                    console.log(error);
                    $scope.pushHandle.message = "The following Error Occurred:" + JSON.stringify(error);
                    $scope.pushHandle.color = "red";
                });

        };

        var temp = {key:[]};//store the last instance

        $scope.addData = function (key,value) {
            if(!key) return;

            $scope.dataObj[key] = value;
            temp.key.push(key);
            console.log($scope.dataObj);
            $scope.theForm.data.key = "";
            $scope.theForm.data.value = "";
            $scope.prettyJson = library.json.prettyPrint($scope.dataObj);
        };


        $scope.deleteLast = function () {
            if(!temp.key.length) return;

            delete $scope.dataObj[temp.key.pop()];
            $scope.prettyJson = library.json.prettyPrint($scope.dataObj);
        };

    }]);