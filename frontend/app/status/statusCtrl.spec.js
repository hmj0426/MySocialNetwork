describe('tester for StatusCtrl in main.html', function() {
	var helper = jasmine.helper
	var ctrl;
	var promises = []

	beforeEach(module('frontendApp'))	

	beforeEach(module(function($provide) {
		$provide.value('apiService', helper.mockApiService)
	}))

	beforeEach(inject(function($controller, $rootScope, $q, apiService, UserService) {		
		helper.init($q)
 		ctrl = $controller('StatusCtrl', {
			'apiService': apiService,
			'UserService':UserService
		})
		ctrl._resolveTestPromises = function() {
			helper.resolveTestPromises($rootScope)
		}
		ctrl._resolveTestPromises()
	}))


	it('should have a status', function() {
		expect(ctrl.status).not.toBeNull()
		expect(ctrl.status.length).not.toBe(0)
		expect(ctrl.status).toEqual("Test Status")

		expect(ctrl.userImg).not.toBeNull()
	})


	it('should update the status message', function() {
	  var newStatus = 'A new status message'  
	  ctrl.updateStatus(newStatus) 
	  ctrl._resolveTestPromises()
	  expect(ctrl.status).toBe(newStatus)
	})


	beforeEach(inject(function(UserService) {		
		ctrl.UserService = UserService
	}))

	it('should logout', inject(function(UserService) {
		UserService.username = 'mengjin'
		ctrl.logout(); 
		ctrl._resolveTestPromises()
		expect(UserService.username).not.toBeDefined()
	}))

	beforeEach(inject(function(UserService) {		
		ctrl.UserService = UserService
	}))

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
		//console.log(UserService.username)

		ctrl2.username = 'mengjin'
		ctrl2.login();
		ctrl2._resolveTestPromises()

		expect(ctrl.getUsername()).toBe('mengjin');
	}))	


})