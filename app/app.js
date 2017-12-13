var myApp = angular.module("MyApp", []);

myApp.controller("MyController", function($scope) {

  $scope.textSend = 'hello wamp';
  $scope.messages = [];
  $scope.rpc = false;
  $scope.subscribe = false;

  //The first socket connection
  var connection1 = new autobahn.Connection({
    url: 'ws://localhost:9090/pubsub',
    realm: 'realm1'
  });

  connection1.onopen = function(session) {
    $scope.messages.push("Successfully made the first socket connection.");
    $scope.$apply();

    function add2(args) {
      return args[0] + args[1];
    }

    // register a procedure for remoting
    session.register('com.myapp.add2', add2).then(
      function(registration) {
        $scope.rpc = true;
        console.log("registration", registration);
        $scope.messages.push("RPC Registration Success: " + registration.procedure);
        $scope.$apply();

      },
      function(error) {
        $scope.messages.push("RPC Registration Failure: " + error);
        $scope.$apply();
      }
    );

    //subscribe to a topic
    function onevent(args) {
       $scope.messages.push("Response to event com.myapp.hello: " + args[0]);
        $scope.$apply();
    }
    session.subscribe('com.myapp.hello', onevent).then(
      function(subscription) {
        $scope.subscribe = true;
        console.log("subscription", subscription);
        $scope.messages.push("Subscription Success: " + subscription.topic);
        $scope.$apply();

      },
      function(error) {
        $scope.messages.push("Subscription Failure: " + error);
        $scope.$apply();
      }
    );
  };

  connection1.open();

  connection1.onclose = function(reason, details) {
    $scope.messages.push("Connection 1 " + reason);
    $scope.$apply();
  };


  //The second socket connection
  var connection2 = new autobahn.Connection({
    url: 'ws://localhost:9090/pubsub',
    realm: 'realm1'
  });

  connection2.open();

  connection2.onopen = function(session) {
    $scope.messages.push("Successfully made the second socket connection.");
    $scope.$apply();
  };

  connection2.onclose = function(reason, details) {
    $scope.messages.push("Connection 2 " + reason);
    $scope.$apply();
  };

  $scope.makeRpcCall = function() {
    $scope.messages.push("Starting to make an RPC Call");

    //call a remote procedure
    connection2.session.call('com.myapp.add2', [2, 3]).then(
      function(res) {
        console.log("Result:", res);
        $scope.messages.push("RPC Call Result: " + res);
        $scope.$apply();
      },
      function(error) {
        $scope.messages.push("RPC Call Failure: " + error);
        $scope.$apply();
      }
    );
  };

  $scope.publishEvent = function(){
    $scope.messages.push("Starting to publish event");

    //publish an event
    connection2.session.publish('com.myapp.hello', [$scope.textSend], {}, {acknowledge: true}).then(
      function(res) {
        console.log("Result:", res);
        $scope.messages.push("Publish Event: " + res);
        $scope.$apply();
      },
      function(error) {
        $scope.messages.push("Publish Event Failure: " + error);
        $scope.$apply();
      }
    );
    
  }
  
  $scope.clear = function() {
    $scope.messages = [];
  };

});

