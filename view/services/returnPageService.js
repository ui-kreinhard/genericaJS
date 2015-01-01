app.service('returnPageService', function($location) {
    var returnToPage = '/';
    this.setReturnPage = function() {
       returnToPage = $location.path();        
    };
    
    this.goToReturnPage = function() {
      $location.path(returnToPage);
    };
});
