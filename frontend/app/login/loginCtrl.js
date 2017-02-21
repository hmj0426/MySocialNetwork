angular.module('frontendApp')
	.controller('LoginCtrl',LoginCtrl)
	//.factory('UserService', UserService)
	;

LoginCtrl.$inject = ['$location','apiService', 'UserService','apiURL']
function LoginCtrl($location, apiService, UserService, apiURL) {
	var vm = this
	vm.username = ''
	vm.password = ''

	vm.registerUsername = ''
	vm.registerEmail = ''
	vm.registerZip = ''
	vm.registerPsw = ''
	vm.registerPsw2 = ''

	vm.pswUnmatch = false

	vm.login = login
	vm.fblogin = fblogin
	vm.register = register

	vm.usedUsername = false
	vm.failLogin = false

	function login(){
		apiService.login({ 'username': vm.username, 'password': vm.password }).$promise.
		then(function(result){
			if(result.result == 'success' && vm.username == result.username){
				//console.log('login:', result)
				UserService.username = vm.username
				vm.username = ''
				vm.password = ''
				$location.path('main')
			} 
		}, function(reason){
				//console.log('fail to log in ', reason)
				vm.failLogin = true
			})
	}

	function fblogin(){
		window.location = apiURL + "/login/facebook"
	}

	function register(){
		vm.pswUnmatch = false
		vm.usedUsername = false
		if( vm.registerPsw && vm.registerPsw2 != vm.registerPsw){
			vm.pswUnmatch = true
			vm.registerPsw = ''
			vm.registerPsw2 = ''
		} else if( vm.registerUsername && vm.registerEmail && vm.registerZip && vm.registerPsw){
			apiService.register( { 
				username: vm.registerUsername,
				email: vm.registerEmail,
				zipcode: vm.registerZip,
				password: vm.registerPsw
			}).$promise.then(function(result){
				//console.log('register', result)
				vm.registerUsername = ''
				vm.registerEmail = ''
				vm.registerZip = ''
				vm.registerPsw = ''
				vm.registerPsw2 = ''
				$("#register").modal();
			}, function(error){
				//console.log("dupilicated user")
				vm.usedUsername = true
			})
		}		
	}
}