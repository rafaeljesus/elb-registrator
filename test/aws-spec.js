import test from 'ava'
import nock from 'nock'

import {
  describeLoadBalancers,
  describeInstances,
  registerInstancesWithLoadBalancer
} from '../lib/aws'

test.before(() => {
  nock('https://elasticloadbalancing.us-east-1.amazonaws.com')
  .post('/', () => true)
  .reply(200, {
    LoadBalancerDescriptions: 'foo_elb_name',
    Subnets: ['sub-net-pub', 'sub-net-pvt']
  })
  nock('https://ec2.us-east-1.amazonaws.com')
  .post('/', () => true)
  .reply(200, {
    Reservations: [{
      Instances: [
        { InstanceId: 1 },
        { InstanceId: 2 }
      ]
    }]
  })
})

test.after(nock.cleanAll)

test.skip('should describe load balancers', async (t) => {
  const subnets = await describeLoadBalancers()
  t.truthy(subnets.length === 2)
})

test.skip('should describe instances', async (t) => {
  const fakeSubnets = ['sub-net-pub', 'sub-net-pvt']
  const instances = await describeInstances(fakeSubnets)
  t.truthy(instances.length === 2)
})

test.skip('should register instances with load balancer', async (t) => {
  const fakeInstances = [{}]
  const res = await registerInstancesWithLoadBalancer(fakeInstances)
  t.truthy(res)
})
