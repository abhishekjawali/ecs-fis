import * as cdk from "@aws-cdk/core";
import { FisStackEcs } from "./ecs-stack"

export class ECSFIS extends cdk.Stack {
  

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ECSStackCDK = new FisStackEcs(this, "ECSStack");

  }
};