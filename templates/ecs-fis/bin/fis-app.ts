#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { ECSFIS } from '../lib/ecs-fis-parent-stack';

const app = new cdk.App();

const fisEcs = new ECSFIS(app, 'ECSFIS', { 
    env: { 
        account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: process.env.CDK_DEFAULT_REGION 
    },    
    description: "This stack creates an ECS Cluster and FIS Experiment templates"
});