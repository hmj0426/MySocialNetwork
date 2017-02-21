describe('tester for LoginCtrl in login.html', function() {
	var helper = jasmine.helper
	var ctrl;
	var promises = []

	beforeEach(module('frontendApp'))	

	beforeEach(module(function($provide) {
		$provide.value('apiService', helper.mockApiService)
	}))

	beforeEach(inject(function($controller, $rootScope, $q, apiService, UserService) {		
		helper.init($q)
 		ctrl = $controller('LoginCtrl', {
			'apiService': apiService,
		})
		ctrl._resolveTestPromises = function() {
			helper.resolveTestPromises($rootScope)
		}
		ctrl._resolveTestPromises()

	}))

	beforeEach(inject(function(UserService) {		
		ctrl.UserService = UserService
	}))

	it('should login, save username', inject(function(UserService) {
		ctrl.username = 'mengjin'
		ctrl.login();
		ctrl._resolveTestPromises()

		// verify UserService has username
		expect(ctrl.UserService.username).toBeDefined()
		expect(ctrl.UserService.username).toBe('mengjin')
	}))

	it('should fail to log in when input wrong information', inject(function(UserService) {
		ctrl.username = 'wrong_name'
		ctrl.login();
		ctrl._resolveTestPromises()

		expect(ctrl.UserService.username).toBe('')
	}))


})