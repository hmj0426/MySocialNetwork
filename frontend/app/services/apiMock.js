
;(function(jasmine) { 	
	var $q
	var promises = []

	function init(_$q_) {
		$q = _$q_
	}

	function makePromise(response) {
		var p = $q.defer()
		promises.push({ promise: p, response: response })
		return { $promise: p.promise }  
	}

	var mockApiService =  {
		login: function(){
			return makePromise(
				{ username:'mengjin', result:'success' }
			)
		},

		logout: function(){
			return makePromise(
				 'OK'   
			)
		},

		getStatus: function() {
			return makePromise(
				{ statuses: [{username:'mengjin', status:'Test Status'}] }
			)
		},

		setStatus: function() {
			return makePromise(
				{ username:'mengjin', status:'A new status message' }
			)
		},

		getImg: function() {
			return makePromise(
				{ username: 'mengjin', picture: 'http://www.freelanceme.net/Images/default%20profile%20picture.png' }
			)
		},

		getPosts: function() {   
			return makePromise( 
				{"posts":[{"id":3089592,
							"body":"First existed post!",
							"date":"2015-09-07T16:48:09.470Z",
							"img":"http://lorempixel.com/389/200/",
							"comments":[{"commentId":6739531,
										 "author":"cl40",
										 "date":"2015-10-26T15:01:48.161Z",
										 "body":"ac metus. Ut t amet eros. Proin magna. Duis "},
										{"commentId":8686503,
										 "author":"mengjin",
										 "date":"2015-10-22T22:55:34.497Z",
										 "body":"jug of bad milk. A veinx zippy fowls."
										}],
							"author":"mengjin"
						}]
				})
		},

		editPosts: function() {
			return makePromise(
				{"posts":[{"id":3089592,
							"body":"It is a editedPost!",
							"date":"2015-09-07T16:48:09.470Z",
							"img":"http://lorempixel.com/389/200/",
							"comments":[{"commentId":6739531,
										 "author":"cl40",
										 "date":"2015-10-26T15:01:48.161Z",
										 "body":"ac metus. Ut t amet eros. Proin magna. Duis "},
										{"commentId":8686503,
										 "author":"mengjin",
										 "date":"2015-10-22T22:55:34.497Z",
										 "body":"A edited comment."},
										 {"commentId":2729383,
										 "author":"mengjin",
										 "date":"2015-10-22T22:55:34.497Z",
										 "body":"A new comment."}
										 ],
							"author":"mengjin"
						}]
				})
		},

		addPosts: function() {
			return makePromise(
				{"posts":[{"id":8765467,
							"body":"It is a addPost!",
							"date":"2015-09-07T16:48:09.470Z",
							"img":"http://lorempixel.com/389/200/",
							"comments":[{"commentId":6739531,
										 "author":"cl40",
										 "date":"2015-10-26T15:01:48.161Z",
										 "body":"ac metus. Ut t amet eros. Proin magna. Duis "},
										{"commentId":8686503,
										 "author":"mengjin",
										 "date":"2015-10-22T22:55:34.497Z",
										 "body":"jug of bad milk. A veinx zippy fowls."
										}],
							"author":"mengjin"
						}]
				})
		}
	}

	var resolveTestPromises = function(rootScope) {
		promises.forEach(function(p) {
			p.promise.resolve(p.response)
		})
		promises.length = 0
		rootScope.$apply()  
	}

	jasmine.helper = {
		init: init,
		mockApiService: mockApiService,
		resolveTestPromises: resolveTestPromises
	}

})(window.jasmine)