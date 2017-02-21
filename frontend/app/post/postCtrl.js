angular.module('frontendApp')
	.controller('PostCtrl',PostCtrl)

PostCtrl.$inject = ['apiService', 'UserService', '$rootScope']
function PostCtrl(apiService, UserService, $rootScope) {
	var vm = this;
	vm.username = UserService.username
	vm.getUsername = function() { return UserService.username }
	//console.log(vm.getUsername())
	vm.posts = []
	vm.comments = []
	vm.editedComment = []
	vm.editedPost = []
	vm.newComment = []
	vm.newPost = ''

    vm.loadPost = loadPost
    vm.addPost = addPost //this two functions are used in main.html
    vm.cancelNewPost = cancelNewPost

    vm.showEditPost = showEditPost
    vm.editPost = editPost


    vm.showComment = showComment
    vm.addComment = addComment
    vm.editComment = editComment

    vm.setFile = setFile
    vm.imgFile = null;
    vm.fileName = "no file chosen"

    //following 3 vars decide the show/hidden
    vm.edit = []
    vm.comment = []
    vm.numOfComment = [];
    vm.showEditComment = []

    loadPost()

    function setFile(theFile){
    	
    	vm.imgFile = theFile[0]
    	vm.fileName = vm.imgFile.name
    	theFile[0] = null

		$rootScope.$apply()
    	/*var img = document.createElement("img");
	    img.classList.add("obj");
	    img.file = theFile[0];
	    vm.newPostImg = img; 

	    var reader = new FileReader();
	    reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
	    reader.readAsDataURL(theFile[0]);*/  
    }

	function loadPost() {
		vm.posts.length = 0
		apiService.getPosts().$promise.then(function(result) {
			//console.log('load post', result)
			result.posts.forEach(function(post) {
				vm.posts.push(post)
			})
			vm.posts.forEach(function(post) {
				vm.numOfComment[post.id] = post.comments.length;
				post.date = new Date(post.date)
				post.comments.forEach(function(comment){
					comment.date = new Date(comment.date)
				})
			})
		})
	}

	function addPost(){
		if(vm.newPost){
			if(vm.imgFile){
				//console.log("vm.newPost", vm.newPost)
				//console.log("vm.imgFile", vm.imgFile)
				apiService.uploadPostImg({ body: vm.newPost, img: vm.imgFile }).$promise.
				then(function(result){
		    		//console.log('add post with img', result)
		    		result.posts[0].date = new Date(result.posts[0].date)
		    		vm.posts.push(result.posts[0])
					vm.newPost = ''
		    		vm.imgFile = null
		    		vm.fileName = "no file chosen"
		    		vm.numOfComment[result.posts[0].id] = result.posts[0].comments.length;
		    	})
			} else {
				apiService.addPosts({ body: vm.newPost }).$promise.
				then(function(result){
					//console.log('add post', result)
					result.posts[0].date = new Date(result.posts[0].date)
					vm.posts.push(result.posts[0])
					vm.newPost = ''	
					vm.fileName = "no file chosen"
					vm.numOfComment[result.posts[0].id] = result.posts[0].comments.length;
				})
			}
		}
	}

	function cancelNewPost(){
		vm.newPost = ''
	}

	function showEditPost(postId){
		vm.edit[postId] = vm.edit[postId] ? null : true
	}

	function editPost(postId){
		var index = vm.posts.findIndex(function(post) { 
             return post.id === postId 
        })
        //console.log(vm.posts[index].author)
		if(index >= 0 && vm.editedPost[postId] && vm.posts[index].author == vm.username){
			apiService.editPosts({ id:postId, body:vm.editedPost[postId] }).$promise.
			then(function(result){
				//console.log('edit post', result)
				vm.posts[index].body = result.posts[0].body
				vm.editedPost[postId] = ''
			})
		}
	}

	function showComment(postId){
		vm.comment[postId] = vm.comment[postId] ? null : true
	}

	function addComment(postId){
		var postIndex = vm.posts.findIndex(function(post) { 
             return post.id === postId 
        })

        if(postIndex >= 0 && vm.newComment[postId]){
			apiService.editPosts({ user:postId, body:vm.newComment[postId], commentId:-1 }).$promise.
			then(function(result){
				//console.log('add comment', result)
				result.posts[0].comments.forEach(function(comment){
					comment.date = new Date(comment.date)
				})
				vm.posts[postIndex].comments = result.posts[0].comments
				vm.newComment[postId] = ''
				vm.numOfComment[result.posts[0].id] = result.posts[0].comments.length;
			})
		}

	}

	function editComment(postId, commentId){
		if (!vm.showEditComment[commentId]){
			vm.showEditComment[commentId] = true
		} else {
			var postIndex = vm.posts.findIndex(function(post) { 
	             return post.id === postId 
	        })
	        //console.log(vm.posts)
	        var commentIndex = vm.posts[postIndex].comments.findIndex(function(comment) { 
	             return comment.commentId === commentId 
	        })

	        //console.log(vm.posts[postIndex].comments[commentIndex].author)
	        
	        if(postIndex >= 0 && commentId >= 0 && vm.editedComment[commentId] ){
				apiService.editPosts({ id:postId, body:vm.editedComment[commentId], commentId: commentId }).$promise.
				then(function(result){
					//console.log('edit comment', result)
					vm.posts[postIndex].comments[commentIndex].body = result.posts[0].comments[commentIndex].body
					vm.editedComment[commentId] = ''
					vm.showEditComment[commentId] = null	
				})
			}
		}
	}

}

