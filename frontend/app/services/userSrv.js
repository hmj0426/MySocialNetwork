;(function() {
'use strict'

angular.module('frontendApp')
	.factory('UserService', UserService)


function UserService() {
	return { username: '' }
}


})()