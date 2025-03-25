import { SetMetadata } from "@nestjs/common";
import { SKIP_APPROVE } from "../constants";

export const SkipApprove = () => SetMetadata(SKIP_APPROVE, true);
