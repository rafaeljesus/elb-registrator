var _ = require("lodash");
var async = require("async");
var AWS = require("aws-sdk");

var elb = new AWS.ELB(_.defaults({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION
}, {
    region: "us-east-1"
}));

var ec2 = new AWS.EC2(_.defaults({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION
}, {
    region: "us-east-1"
}));

setInterval(function(){
    async.waterfall([
        function(fn){
            var options = {
              LoadBalancerNames: [
                process.env.ELB_NAME
              ]
            }

            elb.describeLoadBalancers(options, function(err, response){
                if(err)
                    return fn(err);

                var loadbalancer = _.find(response.LoadBalancerDescriptions, function(lb){
                    return lb.LoadBalancerName == process.env.ELB_NAME;
                });

                if(_.isUndefined(loadbalancer))
                    return fn(new Error("ELB not found!"));

                return fn(undefined, loadbalancer.Subnets);
            });
        },
        function(subnets, fn){
            var options = {
              Filters: [
                {
                  Name: "subnet-id",
                  Values: subnets
                }
              ]
            }

            ec2.describeInstances(options, function(err, response){
                if(err)
                    return fn(err);
                else{
                    var instances = _.map(response.Reservations, function(reservation){
                        return _.map(reservation.Instances, "InstanceId");
                    });

                    return fn(undefined, _.flatten(instances))
                }
            });
        },
        function(instances, fn){
            var options = {
              LoadBalancerName: process.env.ELB_NAME
            }

            options.Instances = _.map(instances, function(instance_id){
                return { InstanceId: instance_id };
            });

            elb.registerInstancesWithLoadBalancer(options, fn);
        }
    ], function(err, response){
        if(err)
            process.stderr.write(err.message);
    });
}, process.env.REGISTRATION_INTERVAL || 60000);
