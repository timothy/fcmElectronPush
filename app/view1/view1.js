'use strict';

angular.module('myApp.view1', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {
            templateUrl: 'view1/view1.html',
            controller: 'View1Ctrl'
        });
    }])

    .controller('View1Ctrl', ['$http', '$scope', function ($http, $scope) {

        $scope.checkboxModel = {
            remember: true
        };

        $scope.hasTried = false;
        $scope.loading = false;
        $scope.pushHandle = {message: ""};
        $scope.theForm = {
            authKey:'',
            topic: 'all',
            title: '',
            body:''
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

            dataPayload.to = "/topics/" + $scope.theForm.topic;
            dataPayload.notification.title = $scope.theForm.title;
            dataPayload.notification.body = $scope.theForm.body;

            req.data = dataPayload;
            req.headers.Authorization = 'key=' + $scope.theForm.authKey;

            console.log(req);
            $scope.hasTried = true;
            if (formData.$valid) {
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
            }
        };

    }]);