/*
 * Test suite for profile.js
 */

var request = require('request')

function url(path) {
	return "http://localhost:3000" + path
}

describe('Validate status and profile functionality', function() {
	
	it('should update a status and change it back', function(done) {
		// firstly get the current status
		request({
			url: url("/status/"),
			method: 'GET'
		}, function(err, res, body) {
			body = JSON.parse(body)
			//console.log(body.statuses)
			
			expect(body.statuses[0].status).not.toBe('a changed status')
			var initStatus = body.statuses[0].status
			//console.log("Init status:",initStatus)

			// then change it into the test status
			request({
				url: url("/status/"),
				method: 'PUT',
				json: { "status": 'a changed status' }
			}, function(err, res, body2) {
				//console.log("after put status:",body2.statuses[0].status)
				expect(body2.statuses[0].status).toBe('a changed status')
				
				// then get it for another time, test if it is the same as the test status
				request({
					url: url("/status/"),
					method: 'GET'
				}, function(err, res, body3) {
					body3 = JSON.parse(body3)
					//console.log("then get another time:", body3.statuses[0].status)
		 			expect(body3.statuses[0].status).toBe("a changed status")
		 			// finally change the status back, let the status return to its initial state
		 			request({
						url: url("/status/"),
						method: 'PUT',
						json: { "status": initStatus }
					}, function(err, res, body4) {
						//console.log("Init status:",initStatus)
						//console.log("finally change it back:",body4.statuses[0].status)
						expect(1).toBe(1)
						expect(body4.statuses[0].status).toBe(initStatus)
						done()
					})
		 		})


			})
			
		
		})
	}, 300)

});
