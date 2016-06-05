import {
  describeLoadBalancers,
  describeInstances,
  registerInstancesWithLoadBalancer
} from './lib/aws'

const interval = process.env.REGISTRATION_INTERVAL || 60000

setInterval(run, interval)

async function run () {
  try {
    const subnets = await describeLoadBalancers()
    const instances = await describeInstances(subnets)
    await registerInstancesWithLoadBalancer(instances)
  } catch (err) {
    process.stderr.write(err.message)
  }
}

