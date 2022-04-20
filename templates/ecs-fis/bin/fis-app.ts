#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { FisStackEcs } from '../lib/ecs-stack';

const app = new cdk.App();

const fisEcs = new FisStackEcs(app, 'FisStackECS', { 
    env: { 
        account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: process.env.CDK_DEFAULT_REGION 
    },    
    description: "This stack creates an ECS Cluster and FIS Experiment templates"
});