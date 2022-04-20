import * as cdk from "@aws-cdk/core";
import ec2 = require("@aws-cdk/aws-ec2");
import { IVpc } from '@aws-cdk/aws-ec2';
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";
import * as autoscaling from "@aws-cdk/aws-autoscaling";
import * as iam from "@aws-cdk/aws-iam";

export class FisStackEcs extends cdk.Stack {
  public vpc: IVpc;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'FisVpc', {
      
      cidr: "10.0.0.0/16",
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "PublicSubnet1",
          subnetType: ec2.SubnetType.PUBLIC
        },
        {
          cidrMask: 24,
          name: "PublicSubnet2",
          subnetType: ec2.SubnetType.PUBLIC
        },
        {
          cidrMask: 24,
          name: "PublicSubnet3",
          subnetType: ec2.SubnetType.PUBLIC
        },
        {
          cidrMask: 24,
          name: "PrivateSubnet1",
          subnetType: ec2.SubnetType.PRIVATE
        },
        {
          cidrMask: 24,
          name: "PrivateSubnet2",
          subnetType: ec2.SubnetType.PRIVATE
        },
        {
          cidrMask: 24,
          name: "PrivateSubnet3",
          subnetType: ec2.SubnetType.PRIVATE
        },
      ]
    });

    const cluster = new ecs.Cluster(this, "Cluster", {
      vpc: this.vpc
    });

    const asg = new autoscaling.AutoScalingGroup(this, "EcsAsgProvider", {
      vpc: this.vpc,
      instanceType: new ec2.InstanceType("t3.medium"),
      machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
      desiredCapacity: 3
    });

    cluster.addAsgCapacityProvider(
      new ecs.AsgCapacityProvider(this, "CapacityProvider", {
        autoScalingGroup: asg,
        capacityProviderName: "fisWorkshopCapacityProvider",
        enableManagedTerminationProtection: false
      })
    );

    // Add SSM access policy to nodegroup
    asg.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"));

    const taskDefinition = new ecs.Ec2TaskDefinition(this, "SampleAppTaskDefinition", {
    });
    
    taskDefinition.addContainer("SampleAppContainer", {
      image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
      memoryLimitMiB: 256,
      portMappings: [
        {
          containerPort: 80,
          hostPort: 80
        }
      ]
    });

    const sampleAppService = new ecs_patterns.ApplicationLoadBalancedEc2Service(this, "SampleAppService", {
      cluster: cluster,
      cpu: 256,
      desiredCount: 1,
      memoryLimitMiB: 512,
      taskDefinition: taskDefinition
    });

    asg.attachToApplicationTargetGroup(sampleAppService.targetGroup);

    const ecsUrl = new cdk.CfnOutput(this, 'FisEcsUrl', {value: 'http://' + sampleAppService.loadBalancer.loadBalancerDnsName});
  }
}
