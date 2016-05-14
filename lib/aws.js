import AWS from 'aws-sdk'
import {
  defaults,
  isUndefined,
  flatten,
  map
} from 'lodash'

const sdkOptions = defaults({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION
}, {
  region: 'us-east-1'
})

const elb = new AWS.ELB(sdkOptions)
const ec2 = new AWS.EC2(sdkOptions)
const ELB_NAME = process.env.ELB_NAME

export function describeLoadBalancers () {
  return new Promise((resolve, reject) => {
    const options = {
      LoadBalancerNames: [ELB_NAME]
    }

    elb.describeLoadBalancers(options, (err, response) => {
      if (err) return reject(err)

      const loadbalancer = response.LoadBalancerDescriptions.find((lb) =>
        lb.LoadBalancerName === ELB_NAME
      )

      if (isUndefined(loadbalancer)) {
        return reject('ELB not found!')
      }

      resolve(loadbalancer.Subnets)
    })
  })
}

export function describeInstances (subnets) {
  return new Promise((resolve, reject) => {
    const options = {
      Filters: [
        {
          Name: 'subnet-id',
          Values: subnets
        }
      ]
    }

    ec2.describeInstances(options, (err, response) => {
      if (err) return reject(err)
      resolve(flatten(map(response.Reservations, (reservation) =>
        map(reservation.Instances, 'InstanceId')
      )))
    })
  })
}

export function registerInstancesWithLoadBalancer (instances) {
  return new Promise((resolve, reject) => {
    const options = {
      LoadBalancerName: ELB_NAME,
      Instances: map(instances, (id) => ({ InstanceId: id }))
    }

    elb.registerInstancesWithLoadBalancer(options, (err, response) =>
      err ? reject(err) : resolve(response)
    )
  })
}
