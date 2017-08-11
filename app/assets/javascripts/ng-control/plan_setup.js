function PlanSetup ( $scope,   $http,   $attrs,   $cookies,   $sce,   $window ) {

  AQ.init($http);
  AQ.update = () => { $scope.$apply(); }
  AQ.confirm = (msg) => { return confirm(msg); }
  AQ.sce = $sce;

  $scope.snap = 16;
  $scope.last_place = 0;
  $scope.plan = AQ.Plan.record({operations: [], wires: [], status: "planning", name: "Untitled Plan"});

  $scope.ready = false;

  $scope.state = {
    sidebar: { op_types: false, plans: true }
  }

  AQ.User.current().then((user) => {

    $scope.current_user = user;
    $scope.getting_plans = true;    

    AQ.OperationType.all_fast(true).then((operation_types) => {

      $scope.operation_types = aq.where(operation_types,ot => ot.deployed);
      AQ.OperationType.compute_categories($scope.operation_types);
      AQ.operation_types = $scope.operation_types;

      AQ.Plan.where({status: ["planning", "template"], user_id: user.id}).then(plans => {

        $scope.plans = aq.where(plans, p => p.status == 'planning');
        $scope.templates = aq.where(plans, p => p.status == 'template');

        AQ.Plan.where({status: "system_template"}).then(templates => {

          $scope.system_templates = templates;

          AQ.get_sample_names().then(() =>  {

            if ( aq.url_params().plan_id ) {              
              AQ.Plan.load(aq.url_params().plan_id).then(p => {
                $window.history.replaceState(null, document.title, "/plans"); 
                $scope.plan = p;
                $scope.$apply();
              })
            } 

            $scope.ready = true;
            $scope.$apply();

          });  

        });

      });

    });
  });    

}