// 
// Here is how to define your module 
// has dependent on mobile-angular-ui
// 
var app = angular.module('MobileAngularUiExamples', [
  'ngRoute',
  'mobile-angular-ui',
  
  // touch/drag feature: this is from 'mobile-angular-ui.gestures.js'
  // it is at a very beginning stage, so please be careful if you like to use
  // in production. This is intended to provide a flexible, integrated and and 
  // easy to use alternative to other 3rd party libs like hammer.js, with the
  // final pourpose to integrate gestures into default ui interactions like 
  // opening sidebars, turning switches on/off ..
  'mobile-angular-ui.gestures'
]);

app.run(function($transform) {
  window.$transform = $transform;
});

// 
// You can configure ngRoute as always, but to take advantage of SharedState location
// feature (i.e. close sidebar on backbutton) you should setup 'reloadOnSearch: false' 
// in order to avoid unwanted routing.
// 
app.config(function($routeProvider) {
  $routeProvider.when('/',              {templateUrl: 'home.html', reloadOnSearch: false});
  $routeProvider.when('/TPolicy',    {templateUrl: 'TPolicy.html', reloadOnSearch: false});
  $routeProvider.when('/breakeven',    {templateUrl: 'breakeven.html', reloadOnSearch: false});
  $routeProvider.when('/setting',       {templateUrl: 'setting.html', reloadOnSearch: false});
  $routeProvider.when('/scroll',        {templateUrl: 'scroll.html', reloadOnSearch: false}); 
  $routeProvider.when('/toggle',        {templateUrl: 'toggle.html', reloadOnSearch: false}); 
  $routeProvider.when('/tabs',          {templateUrl: 'tabs.html', reloadOnSearch: false}); 
  $routeProvider.when('/accordion',     {templateUrl: 'accordion.html', reloadOnSearch: false}); 
  $routeProvider.when('/overlay',       {templateUrl: 'overlay.html', reloadOnSearch: false}); 
  $routeProvider.when('/forms',         {templateUrl: 'forms.html', reloadOnSearch: false});
  $routeProvider.when('/dropdown',      {templateUrl: 'dropdown.html', reloadOnSearch: false});
  $routeProvider.when('/touch',         {templateUrl: 'touch.html', reloadOnSearch: false});
  $routeProvider.when('/swipe',         {templateUrl: 'swipe.html', reloadOnSearch: false});
  $routeProvider.when('/drag',          {templateUrl: 'drag.html', reloadOnSearch: false});
  $routeProvider.when('/drag2',         {templateUrl: 'drag2.html', reloadOnSearch: false});
  $routeProvider.when('/carousel',      {templateUrl: 'carousel.html', reloadOnSearch: false});
});

// 
// `$touch example`
// 

app.directive('toucharea', ['$touch', function($touch){
  // Runs during compile
  return {
    restrict: 'C',
    link: function($scope, elem) {
      $scope.touch = null;
      $touch.bind(elem, {
        start: function(touch) {
          $scope.touch = touch;
          $scope.$apply();
        },

        cancel: function(touch) {
          $scope.touch = touch;  
          $scope.$apply();
        },

        move: function(touch) {
          $scope.touch = touch;
          $scope.$apply();
        },

        end: function(touch) {
          $scope.touch = touch;
          $scope.$apply();
        }
      });
    }
  };
}]);

//
// `$drag` example: drag to dismiss
//
app.directive('dragToDismiss', function($drag, $parse, $timeout){
  return {
    restrict: 'A',
    compile: function(elem, attrs) {
      var dismissFn = $parse(attrs.dragToDismiss);
      return function(scope, elem){
        var dismiss = false;

        $drag.bind(elem, {
          transform: $drag.TRANSLATE_RIGHT,
          move: function(drag) {
            if( drag.distanceX >= drag.rect.width / 4) {
              dismiss = true;
              elem.addClass('dismiss');
            } else {
              dismiss = false;
              elem.removeClass('dismiss');
            }
          },
          cancel: function(){
            elem.removeClass('dismiss');
          },
          end: function(drag) {
            if (dismiss) {
              elem.addClass('dismitted');
              $timeout(function() { 
                scope.$apply(function() {
                  dismissFn(scope);  
                });
              }, 300);
            } else {
              drag.reset();
            }
          }
        });
      };
    }
  };
});

//
// Another `$drag` usage example: this is how you could create 
// a touch enabled "deck of cards" carousel. See `carousel.html` for markup.
//
app.directive('carousel', function(){
  return {
    restrict: 'C',
    scope: {},
    controller: function() {
      this.itemCount = 0;
      this.activeItem = null;

      this.addItem = function(){
        var newId = this.itemCount++;
        this.activeItem = this.itemCount === 1 ? newId : this.activeItem;
        return newId;
      };

      this.next = function(){
        this.activeItem = this.activeItem || 0;
        this.activeItem = this.activeItem === this.itemCount - 1 ? 0 : this.activeItem + 1;
      };

      this.prev = function(){
        this.activeItem = this.activeItem || 0;
        this.activeItem = this.activeItem === 0 ? this.itemCount - 1 : this.activeItem - 1;
      };
    }
  };
});

app.directive('carouselItem', function($drag) {
  return {
    restrict: 'C',
    require: '^carousel',
    scope: {},
    transclude: true,
    template: '<div class="item"><div ng-transclude></div></div>',
    link: function(scope, elem, attrs, carousel) {
      scope.carousel = carousel;
      var id = carousel.addItem();
      
      var zIndex = function(){
        var res = 0;
        if (id === carousel.activeItem){
          res = 2000;
        } else if (carousel.activeItem < id) {
          res = 2000 - (id - carousel.activeItem);
        } else {
          res = 2000 - (carousel.itemCount - 1 - carousel.activeItem + id);
        }
        return res;
      };

      scope.$watch(function(){
        return carousel.activeItem;
      }, function(){
        elem[0].style.zIndex = zIndex();
      });
      
      $drag.bind(elem, {
        //
        // This is an example of custom transform function
        //
        transform: function(element, transform, touch) {
          // 
          // use translate both as basis for the new transform:
          // 
          var t = $drag.TRANSLATE_BOTH(element, transform, touch);
          
          //
          // Add rotation:
          //
          var Dx    = touch.distanceX, 
              t0    = touch.startTransform, 
              sign  = Dx < 0 ? -1 : 1,
              angle = sign * Math.min( ( Math.abs(Dx) / 700 ) * 30 , 30 );
          
          t.rotateZ = angle + (Math.round(t0.rotateZ));
          
          return t;
        },
        move: function(drag){
          if(Math.abs(drag.distanceX) >= drag.rect.width / 4) {
            elem.addClass('dismiss');  
          } else {
            elem.removeClass('dismiss');  
          }
        },
        cancel: function(){
          elem.removeClass('dismiss');
        },
        end: function(drag) {
          elem.removeClass('dismiss');
          if(Math.abs(drag.distanceX) >= drag.rect.width / 4) {
            scope.$apply(function() {
              carousel.next();
            });
          }
          drag.reset();
        }
      });
    }
  };
});

app.directive('dragMe', ['$drag', function($drag){
  return {
    controller: function($scope, $element) {
      $drag.bind($element, 
        {
          //
          // Here you can see how to limit movement 
          // to an element
          //
          transform: $drag.TRANSLATE_INSIDE($element.parent()),
          end: function(drag) {
            // go back to initial position
            drag.reset();
          }
        },
        { // release touch when movement is outside bounduaries
          sensitiveArea: $element.parent()
        }
      );
    }
  };
}]);


app.directive("delete",function($document){
  return{
    restrict:'AE',
    require: 'ngModel',
    link:function(scope, element, attrs,ngModel){
      element.bind("click",function(){
        var id = ngModel.$modelValue._id;
        //alert("delete item where breakEven id:=" + id);
        scope.$apply(function(){
          for(var i=0; i<scope.breakEvens.length; i++){
            if(scope.breakEvens[i]._id==id){
               console.log(scope.breakEvens[i]);
               scope.breakEvens.splice(i,1);
                storedb('breakEven').remove({"_id":id},function(err){
  
                })
            }
          }
          console.log(scope.breakEvens);
        })
      })
    }
  }
});

//
// For this trivial demo we have just a unique MainController 
// for everything
//
app.controller('MainController', function($rootScope, $scope){

  $scope.swiped = function(direction) {
    alert('Swiped ' + direction);
  };

  // User agent displayed in home page
  $scope.userAgent = navigator.userAgent;
  
  // Needed for the loading screen
  $rootScope.$on('$routeChangeStart', function(){
    $rootScope.loading = true;
  });

  $rootScope.$on('$routeChangeSuccess', function(){
    $rootScope.loading = false;
  });

  // Fake text i used here and there.
  $scope.lorem = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vel explicabo, aliquid eaque soluta nihil eligendi adipisci error, illum corrupti nam fuga omnis quod quaerat mollitia expedita impedit dolores ipsam. Obcaecati.';

  // 
  // 'Scroll' screen
  // 
  var scrollItems = [];

  for (var i=1; i<=100; i++) {
    scrollItems.push('Item ' + i);
  }

  $scope.scrollItems = scrollItems;

  $scope.bottomReached = function() {
    /* global alert: false; */
    alert('Congrats you scrolled to the end of the list!');
  };

  // 
  // Right Sidebar
  // 
  $scope.chatUsers = [
    { name: 'Carlos  Flowers', online: true },
    { name: 'Byron Taylor', online: true },
    { name: 'Jana  Terry', online: true },
    { name: 'Darryl  Stone', online: true },
    { name: 'Fannie  Carlson', online: true },
    { name: 'Holly Nguyen', online: true },
    { name: 'Bill  Chavez', online: true },
    { name: 'Veronica  Maxwell', online: true },
    { name: 'Jessica Webster', online: true },
    { name: 'Jackie  Barton', online: true },
    { name: 'Crystal Drake', online: false },
    { name: 'Milton  Dean', online: false },
    { name: 'Joann Johnston', online: false },
    { name: 'Cora  Vaughn', online: false },
    { name: 'Nina  Briggs', online: false },
    { name: 'Casey Turner', online: false },
    { name: 'Jimmie  Wilson', online: false },
    { name: 'Nathaniel Steele', online: false },
    { name: 'Aubrey  Cole', online: false },
    { name: 'Donnie  Summers', online: false },
    { name: 'Kate  Myers', online: false },
    { name: 'Priscilla Hawkins', online: false },
    { name: 'Joe Barker', online: false },
    { name: 'Lee Norman', online: false },
    { name: 'Ebony Rice', online: false }
  ];

  //
  // 'setting' screen
  //  

  $scope.alert_hide=true;
  var setting=  storedb('setting').find();
  if(setting!=""){
      $scope.setting=setting[0];
      setting=setting[0];
  }else{
      setting=$scope.setting={id:1,rates:0.00025,hsRates:0.001,tax:0.001,stopLoss:0.03,stopProfit:0.05};
      storedb('setting').insert($scope.setting,function(err,result){
      if(!err){
                $scope.tips="默认设置";
              } 
        }); 
  }
  
  $scope.setting_save = function() {
  storedb('setting').update({id:1},$scope.setting,function(err,result){
     if(!err){
            $scope.alert_hide=false;    
            $scope.tips="修改设置成功";
            setTimeout(function () {  
                $scope.$apply(function () {  
                    $scope.alert_hide = true;  
                });  
            }, 3000); 
          } 
    });
    
  };

//breakEven
  $scope.Params={};
  $scope.Params.breakEvenRememberMe = true;
  $scope.breakEven={exchangePlace:"上海A股"};
  $scope.breakEvens=storedb('breakEven').find();
  //var breakEven=  storedb('breakEven').find();
  $scope.breakEven_cal = function() {
      console.log(setting);
      var guohufei=0;
      if($scope.breakEven.exchangePlace=="上海A股"){
        guohufei=$scope.breakEven.buyCount<=1000?1:$scope.breakEven.buyCount*setting.hsRates;
     }
      if($scope.breakEven.buyPrice*$scope.breakEven.buyCount*setting.rates<=5){//佣金小于最低收费标准按最低收费标准算
         
          $scope.breakEven.BEPrice=($scope.breakEven.buyPrice*$scope.breakEven.buyCount+5*2+guohufei*2)/((1-setting.tax)*$scope.breakEven.buyCount);//保本
          $scope.breakEven.SLPrice=($scope.breakEven.buyPrice*$scope.breakEven.buyCount*(1-setting.stopLoss)+5*2+guohufei*2)/((1-setting.tax)*$scope.breakEven.buyCount);//止损
          $scope.breakEven.SPPrice=($scope.breakEven.buyPrice*$scope.breakEven.buyCount*(1+setting.stopProfit)+5*2+guohufei*2)/((1-setting.tax)*$scope.breakEven.buyCount);//止盈
      }else{
           $scope.breakEven.BEPrice=($scope.breakEven.buyPrice*$scope.breakEven.buyCount*(1+setting.rates)+guohufei*2)/((1-setting.tax-setting.rates)*$scope.breakEven.buyCount);
           $scope.breakEven.SLPrice=($scope.breakEven.buyPrice*$scope.breakEven.buyCount*(1+setting.rates-setting.stopLoss)+guohufei*2)/((1-setting.tax-setting.rates)*$scope.breakEven.buyCount);
           $scope.breakEven.SPPrice=($scope.breakEven.buyPrice*$scope.breakEven.buyCount*(1+setting.rates+setting.stopProfit)+guohufei*2)/((1-setting.tax-setting.rates)*$scope.breakEven.buyCount);
      }
      $scope.breakEven.BEPrice=$scope.breakEven.BEPrice.toFixed(3);
      $scope.breakEven.SLPrice=$scope.breakEven.SLPrice.toFixed(3);
      $scope.breakEven.SPPrice=$scope.breakEven.SPPrice.toFixed(3);
      //alert($scope.breakEven.BEPrice);
      if($scope.Params.breakEvenRememberMe){
          breakEven_save();
      }
    
  };
  var breakEven_save = function() {
      storedb('breakEven').insert(angular.copy($scope.breakEven),function(err,result){
      if(!err){
                //$scope.tips="默认设置";
                 $scope.breakEvens.push(result);
              } 
        }); 
    
  };


//TPolicy
  $scope.Params.RememberMe = true;
  $scope.TPolicy={exchangePlace:"上海A股",operate:"卖"};
  $scope.TPolicys=storedb('TPolicy').find();
  $scope.models=[{name:"卖"},{name:"买"}];
  //var breakEven=  storedb('breakEven').find();
  $scope.TPolicy_cal = function() {
     console.log($scope.Params);
      var guohufei=0;
      if($scope.TPolicy.exchangePlace=="上海A股"){
        guohufei=$scope.Params.sellCount<=1000?1:$scope.Params.sellCount*setting.hsRates;
     }
      if($scope.TPolicy.operate=="卖"){
          $scope.TPolicy.sellCount=0-$scope.Params.sellCount;
      }else{
          $scope.TPolicy.sellCount=$scope.Params.sellCount;
      }


      console.log($scope.TPolicy);
      $scope.TPolicy.CostCount=$scope.TPolicy.currentCount+$scope.TPolicy.sellCount;
      if($scope.TPolicy.CostCount<=0){
          alert("卖出股票数量要小于持有数量额");
          return;
      }
      if(Math.abs($scope.TPolicy.sellPrice*$scope.TPolicy.sellCount*setting.rates)<=5){//佣金小于最低收费标准按最低收费标准算
          $scope.TPolicy.CostPrice=($scope.TPolicy.currentPrice*$scope.TPolicy.currentCount+$scope.TPolicy.sellPrice*$scope.TPolicy.sellCount+$scope.TPolicy.sellPrice*$scope.Params.sellCount*setting.tax+guohufei+5)/$scope.TPolicy.CostCount;
      }else{
         $scope.TPolicy.CostPrice=($scope.TPolicy.currentPrice*$scope.TPolicy.currentCount+$scope.TPolicy.sellPrice*$scope.TPolicy.sellCount+$scope.TPolicy.sellPrice*$scope.Params.sellCount*(setting.tax+setting.rates)+guohufei)/$scope.TPolicy.CostCount;

      }
      $scope.TPolicy.CostPrice=$scope.TPolicy.CostPrice.toFixed(3);
      if($scope.Params.RememberMe){
       
         TPolicy_save();
      }
    
  };
var TPolicy_save = function() {
      storedb('TPolicy').insert(angular.copy($scope.TPolicy),function(err,result){
      if(!err){
                //$scope.tips="默认设置";
                   $scope.TPolicys.push(result);
              } 
        }); 
    
  };
  $scope.TPolicy_delete = function(id) {
       for(var i=0; i<$scope.TPolicys.length; i++){
            if($scope.TPolicys[i]._id==id){
               console.log($scope.TPolicys[i]);
                $scope.TPolicys.splice(i,1);
                storedb('TPolicy').remove({"_id":id},function(err){
  
                })
            }
          }
    
  };

  // 
  // 'Drag' screen
  // 
  $scope.notices = [];
  
  for (var j = 0; j < 10; j++) {
    $scope.notices.push({icon: 'envelope', message: 'Notice ' + (j + 1) });
  }

  $scope.deleteNotice = function(notice) {
    var index = $scope.notices.indexOf(notice);
    if (index > -1) {
      $scope.notices.splice(index, 1);
    }
  };
});