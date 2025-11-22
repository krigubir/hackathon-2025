import { createFileRoute } from "@tanstack/react-router";
import { StopCaptcha } from "./captcha.stop";

export const Route = createFileRoute("/captcha/ethos")({
  component: EthosGateway,
});

function EthosGateway() {
  return <StopCaptcha />;
}
