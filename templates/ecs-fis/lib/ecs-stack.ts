import * as cdk from "@aws-cdk/core";
import ec2 = require("@aws-cdk/aws-ec2");
import { IVpc } from '@aws-cdk/aws-ec2';
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";
import * as autoscaling from "@aws-cdk/aws-autoscaling";
import * as iam from "@aws-cdk/aws-iam";
import * as fis from '@aws-cdk/aws-fis';

export class FisStackEcs extends cdk.Stack {
  public vpc: IVpc;


  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //*** Begin VPC Block ***/ 
    this.vpc = new ec2.Vpc(this, 'FisVpc', {
      cidr: "10.0.0.0/16",
      maxAzs: 3
    });
    //*** End VPC Block ***/ 

    //*** Begin ECS Block ***/ 
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
    //*** End ECS Block ***/ 

    //*** Begin FIS Block ***/ 
    // FIS Role
    const fisrole = new iam.Role(this, "fis-role", {
      assumedBy: new iam.ServicePrincipal("fis.amazonaws.com", {
        conditions: {
          StringEquals: {
            "aws:SourceAccount": this.account,
          },
          ArnLike: {
            "aws:SourceArn": `arn:aws:fis:${this.region}:${this.account}:experiment/*`,
          },
        },
      }),
    });

    // AllowFISExperimentRoleECSReadOnly
    fisrole.addToPolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["ecs:ListContainerInstances", "ecs:DescribeClusters"],
      })
    );

    // AllowFISExperimentRoleECSUpdateState
    fisrole.addToPolicy(
      new iam.PolicyStatement({
        resources: [`arn:aws:ecs:*:*:container-instance/*`],
        actions: ["ecs:UpdateContainerInstancesState"],
      })
    );

    // AllowFISExperimentRoleEC2Actions
    fisrole.addToPolicy(
      new iam.PolicyStatement({
        resources: [`arn:aws:ec2:*:*:instance/*`],
        actions: [
          "ec2:RebootInstances",
          "ec2:StopInstances",
          "ec2:StartInstances",
          "ec2:TerminateInstances"
        ]
      })
    );

    //AllowFISExperimentRoleSSMReadOnly
    fisrole.addToPolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: [
          "ec2:DescribeInstances",
          "ssm:ListCommands",
          "ssm:CancelCommand",
          "ssm:PutParameter",
          "ssm:SendCommand"
        ],
      })
    );
    //*** End FIS Block ***/ 

    const ecsUrl = new cdk.CfnOutput(this, 'FisEcsUrl', { value: 'http://' + sampleAppService.loadBalancer.loadBalancerDnsName });

    // Outputs
    new cdk.CfnOutput(this, "FISIamRoleArn", {
      value: fisrole.roleArn,
      description: "The Arn of the IAM role",
      exportName: "FISIamRoleArn",
    });
  }
}
