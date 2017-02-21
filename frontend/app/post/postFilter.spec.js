describe('Validate main page filter functionality', function () {

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
      'UserService':UserService
    })
    ctrl._resolveTestPromises = function() {
      helper.resolveTestPromises($rootScope)
    }
    ctrl._resolveTestPromises()
  }))


  it('the filter works when input "First"', inject(function(authorContentFilterFilter){
    expect(authorContentFilterFilter(ctrl.posts,"First").length).toBe(1)
  })) 

  it('the filter works when input "http"', inject(function(authorContentFilterFilter){
    expect(authorContentFilterFilter(ctrl.posts,"http").length).toBe(0)
  })) 

  it('the filter works when input "2015"', inject(function(authorContentFilterFilter){
    expect(authorContentFilterFilter(ctrl.posts,"2015").length).toBe(0)
  })) 

  it('the filter works when input "3089592"', inject(function(authorContentFilterFilter){
    expect(authorContentFilterFilter(ctrl.posts,"3089592").length).toBe(0)
  })) 

});