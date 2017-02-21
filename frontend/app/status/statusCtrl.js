angular.module('frontendApp')
	.controller('StatusCtrl',StatusCtrl)
	;

StatusCtrl.$inject = ['$location', 'apiService', 'UserService']
function StatusCtrl($location, apiService, UserService) {
	var vm = this
	vm.status = ''
	vm.username = ''
	vm.newUserStatus = ''
	vm.userImg = ''

	vm.logout = logout
	vm.profile = profile

	vm.getStatus = getStatus
	vm.updateStatus = updateStatus

	getStatus()

	vm.getUsername = function() { return UserService.username }

	function logout(){
		apiService.logout().$promise.
		then(function(result){
			//console.log('log out', result)
			vm.username = ''
	        vm.status =''
	        vm.newUserStatus =''
	        $location.path('/login')

	        UserService.username = undefined
		})
	}

	function profile(){
		$location.path('/profile')
	}

	function getStatus(){
		apiService.getStatus().$promise.
		then(function(result){
			//console.log('load status', result)
			vm.status = result.statuses[0].status
			vm.username = result.statuses[0].username
			//vm.newUserStatus = vm.status
		})

		apiService.getImg().$promise.
		then(function(result){
			//console.log("get img", result)
			vm.userImg = result.pictures[0].picture
		})
	}

	function updateStatus(){
		apiService.setStatus({ status: vm.newUserStatus }).$promise.
		then(function(result){
			//console.log('update status', result)
			vm.status = result.statuses[0].status
			vm.newUserStatus = ''
		})
	}
}