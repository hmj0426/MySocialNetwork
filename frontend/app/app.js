;(function() {
'use strict'

angular.module('frontendApp', ['ngRoute', 'ngResource'])
	.config(config)  //is ng-resource needed?
	;

function config($routeProvider) {
	$routeProvider
	.when('/login', {
		templateUrl: 'app/login/login.html',
		controller: 'LoginCtrl',
		controllerAs: 'vm'
	})

	.when('/main', {
		templateUrl: 'app/main.html',
	})

	.when('/profile', {
		templateUrl: 'app/profile/profile.html',
		controller: 'ProfileCtrl',
		controllerAs: 'vm'
	})

	.otherwise({
		redirectTo: '/login'
	})
}


})()


