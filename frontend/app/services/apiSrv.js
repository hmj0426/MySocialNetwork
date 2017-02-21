;(function() {
'use strict'

var isLocal = true
var apiURL = isLocal ? 'http://localhost:3000' : 'https://pacific-retreat-88579.herokuapp.com'

angular.module('frontendApp')
	.constant('apiURL', apiURL) 
	.factory('apiService', apiService)
	;

function apiService($http, $resource, apiURL, UserService) {
    $http.defaults.withCredentials = true
	return $resource(apiURL + '/:endpoint/:user/:id', { user:'@user', id:'@id' },  
		{
            login    : { method:'POST', params: {endpoint: 'login'  } },
            logout   : { method: 'PUT' , params: {endpoint: 'logout'  } },
            register  : { method: 'POST' , params: {endpoint: 'register'  } },

            linkAccount: { method: 'PUT', params: { endpoint: 'linkAccount' } },
            getLinkAccount: { method: 'GET', params: {endpoint: 'linkAccount' } },
            unlinkAccount: { method: 'PUT', params: { endpoint: 'unlinkAccount' } },

			getStatus: { method:'GET', params: { endpoint: 'status'} },
			getStatuses: { method:'GET', params: { endpoint: 'statuses'}},
			setStatus: { method:'PUT', params: {endpoint: 'status'} },
			getImg: { method: 'GET', params: {endpoint: 'pictures'} },
			getImgs: { method: 'GET', params: {endpoint: 'pictures'} },

			getPosts : { method:'GET', params: {endpoint: 'posts' } },  
			editPosts : { method:'PUT', params: {endpoint: 'posts'} }, 
			addPosts : { method:'POST', params: {endpoint: 'post' } },

			getFollowings: { method:'GET', params: {endpoint: 'following'} },
			addFollowing: { method:'PUT', params: {endpoint: 'following'} }, 
			deleteFollowing: { method:'DELETE', params: {endpoint: 'following'} },

			getEmail: { method: 'GET', params: {endpoint: 'email'} },
			getZip: { method: 'GET', params: {endpoint: 'zipcode'} },
			setEmail: { method: 'PUT', params: {endpoint: 'email'} },
			setZip: { method: 'PUT', params: {endpoint: 'zipcode'} },
			setPassword: { method: 'PUT', params: {endpoint: 'password'} },

			uploadPostImg: {
				method: 'POST',
				headers: { 'Content-Type': undefined },
				transformRequest: resourceUploadFile,
				params: { endpoint: 'post'}
			},

			uploadProfileImg: { 
	          method: 'PUT', 
	          headers: { 'Content-Type': undefined },
	          transformRequest: resourceUploadFile,
	          params: { endpoint: 'picture' }
	    	}
		})

	function resourceUploadFile(data) {
		//console.log("data", data)
    	var fd = new FormData()  
		fd.append('image', data.img)
		fd.append('body', data.body)
		return fd;
	}
}


})()