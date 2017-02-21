describe('tester for PostCtrl in main.html', function() {
	var helper = jasmine.helper
	var ctrl;
	var promises = []

	beforeEach(module('frontendApp'))	

	beforeEach(module(function($provide) {
		$provide.value('apiService', helper.mockApiService)
	}))

	beforeEach(inject(function($controller, $rootScope, $q, apiService, UserService) {		
		helper.init($q)
 		ctrl = $controller('PostCtrl', {
			'apiService': apiService,
			'UserService': UserService
		})
		ctrl._resolveTestPromises = function() {
			helper.resolveTestPromises($rootScope)
		}
		ctrl._resolveTestPromises()
	}))

	it('should load posts and get 1 Test post', function() {
		ctrl.loadPost()
		ctrl._resolveTestPromises()
		expect(ctrl.posts.length).toBe(1)
		expect(ctrl.posts[0].author).toEqual('mengjin')
	})

	it('could add a post', function() {
		ctrl.newPost = "It is a addPost!"
		ctrl.addPost()
		ctrl._resolveTestPromises()
		expect(ctrl.posts.length).toBe(2)
		expect(ctrl.posts[1].body).toBe("It is a addPost!")
	})

	it('could edit a post', function() {
		ctrl.editedPost[3089592] = "It is a editedPost!"
		ctrl.username = 'mengjin'

		ctrl.editPost(3089592)
		ctrl._resolveTestPromises()
		expect(ctrl.posts[0].body).toBe("It is a editedPost!")
	})

	it('could add a comment', function() {
		ctrl.newComment[3089592] = "A new comment."

		expect(ctrl.posts[0].comments.length).toBe(2)
		ctrl.addComment(3089592)
		ctrl._resolveTestPromises()
		expect(ctrl.posts[0].comments.length).toBe(3)
		expect(ctrl.posts[0].comments[2].body).toBe("A new comment.")

	})

    it('could edit a comment', function() {
    	ctrl.showEditComment[8686503] = true
		ctrl.editedComment[8686503] = "A edited comment."

		ctrl.editComment(3089592, 8686503)
		ctrl._resolveTestPromises()
		expect(ctrl.posts[0].comments[1].body).toBe('A edited comment.')
	})

	it('keep username in UserService', inject(function(UserService) {
		inject(function($controller, $rootScope, $q, apiService, UserService) {		
			helper.init($q)
	 		ctrl2 = $controller('LoginCtrl', {
				'apiService': apiService,
				'UserService': UserService
			})
			ctrl2._resolveTestPromises = function() {
				helper.resolveTestPromises($rootScope)
			}
			ctrl2._resolveTestPromises()
		})

		ctrl2.username = 'mengjin'
		ctrl2.login();
		ctrl2._resolveTestPromises()
		//console.log(UserService.username)
		expect(ctrl.getUsername()).toBe('mengjin');
	}))

})