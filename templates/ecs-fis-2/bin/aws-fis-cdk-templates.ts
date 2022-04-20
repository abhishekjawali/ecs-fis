#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { FIS } from "../lib/parent-stack";

const app = new cdk.App();
new FIS(app, "FISPa", {

  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION },

});
