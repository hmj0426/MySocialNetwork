angular.module('frontendApp')
	.controller('ProfileCtrl',ProfileCtrl)


ProfileCtrl.$inject = ['apiService', 'UserService', '$location', '$route']
function ProfileCtrl(apiService, UserService, $location, $route) {
	var vm = this
	vm.username = ''
	vm.email = ''
	vm.zipcode = ''

	vm.newEmail = ''
	vm.newZip = ''
	vm.newPassword = ''
	vm.modalUsername = ''
	vm.modalPsw = ''
	vm.facebookId = 'no linked third party account'
	vm.formAlert = false;
	vm.pswNotMatch = false; 
	vm.thirdPartyAccount = false;
	vm.failLinkAccount = false;
	vm.unlinkButton = false

	vm.main = main
	vm.loadProfile = loadProfile
	vm.updateProfile = updateProfile
	vm.setFile = setFile
	vm.linkAccountInfo = linkAccountInfo
	vm.linkAccount = linkAccount
	vm.unlinkAccount = unlinkAccount
	//vm.loginAgain = loginAgain

	loadProfile()

	function main(){
		$location.path('/main')
	}

	function linkAccountInfo(){
		$("#linkAccountModal").modal();
	}

	function linkAccount(){
		apiService.linkAccount({ linkUsername: vm.modalUsername, linkPsw: vm.modalPsw }).$promise.
		then(function(result){
			//console.log("link account result:", result)
			UserService.username = result.username
			vm.username = result.username
			vm.failLinkAccount = false
			$("#linkAccountModal").modal('hide');
			apiService.login({ 'username': vm.modalUsername, 'password': vm.modalPsw }).$promise.
			then(function(result){	
				loadProfile()
				vm.modalUsername = ''
				vm.modalPsw = ''
			})
		}, function(reason){
			console.log("fail, and reason is: ",reason)
			vm.failLinkAccount = true
		})		
	}

	function unlinkAccount(){
		/*if(vm.facebookId = 'no linked third party account'){
			console.log("err, there isn't a linked account for current user")
			return
		}*/
		apiService.unlinkAccount({ thirdPartyId: vm.facebookId }).$promise.
		then(function(result){
			//console.log("unlink account", result)
			vm.facebookId = 'no linked third party account'
			vm.unlinkButton = false
			$("#unlink").modal();
		})
	}

	function loadProfile(){
		apiService.getEmail().$promise.
		then(function(result){
			//console.log('get email',result)
			vm.username = result.username
			//console.log("vm.username:", vm.username)
			vm.email = result.email	
			vm.thirdPartyAccount = ( (new RegExp('@facebook')).test(result.username) ) ? true : false

			if(!vm.thirdPartyAccount){
				apiService.getLinkAccount().$promise.
				then(function(result){
					//console.log("get link account", result)
					if(result.facebookId){
						vm.facebookId = result.facebookId
						vm.unlinkButton = true
					}
				})
			}
		})
		apiService.getZip().$promise.
		then(function(result){
			//console.log('get zip', result)
			vm.zipcode = result.zipcode
		})
		apiService.getImg().$promise.
		then(function(result){
			//console.log("get img", result)
			vm.profileImg = result.pictures[0].picture
		})

	}

	function updateProfile(){
		/*if there is no input at all, or the only input is not valid, the alert will come 
		  out, otherwise the valid input(s) will be accepted and updated. */

		if(!( vm.newEmail || vm.newZip || vm.newPassword ) ){
			vm.formAlert = true;
		} else {
			vm.formAlert = false;
			vm.pswNotMatch = false;
			if(vm.newEmail && vm.newEmail!= vm.email){
				apiService.setEmail({ email: vm.newEmail }).$promise.
				then(function(result){
					//console.log('update email', result)
					vm.email = result.email
					vm.newEmail = ''
				})
			}
			if(vm.newZip && vm.newZip!= vm.zipcode ){
				apiService.setZip({ zipcode: vm.newZip }).$promise.
				then(function(result){
					//console.log('update zipcode', result)
					vm.zipcode = result.zipcode
					vm.newZip = ''
				})
			}
			if(vm.newPassword && vm.newPassword2){
				if(vm.newPassword != vm.newPassword2){
					vm.pswNotMatch = true
				}
				else {
					apiService.setPassword( { password: vm.newPassword }).$promise.
					then(function(result){
						//console.log('change password', result)
						alert("The current password " + result.status)  //?
						vm.newPassword = ''
						vm.newPassword2 = ''
					})
				} 				
			}

		}
	}

	function setFile(theFile) {
		//change the profile picture and give a notification to user
		apiService.uploadProfileImg({ img: theFile[0] }).$promise.
    	then(function(result){
    		//console.log(result)
    		vm.profileImg = result.picture
    		theFile[0] = null;
    		$("#profile_change").modal();
    	})
	}


}