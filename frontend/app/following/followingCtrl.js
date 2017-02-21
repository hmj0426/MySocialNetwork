angular.module('frontendApp')
	.controller('FollowingCtrl',FollowingCtrl)
	;

/*FollowingCtrl.$inject = ['apiService', 'UserService', '$controller', function(apiService, UserService){
	var PostCtrl = $controller('PostCtrl',{
		'apiService':apiService,
		'UserService':UserService
	})
}]*/

FollowingCtrl.$inject = ['apiService', 'UserService', '$controller', '$scope']

function FollowingCtrl(apiService, UserService, $controller, $scope) {
	/*var PostCtrlVm = $scope.$new();
	$controller('PostCtrl',{
		'apiService':apiService,
		'UserService':UserService,
		$scope: PostCtrlVm
	}) */

	var vm = this
	vm.followings = []
	vm.newFollowing = ""

	vm.loadFollowings = loadFollowings;
	vm.unfollow = unfollow;
	vm.addFollowing = addFollowing;
	vm.failAddFollowing = false

	loadFollowings();

	function loadFollowings(){
		vm.followings.length = 0;
		//first get the following list
		apiService.getFollowings().$promise.
		then(function(result){
			//console.log('get followings', result);
			result.following.forEach(function(following){
				//for each following, get the status 
				apiService.getStatuses( { user: following } ).$promise.
				then(function(statusResult){
					//console.log('get followings status', statusResult);
					//for each following, get its profile picture
					apiService.getImgs( { user: following } ).$promise.
					then(function(imgResult){
						//console.log('get following img', imgResult)
						vm.followings.push( {
							"name": following, 
							"status": statusResult.statuses[0].status,
							"img": imgResult.pictures[0].picture
						} )
						//console.log('followings', vm.followings)
					})

				})
			})
		})
	}

	function unfollow(unfollowName){
		//console.log('followings before unfollow:', vm.followings)
		//delete chosen the following from the view of page
		vm.followings.forEach(function(following, index){
				if(following.name == unfollowName){
					vm.followings.splice(index, 1)
				}
			})
		//delete the following in the server
		apiService.deleteFollowing( { user: unfollowName } ).$promise.
		then(function(result){
			//console.log('unfollow', result);			
			//console.log('followings after unfollow:', vm.followings)
		})
	}

	function addFollowing(){
		/*In order to call loadFollowings() which will cause heavy cost, 
		  get image and picture for the new following and push that to the view*/
		apiService.addFollowing( { user: vm.newFollowing } ).$promise.
		then(function(result){
			console.log('add following', result);
			if(result.following.length == vm.followings.length){
				vm.failAddFollowing = true
				//console.log("no such user")
			} else {
				apiService.getStatuses( { user: vm.newFollowing } ).$promise.
				then(function(statusResult){
					//console.log("status result", statusResult)
					apiService.getImgs( { user: vm.newFollowing } ).$promise.
					then(function(imgResult){
						//console.log("img result", imgResult)
						vm.followings.push( {
								"name": vm.newFollowing, 
								"status": statusResult.statuses[0].status,
								"img": imgResult.pictures[0].picture
							} )
						vm.newFollowing = ''
						vm.failAddFollowing = false
					})
				})	
			}		
		})

	}
		
	
}