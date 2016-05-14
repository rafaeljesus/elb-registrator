import test from 'ava'
import nock from 'nock'

import {
  describeLoadBalancers,
  describeInstances,
  registerInstancesWithLoadBalancer
} from '../lib/aws'

test.before(() => {
  nock('https://elasticloadbalancing.us-east-1.amazonaws.com')
  .post('/', (body) => true)
  .reply(200, {
    LoadBalancerDescriptions: 'foo_elb_name',
    Subnets: ['sub-net-pub', 'sub-net-pvt']
  })
})

test.after(nock.cleanAll)

test('.describeLoadBalancers', async (t) => {
  const subnets = await describeLoadBalancers()
  t.truthy(subnets.length === 2)
})

test.skip('.describeInstances', async (t) => {
  const fakeSubnets = [{}]
  const instances = await describeInstances(fakeSubnets)
  t.truthy(instances)
})

test.skip('.registerInstancesWithLoadBalancer', async (t) => {
  const fakeInstances = [{}]
  const res = await registerInstancesWithLoadBalancer(fakeInstances)
  t.truthy(res)
})
