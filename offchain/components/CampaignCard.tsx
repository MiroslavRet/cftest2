import { CampaignUTxO } from "./contexts/campaign/CampaignContext";

import { title } from "./primitives";
import { Badge } from "@nextui-org/badge";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { Slider } from "@nextui-org/slider";
import { Snippet } from "@nextui-org/snippet";

export default function CampaignCard(props: { campaign: CampaignUTxO; hasActions?: boolean; actionButtons?: JSX.Element }) {
  const { campaign, hasActions, actionButtons } = props;
  const { CampaignInfo } = campaign;

  return (
    <Badge
      // Campaign State: Running | Cancelled | Finished
      variant="shadow"
      className="!-top-1.5 !-right-3 animate-bounce"
      showOutline={false}
      content={<span className="font-bold text-xs px-2 py-1">{CampaignInfo.data.state}</span>}
      color={
        CampaignInfo.data.state === "Running"
          ? "primary"
          : CampaignInfo.data.state === "Cancelled"
            ? "danger"
            : CampaignInfo.data.state === "Finished"
              ? "success"
              : "default"
      }
    >
      <Card id="campaign">
        {/* Campaign Info: Name, Deadline, Goal */}
        <CardHeader className="flex gap-3 w-full">
          <div className="flex flex-col gap-1 w-full">
            <p className={title({ size: "sm" })}>{CampaignInfo.data.name}</p>
            <p className="text-medium text-default-500">
              <label htmlFor="deadline">Deadline: </label>
              <span id="deadline">{`${CampaignInfo.data.deadline.toDateString()} ${CampaignInfo.data.deadline.toLocaleTimeString()}`}</span>
            </p>
            <Slider
              label="Goal"
              showTooltip={CampaignInfo.data.state !== "Finished"}
              tooltipProps={{
                content: Intl.NumberFormat(navigator.languages, { style: "currency", currency: "ADA" }).format(CampaignInfo.data.support.ada),
                placement: "bottom",
                offset: 1.5,
              }}
              formatOptions={{ style: "currency", currency: "ADA" }}
              value={CampaignInfo.data.goal} // goal
              maxValue={
                CampaignInfo.data.state === "Finished" || CampaignInfo.data.support.ada > CampaignInfo.data.goal
                  ? CampaignInfo.data.goal
                  : CampaignInfo.data.support.ada > 0
                    ? CampaignInfo.data.goal ** 2 / CampaignInfo.data.support.ada
                    : Number.POSITIVE_INFINITY
              }
              minValue={0}
              renderThumb={(props) => (
                // <div {...props} className="p-1 top-1/2 bg-primary rounded-full">
                //   <span className="transition-transform bg-background rounded-full size-3 block" />
                // </div>
                <div {...props} className="top-1/2">
                  <label className="text-3xl drop-shadow">🔥</label>
                </div>
              )}
              className="mt-4 mb-2"
            />
          </div>
        </CardHeader>

        {/* Campaign ID */}
        <Divider />
        <CardBody>
          <label htmlFor="campaign-id" className="text-sm mt-2">
            Campaign ID:
          </label>
          <Snippet id="campaign-id" hideSymbol variant="bordered" className="border-none">
            {CampaignInfo.id}
          </Snippet>
        </CardBody>

        {/* Campaign Actions */}
        {hasActions && (
          <>
            <Divider />
            <CardFooter className="flex justify-end">{actionButtons}</CardFooter>
          </>
        )}
      </Card>
    </Badge>
  );
}
