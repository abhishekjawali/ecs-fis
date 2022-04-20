import * as ec2 from '@aws-cdk/aws-ec2';
import { IVpc } from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';

export class FisStackEcsVpc extends cdk.Stack {
  public vpc: IVpc;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
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

    new cdk.CfnOutput(this, 'FisVpcId', { value: this.vpc.vpcId });
  

  }
}
