#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { FisStackEcsVpc } from '../lib/fis-stack-vpc';
import { FisStackEcs } from '../lib/ecs-stack';
// import { FisStackAsg, FisStackAsgProps } from '../lib/fis-stack-asg';

const app = new cdk.App();

const fisEcsVpc = new FisStackEcsVpc(app, 'FisStackVpc', { 
    env: { 
        account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: process.env.CDK_DEFAULT_REGION 
    },    
    description: "AWS FIS workshop - VPC stack. Creates VPC referenced by all other workshop resources"
});
// const fisAsg = new FisStackAsg(app, 'FisAsgStack', { vpc: fisVpc.vpc});

const fisEcs = new FisStackEcs(app, 'FisStackECS', { 
    env: { 
        account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: process.env.CDK_DEFAULT_REGION 
    },    
    description: "AWS FIS workshop - VPC stack. Creates VPC referenced by all other workshop resources"
});