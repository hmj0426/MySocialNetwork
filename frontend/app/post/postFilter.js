angular.module('frontendApp')
	.filter('authorContentFilter', authorContentFilter);


function authorContentFilter() {
	return function(posts, text){
		if(!text){
			return posts;
		}
		return posts.filter(function(post){
			return post.body.match(text) || post.author.match(text);
		})
	}
}