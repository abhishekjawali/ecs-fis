import * as cdk from "@aws-cdk/core";
import { ECSStack } from "./ecs-stack"

export class ECSFIS extends cdk.Stack {
  

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ECSStackCDK = new ECSStack(this, "ECSStack");

  }
};