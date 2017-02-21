describe('MengjinZone End to End Tests', function() {
	'use strict'

	beforeEach(function() {
		browser.get('/')
	})

	it('could register a new user', function() {
		register();
		browser.driver.sleep(1000)
		//test if the model title 'Notification' will get out or not
		expect(element(by.css('.modal-title')).getText()).toMatch('Notification')
	})

	it('could log in as your test user', function() {
		login();
		/*the landing page doesn't contain a part displaying the username, so if a username
		  can be detected, it means the page has gone to the main page.  */
		expect(element(by.css('#username')).getText()).toBe("mh58test")  
	})

	function register() {
		element(by.css('[placeholder="New Username"]')).sendKeys('abcd')
		element(by.css('[placeholder="eg. xxx@rice.edu"]')).sendKeys('hmj0426@163.com')
		element(by.css('[placeholder="eg. 77005"]')).sendKeys('77000')
		element(by.id('psw')).sendKeys('aa')
		element(by.id('psw2')).sendKeys('aa')

		element(by.css('[value="Register"]')).click();
	}

	function login() {
		element(by.id('login-username')).sendKeys('mh58test')
		element(by.id('login-password')).sendKeys('deep-cabin-bean')
		element(by.id('login-button')).click();  
	}

	it('could create a new post', function() {
		login();
		element.all(by.css('.post-body')).count().then(function(num) {
			element(by.css('[placeholder="Something want to say..."]')).sendKeys('My test post')
			element(by.id('new_post')).click();

			//test new post's body/author and the total number of posts
			expect(element.all(by.css('.post-body')).count()).toBe(num + 1)
			expect(element.all(by.css('.post-body')).first().getText()).toMatch('My test post')
			expect(element.all(by.css('.post-author')).first().getText()).toMatch('mh58test')
		})
	})

	it('could update status', function() {
		login();
		element(by.css('[placeholder="What is your new status?"]')).sendKeys('My test new status')
		element(by.css('#btn-update-status')).click();
		expect(element(by.css('#userstatus')).getText()).toMatch('My test new status')
	})

	function addFollowing() {
		//console.log(num)
		element(by.css('[placeholder="More followings?"]')).sendKeys('yz90')
		element(by.id('add-following')).click(); 
	}

	
	it('could add a following', function() {
		login();
		element.all(by.css('.following-name')).count().then(function(num) {
			addFollowing(); 
			// test the username of the new following and whether the num of followings increased by 1
			expect( element.all(by.css('.following-name')).last().getText() ).toMatch('yz90')
			expect( element.all(by.css('.following-name')).count() ).toBe( num + 1 )
		})
		
	})

	it('could remove a following', function() {

		/*first add a following, count the number of followings, then delete the following,
		  and test the total number of followings decreased by 1*/

		login();
		addFollowing(); 
		expect( element.all(by.css('.following-name')).last().getText() ).toMatch('yz90')

		element.all(by.css('.following-name')).count().then(function(num) {	
			//console.log(num)	
			element.all(by.css('.btn-unfollow')).last().click().then(function(){
				browser.driver.sleep(1000)
				expect( element.all(by.css('.following-name')).count() ).toBe( num - 1 )
			})			
		})					
	})

	it('could search a specific post', function() {
		login();
		element(by.css('[placeholder="Please type searching keywords here"]')).sendKeys('Only One Post Like This')
		//browser.driver.sleep(1000)
		//test the number of search result and its author name
		expect( element.all(by.css('.whole-post')).count() ).toBe(1)
		expect(element.all(by.css('.post-author')).first().getText()).toMatch('mh58test')
	})

	function goToProfile() {
		element(by.css('#profile-director')).click();
	}

	it('could successfully direct to the profile view', function() {
		login();
		goToProfile();
		//Only the profile page has a part displays "Change Your Profile"
		expect(element(by.css('#update-profile')).getText()).toMatch('Change Your Profile')
	})

	it('could update email in profile', function() {
		login();
		goToProfile(); 
		element(by.css('[placeholder="eg. xxx@rice.edu"]')).sendKeys('hmj0426@163.com')
		//browser.driver.sleep(1000)
		element.all(by.css('.updateP')).first().click();
		expect( element(by.id('profile_email')).getText() ).toMatch('hmj0426@163.com')
	
	})

	it('could update zipcode in profile', function() {
		login();
		goToProfile(); 
		element(by.model('vm.newZip')).sendKeys('12345')
		element.all(by.css('.updateP')).first().click();
		expect( element(by.css('#profile_zip')).getText() ).toMatch('12345')
		//browser.driver.sleep(1000)
	})

	it('could update password, and an alert will comes out', function() {
		login();
		goToProfile(); 
		element(by.model('vm.newPassword')).sendKeys('abcd')
		element.all(by.css('.updateP')).first().click();
		browser.driver.sleep(1000)
		//test if an alert comes out or not
		var alert = browser.switchTo().alert()
		expect( alert.getText() ).toMatch('The current password will not change')
		alert.accept()
	})


})

