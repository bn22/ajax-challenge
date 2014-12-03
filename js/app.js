"use strict";
/*
 app.js, main Angular application script
 define your module and controllers here
 */

//This is the url that refers to the Parse.com class
var reviewsUrl = 'https://api.parse.com/1/classes/reviews';

//This inputs the Application ID and Rest API Key so Parse.com knows which user account
//to store information about the Product Reviews
angular.module('ProductReviewApp', ['ui.bootstrap'])
    .config(function ($httpProvider) {
        $httpProvider.defaults.headers.common['X-Parse-Application-Id'] = 'rrH3oa7YXlW3rLUuJTpi0lrFvdWjfXpjbYHqgkXe';
        $httpProvider.defaults.headers.common['X-Parse-REST-API-Key'] = 'acxyWxAuUtxNYSo303rd6nnAm6fHZv8nZD47E7b4';
    })

//This creates a new ReviewController that is responsible for providing interaction between
//the webpage and Parse,com
    .controller('ReviewController', function ($scope, $http) {

//Whenever the user refreshes the page, the webpage looks for existing product reviews
//and sorts them by the number of votes descending
        $scope.refreshTasks = function () {
            $scope.loading = true;
            $http.get(reviewsUrl + '?order=-votes')
                .success(function (responseData) {
                    $scope.tasks = responseData.results;
                })
                .finally(function () {
                    $scope.loading = false;
                    document.getElementById('ajax').style.display = "none";
                })
        };

//This refreshes the page when the user first enters the webpage so the products
//reviews will be initially displayed
        $scope.refreshTasks();

//This initializes the new Product Review so that the ratings goes from 1-5 and the votes
//never go negative
        $scope.newTask = {exists: true, rating: 1, votes: 0};

//This adds a new Product Review to Parse.com based upon what the user has input
//into the form. In addition, it initializes the form to take another Product Review
        $scope.addTask = function () {
            $scope.inserting = true;
            $http.post(reviewsUrl, $scope.newTask)
                .success(function (responseData) {
                    $scope.newTask.objectId = responseData.objectId;
                    $scope.tasks.push($scope.newTask);
                    $scope.newTask = {exists: true, rating: 1, votes: 0};
                })
                .finally(function () {
                    $scope.inserting = false;
                });
        };

//This updates the information between the webpage and Parse.com. It is responsible for operations
//re-ordering the Product Reviews basedon the number of votes
        $scope.updateTask = function (task) {
            $http.put(reviewsUrl + '/' + task.objectId, task)
        };
//This allows the user to delete a comment if they are unhappy with any element of the review.
//It also deletes it from Parse.com
        $scope.deleteTask = function (task) {
            if (window.confirm('Are you sure you want to delete this comment?')) {
                $http.delete(reviewsUrl + '/' + task.objectId)
                    .success(function (responseData) {
                        $scope.refreshTasks();
                        document.getElementById('ajax').style.display = "none";
                    })
            }
        };

//This updates the information on Parse.com to reflect the number of votes for each Product Review.
//The increment operation helps the webpage keep track of multiple users attempting to change the score
//of a product review
        $scope.incrementVotes = function (task, amount) {
            if (task.votes > 0 || (task.votes == 0 && amount == 1) || (task.votes == null && amount == 1)) {
                var postData = {
                    votes: {
                        __op: "Increment",
                        amount: amount
                    }
                };
            }

            $scope.updating = true;
            $http.put(reviewsUrl + '/' + task.objectId, postData)
                .success(function (respData) {
                    task.votes = respData.votes
                })
                .error(function (err) {
                    console.log(err)
                })
                .finally(function () {
                    $scope.updating = false;
                });
        };

    }
)
;